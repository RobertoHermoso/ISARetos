'use strict';

var rp = require('request-promise');
var Promise = require('bluebird');
const logger = require('../logger');
var url = require('url');

var issuesCache = new Map();

function getMeasure(measure) {
    return new Promise((resolve, reject) => {
      if (measure.substr(0, 4) === 'http') {
        logger.info('Using external measure');
        rp({
          uri: url.parse(measure)
        }).then((body) => {
          resolve(JSON.parse(body));
        });
      } else {
        resolve(JSON.parse(measure));
      }
    });
  }

function sendRequest(query) {
  return new Promise((resolve, reject) => {
    rp({
      method: 'POST',
      uri: 'https://api.github.com/graphql',
      headers: {
        'Authorization': 'bearer e32b8d8f2ead4e4b85839fa70c9300d88382b615',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
        'Accept': 'application/vnd.github.starfox-preview+json'
      },
      body: {
        query: query
      },
      json: true
    }).then(body => {
      if (body.data.rateLimit.remaining < 100) {
        logger.warning('API rate limit is almost exceeded');
        var sleeptime = (new Date(body.data.rateLimit.resetAt) - new Date()) + 60000;
        logger.warning('Sleeping for ' + sleeptime + ' milliseconds');
        setTimeout(() => {
          resolve(body);
        }, sleeptime);
      } else {
        resolve(body);
      }
    });
  });
}

function getIssues(owner, name, project, periodInfo, offset) {
  return new Promise((resolve, reject) => {
    var idRequest = owner + '--' + name + '--' + project + '--' + periodInfo.end + '--' + offset;
    if (issuesCache.get(idRequest)) {
      logger.info('Using cached issues');
      resolve(issuesCache.get(idRequest));
    } else {
      logger.info('Retrieving issues...');
      var query = `query {
        rateLimit {
          remaining
          resetAt
        }
        repository(owner: "` + owner + `", name: "` + name + `") {
          projects(first: 50) {
            nodes {
              name
              columns(first: 20) {
                nodes {
                  cards(first: 100) {
                    totalCount
                    nodes {
                      column {
                        name
                      }
                      content {
                        ... on Issue {
                          url
                          number
                          title
                          createdAt
                          updatedAt
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }`;
      sendRequest(query).then(data => {
        var foundProject = data.data.repository.projects.nodes.find(proj => proj.name === project);
        if (!foundProject) {
          issuesCache.set(idRequest, []);
          resolve([]);
        } else {
          var columns = foundProject.columns.nodes;
          var issues = [];
          columns.forEach(column => {
            issues.push(...column.cards.nodes);
          });
          var offsetIssues = [];
          var promises = [];
          issues.forEach(issue => {
            promises.push(new Promise((resolve2, reject2) => {
              var detailsQuery = `query {
                rateLimit {
                  remaining
                  resetAt
                }
                repository(owner: "` + owner + `", name: "` + name + `") {
                  issue(number: ` + issue.content.number + `) {
                    labels(first: 10) {
                      nodes {
                        name
                      }
                    }
                    assignees(first: 10) {
                      nodes {
                        name
                        login
                      }
                    }
                  }
                }
              }`;
              sendRequest(detailsQuery).then(detailedData => {
                issue.title = issue.content.title;
                issue.createdAt = issue.content.createdAt;
                issue.state = issue.column.name;
                issue.number = issue.content.number;
                issue.url = issue.content.url;
                issue.content.labels = detailedData.data.repository.issue.labels;
                var type = issue.content.labels.nodes.find(label => label.name.substr(0, 2) === 't_');
                if (type) issue.type = type.name.substr(2, type.name.length);
                var estimate = issue.content.labels.nodes.find(label => label.name.substr(label.name.length - 2, label.name.length) === '_p');
                if (estimate) issue.estimate = parseInt(estimate.name.substr(0, estimate.name.length - 2))
                issue.content.assignees = detailedData.data.repository.issue.assignees;
                if (offset !== 0) {
                  var offsetDate = new Date(periodInfo.end);
                  offsetDate.setDate(offsetDate.getDate() + offset);
                  getTransitions(owner, name, issue).then(transData => {
                    transData = transData.reverse();
                    var firstTrans = transData.find(trans => new Date(trans['createdAt']) <= offsetDate);
                    if (firstTrans) {
                      issue.state = firstTrans.projectColumnName;
                      issue.column.name = firstTrans.projectColumnName;
                      offsetIssues.push(issue);
                    }
                    resolve2();
                  })
                } else {
                  resolve2();
                }
              });
            }));
          });
          Promise.all(promises).then(() => {
            if (offset !== 0) {
              issuesCache.set(idRequest, offsetIssues);
              resolve (offsetIssues);
            } else {
              issuesCache.set(idRequest, issues);
              resolve(issues);
            }
          });
        }
      });
    }
  });
}

