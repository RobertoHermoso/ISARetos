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
const logger = require("../../logger");

const influx = new InfluxDB(config.influx.host, config.influx.database, config.influx.measurement, config.influx.fields, config.influx.tags);
const reporter = new Reporter(influx);

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