/*!
governify-project-gauss-reporter 1.0.0, built on: 2018-04-19
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-project-gauss-reporter

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

'use strict';

const moment = require("moment-timezone");

const InfluxDB = require('../../services/influxService').InfluxDB;
const Reporter = require('../../services/gaussReporterService/').GaussReporter;
const config = require("../../configurations");
const JSONStream = require('JSONStream');
const logger = require("../../logger");
const request = require('request');
const Promise = require('bluebird');
const objectiveUtils = require("../../utils/objective-utils")

const influx = new InfluxDB(config.influx.host, config.influx.database, config.influx.measurement, config.influx.fields, config.influx.tags);

const reporter = new Reporter(influx);
var statusCreatePoints = {}

var currentlyUpdating = [];
var pendingUpdate = [];

var looper;
/**
 * Start retrieving KPIs information
 *
 * contractId String Contract ID
 * timer String timer (optional)
 * loop String loop (optional)
 * no response value expected for this operation
 **/
exports.contractsContractIdStartGET = (contractId, timer, loop, periods) => {
  return new Promise((resolve, reject) => {

    reporter.contractId = contractId;

    var loopProcess = (timer, loop, resolve, reject) => {
      reporter.isExecutionFinished = true;
      looper = setInterval(() => {
        if (loop && loop == "false" && reporter.isExecutionFinished) {
          logger.info("Initializing a new process at " + moment().format());
          reporter.isExecutionFinished = false;

          reporter.process(periods).then(() => {
            logger.info("ExecutionFinished at " + moment().format());
            reporter.isExecutionFinished = true;
          }).catch((error) => {
            reporter.isExecutionFinished = true;
            return reject({
              code: "REP-500D",
              message: "there was an error",
              details: error
            });
          });
          return resolve({
            code: "REP-200",
            message: "OK: Initializing a new process at " + moment().format(),
            details: ""
          });
        } else {
          logger.info("Execution is not finished yet. Loop process will keep trying");
          return resolve({
            code: "REP-204",
            message: "Execution is not finished yet. Loop process will keep trying",
            details: ""
          });
        }
      }, timer);
    };

    if (loop && loop == "true") {
      loopProcess(timer, loop, resolve, reject);
    } else {
      reporter.isExecutionFinished = false;
      reporter.process(periods).then((res) => {
        logger.info("Execution finished at " + moment().format());
        reporter.isExecutionFinished = true;
        return resolve({
          code: "REP-200",
          message: "Execution finished at " + moment().format(),
          details: ""
        });
      }).catch((error) => {
        return reject({
          code: "REP-500B",
          message: "there was an error",
          details: error
        });
      });
    }


  });
}


/**
 * Stop retrieving KPIs information
 *
 * contractId String Contract ID
 * no response value expected for this operation
 **/
exports.contractsContractIdStopGET = (contractId) => {
  return new Promise((resolve, reject) => {
    reporter.isExecutionFinished = false;
    clearTimeout(looper);
    return resolve({
      code: "200",
      message: "OK: Process stopped at " + moment().format(),
      details: ""
    });
  });
}

/**
 * Stop retrieving KPIs information
 *
 * contractId String Contract ID
 * no response value expected for this operation
 **/
exports.contractsContractIdCreatePointsFromListGET = (contractId) => {
  return new Promise((resolve, reject) => {
    resolve(statusCreatePoints[contractId])
  })
}


/**
 * Create history and save points
 *
 * contractId String Contract ID
 * no response value expected for this operation
 **/
exports.contractsContractIdCreateHistoryPOST = (contractId) => {
  logger.info("Creating history for agreementID: " + contractId)
  return new Promise((resolve, reject) => {
    logger.ctl("Getting the agreements from Registry with contractId = %s", contractId);
    request.get({
      url: config.v1.agreementURL + contractId,
      json: true
    }, (error, httpResponse, agreement) => {

      var periods = Reporter.getPeriods(agreement, {
        initial: agreement.context.validity.initial
      });

      Promise.each(periods, function (period) {
        return callRegistryAndStorePoints(config.v1.statesURL + contractId + "/guarantees" + "?from=" + period.from + "&to=" + period.to, agreement)
      }).then(function () {
        logger.info("Finished creating history for agreeement " + contractId)
        resolve();
      });

    });
  });
}



/**
 * Create history and save points
 *
 * contractId String Contract ID
 * no response value expected for this operation
 **/
exports.contractsContractIdCreatePointsFromListPOST = (contractId, listDates) => {
  logger.info("Creating points from List for agreementID: " + contractId)
  if (statusCreatePoints[contractId]) {
    return "A process to create Points from List is already started."
  }
  else {
    statusCreatePoints[contractId] = { current: 0, total: 1 }
    return new Promise((resolve, reject) => {
      try {
        logger.ctl("Getting the agreements from Registry with contractId = %s", contractId);
        request.get({
          url: config.v1.agreementURL + contractId,
          json: true
        }, (error, httpResponse, agreement) => {
          var periods = listDates.map(x => { return { from: x, to: moment(x).add(1, "second").toISOString() } })
          Promise.each(periods, function (period) {
            statusCreatePoints[contractId] = { current: statusCreatePoints[contractId].current + 1, total: periods.length }

            return callRegistryAndStorePoints(config.v1.statesURL + contractId + "/guarantees" + "?from=" + period.from + "&to=" + period.to + "&newPeriodsFromGuarantees=false", agreement)

          }).then(function () {
            statusCreatePoints[contractId] = undefined;
            logger.info("Finished creating history for agreeement " + contractId)
            resolve();
          });

        });
      } catch (error) {
        logger.error(error)
        statusCreatePoints[contractId] = undefined;
      }

    });

  }
}