function getTransitions(owner, name, issue) {
  return new Promise((resolve, reject) => {
    if (issue.transitions) {
      resolve(issue.transitions);
    } else {
      var transitions = [];
      transitions.push({
        createdAt: issue.createdAt,
        projectColumnName: 'To do'        
      });
      var query = `query {
        rateLimit {
          remaining
          resetAt
        }
        repository(owner: "` + owner + `", name: "` + name + `") {
          issue(number: ` + issue.content.number + `) {
            timelineItems(first: 250) {
              totalCount
              nodes {
                ... on MovedColumnsInProjectEvent {
                  createdAt
                  previousProjectColumnName
                  projectColumnName
                }
              }
            }
          }
        }
      }`;
      sendRequest(query).then(data => {
        var timelineItems = data.data.repository.issue.timelineItems;
        transitions.push(...timelineItems.nodes);
        if (timelineItems.totalCount > 250) {
          var promises = [];
          for (var i = 250; i < timelineItems.totalCount; i += 250) {
            promises.push(new Promise((resolve2, reject2) => {
              var pagedQuery = `query {
                rateLimit {
                  remaining
                  resetAt
                }
                repository(owner: "` + owner + `", name: "` + name + `") {
                  issue(number: ` + issue.content.number + `) {
                    timelineItems(skip: ` + i + `, first: 250) {
                      nodes {
                        ... on MovedColumnsInProjectEvent {
                          createdAt
                          previousProjectColumnName
                          projectColumnName
                        }
                      }
                    }
                  }
                }
              }`;
              sendRequest(pagedQuery).then(pagedData => {
                transitions.push(...pagedData.data.repository.issue.timelineItems.nodes);
                resolve2();
              });
            }));
          }
          Promise.all(promises).then(() => {
            transitions = transitions.filter(transition => transition.hasOwnProperty('createdAt'));
            issue.transitions = transitions;
            resolve(transitions);
          });
        } else {
          transitions = transitions.filter(transition => transition.hasOwnProperty('createdAt'));
          issue.transitions = transitions;
          resolve(transitions);
        }
      })
    }
  });
}

function filterTransition(filters, issues, owner, name, periodInfo) {
  return new Promise((resolve, reject) => {
    if (Object.getOwnPropertyNames(filters).includes('transition')) {
      logger.info('Using transition filter');
      var transitionParams = filters['transition'];
      var filtered = [];
      var promises = [];
      issues.forEach(issue => {
        promises.push(new Promise((resolve2, reject2) => {
          getTransitions(owner, name, issue).then(data => {
            data.sort((is1, is2) => {
              return new Date(is1['createdAt']) >= new Date(is2['createdAt']) ? 1 : -1;
            });
            var isDuration = false;
            var isBefAft = false;
            var durations = [];
            if (transitionParams.duration) {
              logger.info('Duration filter used');
              var fromStates = transitionParams.fromState.split(',');
              fromStates = getCorrectStates(fromStates);
              var toStates = transitionParams.toState.split(',');
              toStates = getCorrectStates(toStates);
              fromStates.forEach(fromState => {
                toStates.forEach(toState => {
                  var fromTrans = data.find(trans => trans.projectColumnName === fromState.trim());
                  var toTrans = data.find(trans => trans.projectColumnName === toState.trim());
                  if (fromTrans && toTrans) {
                    var fromDate = fromTrans['createdAt'];
                    var toDate = toTrans['createdAt'];
                    var minutes = (new Date(toDate) -  new Date(fromDate)) / 60000;
                    if (eval('minutes' + transitionParams.duration)) durations.push(minutes);
                  }
                });
              });
              if (durations.length !== 0) isDuration = true;
            } else {
              isDuration = true;
            }
            if (transitionParams.before !== undefined || transitionParams.after !== undefined) {
              logger.info('Before/after filter used');
              var toStates = transitionParams.toState.split(',');
              toStates = getCorrectStates(toStates);
              var isBefore = false;
              var isAfter = false;
              toStates.forEach(toState => {
                var toTrans = data.find(trans => trans.projectColumnName === toState.trim());
                if (toTrans) {
                  var toDate = new Date(toTrans['createdAt']);
                  if (transitionParams.before !== undefined) {
                    var befDate = new Date(periodInfo.initial);
                    befDate.setMinutes(befDate.getMinutes() + transitionParams.before);
                    if (toDate < befDate) isBefore = true;
                  }
                  if (transitionParams.after !== undefined) {
                    var aftDate = new Date(periodInfo.initial);
                    aftDate.setMinutes(aftDate.getMinutes() + transitionParams.after);
                    if (toDate > aftDate) isAfter = true;
                  }
                }
              });
              if ((transitionParams.before !== undefined && transitionParams.after !== undefined && isBefore && isAfter) ||
              (transitionParams.before !== undefined && transitionParams.after === undefined && isBefore) ||
              (transitionParams.after !== undefined && transitionParams.before === undefined && isAfter)) isBefAft = true;
            } else {
              isBefAft = true;
            }
            if (isDuration && isBefAft) filtered.push(issue);
            resolve2();
          });
        }));
      });
      Promise.all(promises).then(() => {
        resolve(filtered);
      });
    } else {
      resolve(issues);
    }
  });
}

