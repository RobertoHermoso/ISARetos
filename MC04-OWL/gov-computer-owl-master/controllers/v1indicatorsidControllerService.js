'use strict';

var Promise = require('bluebird');
var moment = require('moment-timezone');
var url = require('url');
var ghFunctions = require('./ghFunctions');
const logger = require('../logger');

module.exports.computeMetric = function computeMetric(req, res, next) {
  ghFunctions.getMeasure(req.query['measure']).then(measure => {
    var periodInfo = {
      initial: moment.tz(req.query['window.initial'], req.query['window.timeZone']).toISOString(),
      end: moment.tz(req.query['window.end'], req.query['window.timeZone']).toISOString(),
      timezone: req.query['window.timeZone']
    };
    var offset = measure.offset || 0;
    if (!req.query['scope.member']) {
      logger.info('Computing metric for project');
      ghFunctions.getProject(measure.filters, measure.element, req.query['scope.owner'], req.query['scope.name'], req.query['scope.project'], periodInfo, offset)
      .then(data => {
        res.send([data]);
      });
    } else if (req.query['scope.member'] && req.query['scope.member'] === '*') {
      logger.info('Computing metric for all members');
      ghFunctions.getAllMembers(measure.filters, measure.element, req.query['scope.owner'], req.query['scope.name'], req.query['scope.project'], periodInfo, offset)
      .then(data => {
        res.send(data);
      });
    } else if (req.query['scope.member'] && req.query['scope.member'] !== '*') {
      logger.info('Computing metric for member');
      ghFunctions.getMember(measure.filters, measure.element, req.query['scope.member'], req.query['scope.owner'], req.query['scope.name'], req.query['scope.project'], periodInfo, offset)
      .then(data => {
        res.send([data]);
      });
    }
  });
};

