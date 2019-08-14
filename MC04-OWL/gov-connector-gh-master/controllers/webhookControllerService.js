'use strict'

const logger = require('../logger');
var Promise = require('bluebird');
var rp = require('request-promise');

function sendRequest(query) {
  return new Promise((resolve, reject) => {
    rp({
      method: 'POST',
      uri: 'https://api.github.com/graphql',
      headers: {
        'Authorization': 'bearer 7cc6467533169e239d581b91ab5a7c83457c2619',
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

module.exports.getActivity = function getActivity(req, res, next) {
  var data = req.body;
  logger.info('Event received for ' + data.repository.owner.login + '/' + data.repository.name);
  var query = `query {
    rateLimit {
      remaining
      resetAt
    }
    repository(owner: "` + data.repository.owner.login + `", name: "` + data.repository.name + `") {
      projects(first: 50) {
        nodes {
          databaseId
        }
      }
    }
  }`
  sendRequest(query).then(data => {
    var projects = data.data.repository.projects.nodes;
    var promises = [];
    projects.forEach(project => {
      promises.push(new Promise((resolve, reject) => {
        rp({
          uri: 'http://reporter.test.ghowl.es/api/v4/contracts/tpa-' + project.databaseId + '/update'
        }).then(() => {
          logger.info('The change was successfully reported for project ' + project.databaseId);
          resolve();
        }).catch(err => {
          logger.error('There was an error: ' + err);
          reject(err);
        });
      }));
    });
    Promise.all(promises).then(() => {
      logger.info('Change reported for all projects');
      res.send({done: 'done'});
    });
  });
};