/**
 * Updates KPIs information
 *
 * contractId String Contract ID
 * no response value expected for this operation
 **/
exports.contractsContractIdUpdateGET = (contractId) => {
  return new Promise((resolve, reject) => {

    var urlRegistryRequest = config.v1.statesURL + contractId + "/guarantees" + "?from=" + moment().toISOString() + "&to=" + moment().add(3, "week").toISOString() + "&newPeriodsFromGuarantees=false"
    logger.ctl("Getting the agreements from Registry with contractId = %s", contractId);
    request.get({
      url: config.v1.agreementURL + contractId,
      json: true
    }, (error, httpResponse, agreement) => {
      callRegistryAndStorePoints(urlRegistryRequest, agreement)

    }
    )

    //TODO: Add feedback about request. And create tasks for get status of requests
    resolve()


  })
}


exports.resetPOST = function (args, res, next) {
  try {
    logger.ctl("Trying to reset Reporter and  Influx database!");
    var agreementId = args.contractId.value;

    //Delete influx db for the agreement

    influx.influx.dropSeries({
      measurement: m => m.name(config.influx.measurement),
      where: e => e.tag('agreement').equals.value(agreementId),
      database: config.influx.database
    });

    influx.influx.dropSeries({
      measurement: m => m.name(config.influx.measurement_historical),
      where: e => e.tag('agreement').equals.value(agreementId),
      database: config.influx.database
    });

    // Create database if it does not exist yet.
    influx.influx.getDatabaseNames().then(names => {
      logger.ctl("DBs in influxdb", names);
      if (!names.includes(config.influx.database)) {
        return influx.createDatabase(config.influx.database);
      }
    }).then(() => {
      logger.ctl("InfluxDb: DB created");
    }).catch(err => {
      logger.ctl("Error creating Influx database!");
    });


    res.status(200).json({
      code: 200,
      message: "Influx '" + config.influx.measurement_historical + "' and '" + config.influx.measurement + "' measurements have been removed."
    });



  } catch (err) {
    logger.error("Error when trying to stop reporter: " + err);
    res.status(200).json({
      code: 500,
      message: "Internal error"
    });
  }

};

function callRegistryAndStorePoints(urlRegistry, agreement) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      console.log("URLRegistry: " + urlRegistry)
      var requestStream = request.get(urlRegistry);
      requestStream.on("response", response => {
        if (response.code && response.code !== 200) {
          logger.error(
            "Error while retrieving " + type + " info: " + response.message
          );
          return reject({
            code: response.code,
            message: response
          });
        } else {
          logger.ctl("Connection with Registry established");
          logger.ctl("Receiving guarantees information...");


          var dataReceivedCheck = false;

          requestStream.pipe(JSONStream.parse()).on("data", guaranteeStates => {
            dataReceivedCheck = true;
            try {
              for (var i in guaranteeStates) {
                var guaranteeResult = guaranteeStates[i];
                var timestamp = moment(guaranteeResult.period.from).valueOf() * 1000000;

                var influxPoint = {
                  measurement: config.influx.measurement,
                  tags: {
                    agreement: guaranteeResult.agreementId,
                    id: guaranteeResult.id,
                    member: guaranteeResult.scope.member,
                  },
                  fields: {
                    value: objectiveUtils.calculateObjective(agreement.terms.guarantees.find(x => x.id === guaranteeResult.id).of[0].objective, guaranteeResult.metrics).value

                  },
                  timestamp: timestamp
                }
                for (const [key, value] of Object.entries(guaranteeResult.metrics)) { //Storage metric result
                  influxPoint.fields[key] = value;
                }

                influxInsert([influxPoint], function () { })
              }
              resolve()
            } catch (err) {
              logger.error("Error while processing guarantee data received. Retrying request to registry")
              setTimeout(function () {
                callRegistryAndStorePoints(urlRegistry, agreement).then(function () { resolve() })
              }, 1500)
            }
          })
            .on("error", err => {
              if (!dataReceivedCheck) {
                logger.error("Error while getting data from registry, retrying connection:")
                setTimeout(function () {
                  return callRegistryAndStorePoints(urlRegistry, agreement).then(function () { resolve() })
                }, 1500)
              }
              return res.status(500).json(err);
            })
            .on("end", function () {
              if (!dataReceivedCheck) {
                logger.error("Ended registry request without data , retrying connection:")
                setTimeout(function () {
                  return callRegistryAndStorePoints(urlRegistry, agreement).then(function () { resolve() })
                }, 1500)
              }
            })
        }

      });
    }, config.timeBetweenRequests)
  })
}


function checkUpdates(contractId) {
  if (pendingUpdate.includes(contractId)) {
    pendingUpdate.splice(pendingUpdate.indexOf(contractId), 1);
    this.contractsContractIdUpdateGET(contractId)
  }
}


var influxInsert = (elements, callback) => {
  influx.influx.writePoints(elements, {
    maxRetries: 50,
    requestTimeout: 600000
  }).then(callback).catch((err, data) => {
    logger.ctl("Error Writing in db ", err);
  });
};