/*function performRequest(filters, project, periodInfo, type, offset) {
  return new Promise((resolve, reject) => {
    var url;
    if (type === 'live') {
      url = 'https://www.pivotaltracker.com/services/v5/projects/' + project + '/stories?limit=500';
    } else {
      var enddate = new Date(periodInfo.end);
      enddate.setDate(enddate.getDate() + offset);
      var endts = enddate.getTime() / 1000;
      url = 'https://powerful-peak-99856.herokuapp.com/extended_api/projects/' + project + '/stories?at_time=' + endts;
    }
    logger.info(url);
    lp.req({
      uri: url,
      headers: {
        'X-TrackerToken': '8c9ef24d9ca202d020ad3427c6db441c'
      }
    }).then(body => {
      if (type === 'live' && offset !== 0) {
        logger.info('Computing with live offset');
        var offsetdate = new Date(periodInfo.end);
        offsetdate.setDate(offsetdate.getDate() + offset);
        var offsetstories = [];
        var promises = [];
        JSON.parse(body).forEach(story => {
          promises.push(new Promise((resolve2, reject2) => {
            lp.req({
              uri: 'https://www.pivotaltracker.com/services/v5/projects/' + project + '/stories/' + story.id + '/transitions',
              headers: {
                'X-TrackerToken': '8c9ef24d9ca202d020ad3427c6db441c'
              }
            }).then(transbody => {
              var transdata = JSON.parse(transbody);
              transdata.reverse();
              var firsttrans = transdata.find(trans => new Date(trans['occurred_at']) <= offsetdate);
              if (firsttrans) {
                story['current_state'] = firsttrans.state;
                offsetstories.push(story);
              }
              resolve2();
            })
          }));
        });
        Promise.all(promises).then(() => {
          resolve(JSON.stringify(offsetstories));
        })
      } else {
        resolve(body);
      }
    })
  });
}

function getProject(filters, element, project, pclass, periodInfo, type, offset) {
  return new Promise((resolve, reject) => {
    performRequest(filters, project, periodInfo, type, offset).then(body => {
      var data = JSON.parse(body);
      Object.getOwnPropertyNames(filters).forEach(filter => {
        var values = filters[filter];
        switch (filter) {
          case 'state':
            values = values.split(',');
            values = values.map(val => val.trim());
            data = data.filter(story => values.indexOf(story['current_state']) !== -1);
            break;
          case 'type':
            values = values.split(',');
            values = values.map(val => val.trim());
            data = data.filter(story => values.indexOf(story['story_type']) !== -1);
            break;
          case 'estimate':
            data = data.filter(story => parseInt(values) === story['estimate']);
            break;
          default:
            if (filter !== 'transition') logger.info('Unsupported filter: ' + filter);
        }
      });
      applyCustomFilters(filters, data, project, periodInfo, type).then(filteredData => {
        logger.info('Filtered data for project ' + project + ': ' + JSON.stringify(filteredData));
        getElement(element, filteredData, project, periodInfo, type).then(elemData => {
          var toReturn = {
            scope: {
              project: project,
              class: pclass
            },
            period: {
              from: periodInfo.initial,
              to : periodInfo.end
            },
            evidences: elemData.stories,
            value: elemData.value
          };
          resolve(toReturn);
        });
      });
    })
  });
}

function getStories(filters, element, project, pclass, periodInfo, type, story, offset) {
  return new Promise((resolve, reject) => {
    performRequest(filters, project, periodInfo, type, offset).then(body => {
      var data = JSON.parse(body);
      Object.getOwnPropertyNames(filters).forEach(filter => {
        var values = filters[filter];
        switch (filter) {
          case 'state':
            values = values.split(',');
            values = values.map(val => val.trim());
            data = data.filter(story => values.indexOf(story['current_state']) !== -1);
            break;
          case 'type':
            values = values.split(',');
            values = values.map(val => val.trim());
            data = data.filter(story => values.indexOf(story['story_type']) !== -1);
            break;
          case 'estimate':
            data = data.filter(story => parseInt(values) === story['estimate']);
            break;
          default:
            if (filter !== 'transition') logger.info('Unsupported filter: ' + filter);
        }
      });
      if (story) data = data.filter(retStory => retStory.id === story);
      applyCustomFilters(filters, data, project, periodInfo, type).then(filteredData => {
        if (story) logger.info('Filtered data for story ' + story + ': ' + JSON.stringify(filteredData));
        else logger.info('Filtered data for stories: ' + JSON.stringify(filteredData));
        var toReturn = [];
        filteredData.forEach(filteredStory => {
          var value = 0;
          switch(element) {
            case 'number':
              value = 1;
              break;
            case 'stories':
              value = filteredStory;
              break;
            case 'points':
              value = filteredStory.estimate || 0;
              break;
          }
          toReturn.push({
            scope: {
              story: filteredStory.id,
              project: project,
              class: pclass
            },
            period: {
              from: periodInfo.initial,
              to : periodInfo.end
            },
            evidences: [filteredStory],
            value: value,
          })
        });
        resolve(toReturn);
      });
    });
  });
}

function getMember(filters, element, member, project, pclass, periodInfo, type, offset) {
  return new Promise((resolve, reject) => {
    performRequest(filters, project, periodInfo, type, offset).then(body => {
      var data = JSON.parse(body);
      Object.getOwnPropertyNames(filters).forEach(filter => {
        var values = filters[filter];
        switch (filter) {
          case 'state':
            values = values.split(',');
            values = values.map(val => val.trim());
            data = data.filter(story => values.indexOf(story['current_state']) !== -1);
            break;
          case 'type':
            values = values.split(',');
            values = values.map(val => val.trim());
            data = data.filter(story => values.indexOf(story['story_type']) !== -1);
            break;
          case 'estimate':
            data = data.filter(story => parseInt(values) === story['estimate']);
            break;
          default:
            if (filter !== 'transition') logger.info('Unsupported filter: ' + filter);
        }
      });
      data = data.filter(story => story['owner_ids'].indexOf(member) !== -1);
      applyCustomFilters(filters, data, project, periodInfo, type).then(filteredData => {
        logger.info('Filtered data for member ' + member + ': ' + JSON.stringify(filteredData));
        getElement(element, filteredData, project, periodInfo, type).then(elemData => {
          getMemberName(member, project).then(memberName => {
            var toReturn = {
              scope: {
                member: memberName,
                project: project,
                class: pclass
              },
              period: {
                from: periodInfo.initial,
                to : periodInfo.end
              },
              evidences: elemData.stories,
              value: elemData.value
            };
            resolve(toReturn);
          });
        });
      });
    })
  });
}

function getAllMembers(filters, element, project, pclass, periodInfo, type, offset) {
  return new Promise((resolve, reject) => {
    lp.req({
      uri: 'https://www.pivotaltracker.com/services/v5/projects/' + project + '/memberships',
      headers: {
        'X-TrackerToken': '8c9ef24d9ca202d020ad3427c6db441c'
      }
    }).then((body) => {
      var memberships = JSON.parse(body);
      var promises = [];
      var toReturn = [];
      memberships.forEach(membership => {
        if (membership.person.id !== 3144975) {
          if (!memberDict.has(membership.person.id)) {
            logger.info('Member ' + membership.person.id + ' (' + membership.person.name + ') added to cache');
            memberDict.set(membership.person.id, membership.person.name);
          }
          promises.push(new Promise((resolve, reject) => {
            return getMember(filters, element, membership.person.id, project, pclass, periodInfo, type, offset)
            .then((data) => {
              toReturn.push(data);
              resolve();
            });
          }));
        }
      });
      Promise.all(promises).then(() => {
        resolve(toReturn);
      });
    });
  });
}

function getMemberName(member, project) {
  return new Promise((resolve, reject) => {
    if (memberDict.has(member)) {
      logger.info('Member ' + member + ' (' + memberDict.get(member) + ') retrieved from cache');
      resolve(memberDict.get(member));
    } else {
      lp.req({
        uri: 'https://www.pivotaltracker.com/services/v5/projects/' + project + '/memberships',
        headers: {
          'X-TrackerToken': '8c9ef24d9ca202d020ad3427c6db441c'
        }
      }).then(body => {
        var data = JSON.parse(body);
        var found = data.find(membshp => membshp.person.id === member);
        logger.info('Member ' + member + ' (' + found.person.name + ') added to cache');
        memberDict.set(member, found.person.name);
        resolve(found.person.name);
      });
    }
  });
}

function applyCustomFilters(filters, stories, project, periodInfo, type) {
  return new Promise((resolve, reject) => {
    filterTransition(filters, stories, project, periodInfo, type).then(transitionFilt => {
      resolve(transitionFilt);
    })
  });
}

function filterTransition(filters, stories, project, periodInfo, type) {
  return new Promise((resolve, reject) => {
    if (Object.getOwnPropertyNames(filters).includes('transition')) {
      logger.info('Using transition filter');
      var transitionParams = filters['transition'];
      var filtered = [];
      var promises = [];
      stories.forEach(story => {
        promises.push(new Promise((resolve2, reject2) => {
          var url;
          if (type === 'live') {
            url = 'https://www.pivotaltracker.com/services/v5/projects/' + project + '/stories/' + story.id + '/transitions';
          } else {
            url = 'https://powerful-peak-99856.herokuapp.com/extended_api/projects/' + project + '/stories/' + story.id + '/transitions';
          }
          lp.req({
            uri: url,
            headers: {
              'X-TrackerToken': '8c9ef24d9ca202d020ad3427c6db441c'
            }
          }).then(body => {
            var data = JSON.parse(body);
            data.sort((st1, st2) => {
              return new Date(st1['occurred_at']) >= new Date(st2['occurred_at']) ? 1 : -1;
            });
            var isDuration = false;
            var isBefAft = false;
            var durations = [];
            if (transitionParams.duration) {
              logger.info('Duration filter used');
              var fromStates = transitionParams.fromState.split(',');
              var toStates = transitionParams.toState.split(',');
              fromStates.forEach(fromState => {
                toStates.forEach(toState => {
                  var fromTrans = data.find(trans => trans.state === fromState.trim());
                  var toTrans = data.find(trans => trans.state === toState.trim());
                  if (fromTrans && toTrans) {
                    var fromDate = fromTrans['occurred_at'];
                    var toDate = toTrans['occurred_at'];
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
              var isBefore = false;
              var isAfter = false;
              toStates.forEach(toState => {
                var toTrans = data.find(trans => trans.state === toState.trim());
                if (toTrans) {
                  var toDate = new Date(toTrans['occurred_at']);
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
            if (isDuration && isBefAft) filtered.push(story);
            resolve2();
          });
        }));
      });
      Promise.all(promises).then(() => {
        resolve(filtered);
      });
    } else {
      resolve(stories);
    }
  });
}

function getElement(element, stories, project, periodInfo, type) {
  return new Promise((resolve, reject) => {
    var elemData = {
      stories: stories,
      value: 0
    }
    if (element === 'number') {
      elemData.value = stories.length;
      resolve(elemData);
    } else if (element === 'stories') {
      elemData.value = stories;
      resolve(elemData);
    } else if (element === 'points') {
      elemData.value = stories.map(datStory => datStory.estimate || 0).reduce((a, b) => a + b, 0);
      resolve(elemData);
    } else if (typeof element === 'object') {
      if (Object.getOwnPropertyNames(element)[0] === 'percentage') {
        var filters = element.percentage;
        var filteredStories = stories.slice();
        Object.getOwnPropertyNames(filters).forEach(filter => {
          var values = filters[filter];
          switch (filter) {
            case 'state':
              values = values.split(',');
              values = values.map(val => val.trim());
              filteredStories = filteredStories.filter(story => values.indexOf(story['current_state']) !== -1);
              break;
            case 'type':
              values = values.split(',');
              values = values.map(val => val.trim());
              filteredStories = filteredStories.filter(story => values.indexOf(story['story_type']) !== -1);
              break;
            case 'estimate':
              filteredStories = filteredStories.filter(story => parseInt(values) === story['estimate']);
              break;
            default:
              if (filter !== 'transition') logger.info('Unsupported filter: ' + filter);
          }
        });
        applyCustomFilters(filters, filteredStories, project, periodInfo, type).then(filtStories => {
          for (var i = 0; i < elemData.stories.length; i++) {
            if (filtStories.includes(elemData.stories[i])) elemData.stories[i].inPercentage = true;
            else elemData.stories[i].inPercentage = false;
          }
          elemData.value = filtStories.length / stories.length * 100 || 0;
          resolve(elemData);
        });
      }
    }
  });
}*/