function getCollaborators(owner, name) {
  return new Promise((resolve, reject) => {
    var query = `query {
      rateLimit {
        remaining
        resetAt
      }
      repository(owner: "` + owner + `", name: "` + name + `") {
        collaborators(first: 100) {
          nodes {
            name
            login
          }
        }
      }
    }`;
    sendRequest(query).then(data => {
      resolve(data.data.repository.collaborators.nodes);
    });
  });
}

function getProject(filters, element, owner, name, project, periodInfo, offset) {
  return new Promise((resolve, reject) => {
    getIssues(owner, name, project, periodInfo, offset).then(data => {
      applyFilters(filters, data, owner, name, periodInfo).then(filtered => {
        getElement(element, filtered, owner, name, periodInfo).then(elemData => {
          var toReturn = {
            scope: {
              owner: owner,
              name: name,
              project: project
            },
            period: {
              from: periodInfo.initial,
              to : periodInfo.end
            },
            evidences: elemData.issues,
            value: elemData.value
          };
          resolve(toReturn);
        });
      });
    });
  });
}

function getMember(filters, element, member, owner, name, project, periodInfo, offset) {
  return new Promise((resolve, reject) => {
    getIssues(owner, name, project, periodInfo, offset).then(data => {
      applyFilters(filters, data, owner, name, periodInfo).then(filtered => {
        filtered = filtered.filter(issue => issue.content.assignees.nodes.find(assignee => assignee.login === member));
        getElement(element, filtered, owner, name, periodInfo).then(elemData => {
          var toReturn = {
            scope: {
              member: member,
              owner: owner,
              name: name,
              project: project
            },
            period: {
              from: periodInfo.initial,
              to : periodInfo.end
            },
            evidences: elemData.issues,
            value: elemData.value
          };
          resolve(toReturn);
        });
      });
    });
  });
}

function getAllMembers(filters, element, owner, name, project, periodInfo, offset) {
  return new Promise((resolve, reject) => {
    getCollaborators(owner, name).then(collaborators => {
      var promises = [];
      var toReturn = [];
      collaborators.forEach(collaborator => {
        //if (collaborator.login !== 'raffrearaUS') {
          promises.push(new Promise((resolve, reject) => {
            return getMember(filters, element, collaborator.login, owner, name, project, periodInfo, offset)
            .then((data) => {
              toReturn.push(data);
              resolve();
            });
          }));
        //}
      });
      Promise.all(promises).then(() => {
        resolve(toReturn);
      });
    });
  });
}

function getElement(element, issues, owner, name, periodInfo) {
  return new Promise((resolve, reject) => {
    var elemData = {
      issues: issues,
      value: 0
    }
    if (element === 'number') {
      elemData.value = issues.length;
      resolve(elemData);
    } else if (element === 'issues') {
      elemData.value = issues;
      resolve(elemData);
    } else if (element === 'points') {
      elemData.value = issues.map(datIssue => datIssue.estimate || 0).reduce((a, b) => a + b, 0);
      resolve(elemData);
    } else if (typeof element === 'object') {
      if (Object.getOwnPropertyNames(element)[0] === 'percentage') {
        var filters = element.percentage;
        var prefilteredIssues = issues.slice();
        applyFilters(filters, prefilteredIssues, owner, name, periodInfo).then(filteredIssues => {
          for (var i = 0; i < elemData.issues.length; i++) {
            if (filteredIssues.includes(elemData.issues[i])) elemData.issues[i].inPercentage = true;
            else elemData.issues[i].inPercentage = false;
          }
          elemData.value = filteredIssues.length / issues.length * 100 || 0;
          resolve(elemData);
        });
      }
    }
  });
}

function applyFilters(filters, data, owner, name, periodInfo) {
  return new Promise((resolve, reject) => {
    Object.getOwnPropertyNames(filters).forEach(filter => {
      var values = filters[filter];
      switch (filter) {
        case 'state':
          values = values.split(',');
          values = getCorrectStates(values);
          data = data.filter(issue => values.indexOf(issue.state) !== -1);
          break;
        case 'type':
          values = values.split(',');
          values = values.map(val => val.trim());
          data = data.filter(issue => values.indexOf(issue.type) !== -1);
          break;
        case 'estimate':
          if (values === -1) data = data.filter(issue => !issue.hasOwnProperty('estimate'));
          else data = data.filter(issue => parseInt(values) === issue['estimate']);
          break;
        default:
          if (filter !== 'transition') logger.info('Unsupported filter: ' + filter);
      }
    });
    filterTransition(filters, data, owner, name, periodInfo).then(filtered => {
      resolve(filtered);
    });
  });
}

function getCorrectStates(states) {
  states = states.map(val => {
    var newVal = val.trim();
    newVal = newVal.charAt(0).toUpperCase() + newVal.slice(1);
    newVal = newVal.replace('_', ' ');
    return newVal;
  });
  return states;
}

module.exports = {
    getMeasure: getMeasure,
    getProject: getProject,
    getAllMembers: getAllMembers,
    getMember: getMember
}