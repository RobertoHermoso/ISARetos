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

const request = require('request');
const json2csv = require('json2csv');
const Promise = require('bluebird');
const JSONStream = require('JSONStream');
const stream = require('stream');
const Influx = require('influx');
const moment = require('moment-timezone');
const config = require("../../configurations");
const logger = require("../../logger");
const utils = require('../../utils');

var SUPPORTED_FILES = ['csv', 'json'];

var loopParams = {
    agreements: {},
    isStopped: (agreementId) => {
        return !(agreementId in loopParams.agreements) || !loopParams.agreements[agreementId].interval;
    },
    default: {
        timer: 5000 //FIXME: get timer from query param
    }
};
var initAgreementLoopParams = (agreementId) => {
    loopParams.agreements[agreementId] = {
        isStreamingSetUp: false,
        isProcessFinished: true,
        interval: undefined
    };
};

var initAgreementParams = (agreementId) => {
    loopParams.agreements[agreementId] = {
        isStreamingSetUp: false,
        isProcessFinished: false,
        interval: 5000
    };
};

var influx;

/**
 * Retrieve reporter status for a specific contract
 * @param {*} args 
 * @param {*} res 
 * @param {*} next 
 */
exports.statusGET = function (args, res, next) {

    try {
        var agreementId = args.contractId.value;
        var status = !loopParams.isStopped(agreementId);
        res.status(200).json({
            code: 200,
            message: status ? "Active" : "Not active"
        });
    } catch (err) {
        logger.error("Error trying to retrieve reporter status: " + err);
        res.status(200).json({
            code: 500,
            message: "Internal error"
        });
    }

};

/**
 * 
 * @param {*} args 
 * @param {*} res 
 * @param {*} next 
 */
exports.stopPOST = function (args, res, next) {

    try {

        var agreementId = args.contractId.value;

        if (!agreementId || !(agreementId in loopParams.agreements)) {
            res.status(200).json({
                code: 400,
                message: "Agreement does not exist, " + agreementId
            });
        }

        if (!loopParams.isStopped(agreementId)) {

            // Stop
            clearInterval(loopParams.agreements[agreementId].interval);
            loopParams.agreements[agreementId].interval = null;

            res.status(200).json({
                code: 200,
                message: "Reporter execution has been stopped"
            });

        } else {
            logger.looper("Reporter execution is already stopped for agreement " + agreementId);
            res.status(200).json({
                code: 200,
                message: "Reporter execution is already stopped"
            });
        }

    } catch (err) {
        logger.error("Error when trying to stop reporter: " + err);
        res.status(200).json({
            code: 500,
            message: "Internal error"
        });
    }

};

/**
 * 
 * @param {*} args 
 * @param {*} res 
 * @param {*} next 
 */
exports.resetPOST = function (args, res, next) {
    try {
        logger.ctl("Trying to reset Reporter and  Influx database!");
        var agreementId = args.contractId.value;

        if (agreementId && (agreementId in loopParams.agreements)) {
            // Stop
            clearInterval(loopParams.agreements[agreementId].interval);
            loopParams.agreements[agreementId].interval = null;
        }

        //Delete influx db for the agreement

        influx.dropSeries({
            measurement: m => m.name(config.influx.measurement),
            where: e => e.tag('agreement').equals.value(agreementId),
            database: config.influx.database
        });

        influx.dropSeries({
            measurement: m => m.name(config.influx.measurement_historical),
            where: e => e.tag('agreement').equals.value(agreementId),
            database: config.influx.database
        });

        // Create database if it does not exist yet.
        influx.getDatabaseNames().then(names => {
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
            message: "Reporter execution has been stopped. Influx '" + config.influx.measurement_historical + "' and '" + config.influx.measurement + "' measurements have been removed."
        });



    } catch (err) {
        logger.error("Error when trying to stop reporter: " + err);
        res.status(200).json({
            code: 500,
            message: "Internal error"
        });
    }

};

exports.startPOST = function (args, res, next, req) {
    /**
     * parameters expected in the args:
     * contractId (String)
     * month (String)
     * kpi (String)
     * serviceLine (String)
     * activity (String)
     **/

    var agreementId = args.contractId.value;
    var month = args.month.value;
    var kpiParam = args.kpi.value;
    var serviceLine = args.serviceLine.value;
    var activity = args.activity.value;
    var format = args.format.value ? args.format.value : 'csv';
    var period;
    if (req.body.from){
     period = req.body;
        }

   
 
    if (SUPPORTED_FILES.indexOf(format) != -1) {
        if (!period) { //FIXME: get loop condition from query param

            loopProcess(res, 'Services', agreementId, month, format, kpiParam, serviceLine, activity, period);
            // res.status(200).json({
            //     code: 200,
            //     message: 'Reporter started'
            // });

        } else {
            initAgreementParams(agreementId);
            process(res, 'Services', agreementId, month, format, kpiParam, serviceLine, activity, period);
        }
    } else {
        res.status(501).json({
            code: 501,
            message: 'Format ' + format + ' not supported yet.'
        });
    }

}

function createSocketFunctions(url, period, agreement, agreementURL, guaranteesStateURL, metricsStateURL, resolve, reject, retry){
 

}

function process(res, type, agreementId, month, format, kpiParam, serviceLine, activity, periodsToProcess, retry) {

    loopParams.agreements[agreementId].isProcessFinished = false;
 

    var agreement;
    var agreementURL = config.v1.agreementURL + agreementId;
    var guaranteesStateURL = config.v1.statesURL + agreementId + '/guarantees' + (kpiParam ? '/' + kpiParam : '');
    var metricsStateURL = config.v1.statesURL + agreementId + '/metrics/';

    logger.ctl("New request to get " + type + " data for agreement = " + agreementId);

    try {

        logger.ctl("Getting agreements from agreements-registry with contractId = " + agreementId);

        request.get({
            url: agreementURL,
            json: true
        }, function (err, httpResponse, response) {
            if (err) {
                logger.error("Error while retrieving agreement: " + err.toString().substr(0, 400));
                return res.status(500).json({
                    code: 500,
                    message: err.toString()
                });
            }

            if (httpResponse.statusCode != 200) {
                logger.error("Error while retrieving agreement: " + JSON.stringify(response, null, 2).substr(0, 400));
                return res.status(httpResponse.statusCode).json(response);
            }

            logger.ctl("OK agreement has been retrieved");
            agreement = response;

            logger.ctl("Retrieving " + type + " info from: " + guaranteesStateURL);

            logger.ctlState("### Streaming mode ###");
            var streamingResult = new stream.Readable({
                objectMode: true
            });
            setUpStreamingResult(agreementId, streamingResult, type, format, res);

        
            logger.info("PeriodsToProcess:" + JSON.stringify(periodsToProcess))    
            var periods;

            if (periodsToProcess && periodsToProcess != null) {
                if (Array.isArray(periodsToProcess)){
                    periods = periodsToProcess;
                }
                else{
                    periods = [];
                    periods.push(periodsToProcess);
                }
            }
            else{
                periods = utils.getPeriods(agreement, {
                initial: agreement.context.validity.initial,
                end: agreement.context.validity.end
            });
            }

            logger.ctl("Periods for requests %s", JSON.stringify(periods, null, 2));

            var pendingPeriods = periods.slice(0);

            Promise.each(periods, (period, index) => {
                return new Promise((resolve, reject) => {

                    if (!loopParams.isStopped(agreementId)) {

                        var url = guaranteesStateURL + '?from=' + period.from + '&to=' + period.to;
                        logger.ctl((index + 1) + " Requests " + type + " from: %s", JSON.stringify(url, null, 2));
                        


                       // createSocketFunctions(url, period, agreement, agreementURL, guaranteesStateURL, metricsStateURL, resolve, reject);




                                   var requestStream = request.get(url);
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
                                    var kpis = [];
                                    var contractDate = moment.utc();
                                    logger.ctl("Receiving guarantees information...");
                                    var dataReceivedCheck = false;
                                    var dataStream = requestStream
                                    .pipe(JSONStream.parse())
                                    .on("data", guaranteeStates => {
                                        dataReceivedCheck = true;
                                        logger.ctl(
                                        "(Scoped) Guarantees States received: " + guaranteeStates.length
                                        );
                                        //Remove period already calculated from pending periods, and restart retry counter.
                                        var indexP = pendingPeriods.indexOf(period);
                                        if (indexP > -1) {
                                          pendingPeriods.splice(indexP, 1);
                                        }
                                        retry = 0; 
                                        //Process each guaranteeState
                                        Promise.each(guaranteeStates, function(
                                        scopedGuaranteeState,
                                        index,
                                        length
                                        ) {
                                        return new Promise(function(resolve, reject) {
                                            var elements;

                                            if (type == "Services") {
                                            if (
                                                (!kpiParam || kpiParam === scopedGuaranteeState.id) &&
                                                (!serviceLine ||
                                                serviceLine === scopedGuaranteeState.scope.serviceLine) &&
                                                (!activity || activity === scopedGuaranteeState.scope.activity)
                                            ) {
                                                logger.ctl("Processing KPI: " + (index + 1) + "/" + length);

                                                if (
                                                scopedGuaranteeState.evidences &&
                                                scopedGuaranteeState.evidences.length > 0
                                                ) {
                                                Promise.each(scopedGuaranteeState.evidences, function(
                                                    evidence,
                                                    index,
                                                    length
                                                ) {
                                                    return new Promise(function(resolve, reject) {
                                                    logger.warning(
                                                        "guarantee to: " + scopedGuaranteeState.period.to
                                                    );
                                                    logger.warning(
                                                        "Limit TO: " +
                                                        moment
                                                            .tz(
                                                            agreement.context.validity.end,
                                                            agreement.context.validity.timeZone
                                                            )
                                                            .subtract(1, "milliseconds")
                                                            .toISOString()
                                                    );
                                                    if (
                                                        (!month ||
                                                        moment(month, "YYYYMM").isSame(
                                                            moment.tz(
                                                            scopedGuaranteeState.period.to,
                                                            agreement.context.validity.timeZone
                                                            ),
                                                            "month"
                                                        )) &&
                                                        moment
                                                        .tz(
                                                            scopedGuaranteeState.period.from,
                                                            agreement.context.validity.timeZone
                                                        )
                                                        .isSameOrAfter(
                                                            moment.tz(
                                                            agreement.context.validity.initial,
                                                            agreement.context.validity.timeZone
                                                            )
                                                        ) &&
                                                        moment
                                                        .tz(
                                                            scopedGuaranteeState.period.to,
                                                            agreement.context.validity.timeZone
                                                        )
                                                        .isSameOrBefore(
                                                            moment
                                                            .tz(
                                                                agreement.context.validity.end,
                                                                agreement.context.validity.timeZone
                                                            )
                                                            .subtract(1, "milliseconds")
                                                        )
                                                    ) {
                                                        var elementProcessed = generateResponse(
                                                        agreement,
                                                        month,
                                                        contractDate,
                                                        scopedGuaranteeState,
                                                        evidence
                                                        );
                                                        // logger.ctl("Writing " + type + " in " + format + " format: " + (index + 1) + "/" + length);
                                                        // writeOutput(type, format, elementProcessed, streamingResult, function () {
                                                        //     return resolve();
                                                        // });
                                                        return resolve();
                                                    } else {
                                                        return resolve();
                                                    }
                                                    });
                                                }).then(function(results) {
                                                    return resolve();
                                                });
                                                } else {
                                                logger.warning(
                                                    "No evidences for KPI: " +
                                                    JSON.stringify(scopedGuaranteeState.id, null, 2)
                                                );
                                                return resolve();
                                                }
                                            }
                                            } else if (type == "KPIs") {
                                            if (
                                                (!month ||
                                                moment(month, "YYYYMM").isSame(
                                                    moment.tz(
                                                    scopedGuaranteeState.period.to,
                                                    agreement.context.validity.timeZone
                                                    ),
                                                    "month"
                                                )) &&
                                                moment
                                                .tz(
                                                    scopedGuaranteeState.period.from,
                                                    agreement.context.validity.timeZone
                                                )
                                                .isSameOrAfter(
                                                    moment.tz(
                                                    agreement.context.validity.initial,
                                                    agreement.context.validity.timeZone
                                                    )
                                                ) &&
                                                moment
                                                .tz(
                                                    scopedGuaranteeState.period.to,
                                                    agreement.context.validity.timeZone
                                                )
                                                .isSameOrBefore(
                                                    moment
                                                    .tz(
                                                        agreement.context.validity.end,
                                                        agreement.context.validity.timeZone
                                                    )
                                                    .subtract(1, "milliseconds")
                                                )
                                            ) {
                                                var elementProcessed = generateResponse(
                                                agreement,
                                                month,
                                                contractDate,
                                                scopedGuaranteeState
                                                );
                                                // logger.ctl("Writing " + type + " in " + format + " format: " + (index + 1) + "/" + length);
                                                // writeOutput(type, format, elementProcessed, streamingResult, function () {
                                                //     return resolve();
                                                // });
                                                return resolve();
                                            } else {
                                                return resolve();
                                            }
                                            }
                                        });
                                        }).then(
                                        results => {
                                            //guarantees have been finished for this period
                                            logger.ctl(
                                            "All guarantees states for period: %s been processed",
                                            JSON.stringify(period)
                                            );
                                            logger.ctl("Receiving metrics information for this period...");
                                            var processMetrics = [];

                                            Promise.each(processMetrics, function(metricId) {
                                            logger.ctl("Receiving %s for this period...", metricId);
                                            return new Promise((resolve, reject) => {
                                                var priorities = ["P1", "P2", "P3", "P4"];

                                                Promise.each(priorities, function(priority) {
                                                logger.ctl("Receiving %s for this period...", priority);
                                                return new Promise((resolve, reject) => {
                                                    var url = metricsStateURL + metricId;
                                                    logger.ctl("from %s ", url);

                                                    var params =
                                                    "?" +
                                                    "scope.priority=" +
                                                    String(priority) +
                                                    "&scope.type=" +
                                                    String("*") +
                                                    "&scope.serviceLine=" +
                                                    String(
                                                        agreement.context.definitions.scopes["SCO"].serviceLine
                                                        .default
                                                    ) +
                                                    "&scope.activity=" +
                                                    String(
                                                        agreement.context.definitions.scopes["SCO"].activity
                                                        .default
                                                    ) +
                                                    "&window.type=" +
                                                    String("static") +
                                                    "&window.period=" +
                                                    String("monthly") +
                                                    "&window.initial=" +
                                                    String(period.from) +
                                                    "&window.timeZone=" +
                                                    String(agreement.context.validity.timeZone) +
                                                    "&parameters.schedule=" +
                                                    agreement.terms.guarantees.filter(
                                                        g => g.id === metricId
                                                    )[0].of[0].with[metricId].schedule +
                                                    "&parameters.deadline=" +
                                                    agreement.terms.guarantees.filter(
                                                        g => g.id === metricId
                                                    )[0].of[0].with[metricId].deadline +
                                                    "&log.naos.uri=" +
                                                    String(agreement.context.definitions.logs["naos"].uri);

                                                    // parameters.schedule:L-DT00:00-24:00
                                                    // parameters.deadline:<= 2
                                                    // window.initial:2014-10-15T22:00:00.000Z
                                                    // window.period:monthly
                                                    // window.type:static
                                                    // window.timeZone:Europe/Madrid
                                                    // evidences:CHAP_TRS_evidence,issue_trs_duration,issue_pu_duration,issue_trl_duration
                                                    // logs.naos.uri:http://naos.logs.chap.governify.io/api/v1
                                                    // logs.naos.stateUri:http://naos.logs.chap.governify.io/api/v1/count
                                                    // logs.naos.terminator.values:SDK_HIST_ACCEPT_CLOSE
                                                    // logs.naos.terminator.column:ACTION
                                                    // logs.naos.structure.actionColumn:SID
                                                    // logs.naos.structure.timestampColumn:CREATION_DATE
                                                    // logs.naos.structure.instanceIdColumn:INCIDENT_ID
                                                    // config.measures:https://repo.designer.governify.io/chap/chap/GAUSS/indicators/SCO_IO.json?accessToken=710a4950250286365cf841f765a790f1
                                                    // config.schedules.regular:L-DT00:00-24:00
                                                    // config.holidays:null
                                                    // scope.activity:Servicio Avanzado de Soporte
                                                    // scope.serviceLine:Gestión de Incidencia
                                                    // scope.type:*
                                                    // scope.priority:P1

                                                    var query = url + params;

                                                    logger.ctl("-------Doing Get request to ", query);

                                                    request(query, function(err, httpResponse, metricsStates) {
                                                    if (err) {
                                                        logger.warning(
                                                        "There was an error retrieving metric: " +
                                                            err.toString().substr(0, 400)
                                                        );
                                                        return reject(
                                                        "There was an error retrieving metric: " +
                                                            err.toString()
                                                        );
                                                    }

                                                    if (httpResponse.statusCode != 200) {
                                                        logger.warning(
                                                        "Error while retrieving metric: " +
                                                            JSON.stringify(metricsStates, null, 2)
                                                        );
                                                        return reject(
                                                        "Error while retrieving metric: " +
                                                            JSON.stringify(metricsStates, null, 2)
                                                        );
                                                    } else {
                                                        logger.ctl("---All metrics ", metricsStates);
                                                        var metricsStatesArray = JSON.parse(metricsStates);
                                                        logger.ctl("Registry has responded");
                                                        logger.ctl(
                                                        "----metrics length ",
                                                        metricsStatesArray.length,
                                                        " type of ",
                                                        typeof metricsStatesArray
                                                        );
                                                        if (
                                                        metricsStatesArray &&
                                                        Array.isArray(metricsStatesArray)
                                                        ) {
                                                        logger.ctl("Processing response");
                                                        Promise.each(metricsStatesArray, function(
                                                            metricState,
                                                            index,
                                                            length
                                                        ) {
                                                            return new Promise(function(resolve, reject) {
                                                            if (
                                                                (!month ||
                                                                moment(month, "YYYYMM").isSame(
                                                                    moment.tz(
                                                                    metricState.period.to,
                                                                    agreement.context.validity.timeZone
                                                                    ),
                                                                    "month"
                                                                )) &&
                                                                moment
                                                                .tz(
                                                                    metricState.period.from,
                                                                    agreement.context.validity.timeZone
                                                                )
                                                                .isSameOrAfter(
                                                                    moment.tz(
                                                                    agreement.context.validity.initial,
                                                                    agreement.context.validity.timeZone
                                                                    )
                                                                ) &&
                                                                moment
                                                                .tz(
                                                                    metricState.period.to,
                                                                    agreement.context.validity.timeZone
                                                                )
                                                                .isSameOrBefore(
                                                                    moment
                                                                    .tz(
                                                                        agreement.context.validity.end,
                                                                        agreement.context.validity.timeZone
                                                                    )
                                                                    .subtract(1, "milliseconds")
                                                                )
                                                            ) {
                                                                // var result = generateMetricResponse(agreement, contractDate, metricState);
                                                                // var elementProcessed = result.response;
                                                                // console.log(insertOnInflux(result.influx).catch(reject));

                                                                var elementProcessed = generateMetricResponse(
                                                                agreement,
                                                                contractDate,
                                                                metricState
                                                                );
                                                                // logger.ctl("Writing " + type + " in " + format + " format: " + (index + 1) + "/" + length);
                                                                // writeOutput(type, format, elementProcessed, streamingResult, function () {
                                                                //     return resolve();
                                                                // });
                                                                return resolve();
                                                            } else {
                                                                return resolve();
                                                            }
                                                            });
                                                        }).then(function(results) {
                                                            logger.ctl(
                                                            "Finished metrics: %s, with priority: %s",
                                                            metricId,
                                                            priority
                                                            );
                                                            return resolve();
                                                        });
                                                        }
                                                    }
                                                    });
                                                });
                                                }).then(
                                                function(priorityValues) {
                                                    logger.ctl("Finished metrics: %s", metricId);
                                                    return resolve();
                                                },
                                                function(err) {
                                                    logger.warning(
                                                    "Error while retrieving " + type + ": " + metricId
                                                    );
                                                    return reject();
                                                }
                                                );
                                            });
                                            }).then(
                                            function(metricsValues) {
                                                logger.ctl("Finished period: %s", JSON.stringify(period));
                                                logger.ctl("Calculated metrics", metricsValues);
                                                resolve(); //promise of period
                                                //all metrics request for this period have been finished;
                                            },
                                            function(err) {
                                                logger.warning(
                                                "Error while retrieving " +
                                                    type +
                                                    ": " +
                                                    JSON.stringify(err, 2)
                                                );
                                                reject(err);
                                            }
                                            );
                                        },
                                        error => {
                                            reject(error);
                                        }
                                        );
                                    })
                                    .on("error", err => {
                                        logger.error("Error while retrieving " + type + " info: " + err);
                                        loopParams.agreements[agreementId].isProcessFinished = true;
                                        return res.status(500).json(err);
                                                                            })
                                    .on("end", function() {
                                        logger.error("Ended retrieving");
                                        if (!dataReceivedCheck){
                                              if (config.registryMaxRetries >= retry) {
                                                  retry++;
                                                  logger.error("No data received from Registry after connection. Retrying." + retry);
                                                    setTimeout(process, 5000, res, type, agreementId, month, format, kpiParam, serviceLine, activity, pendingPeriods, retry);
                                              } else {
                                                  logger.error("Max retries reached. Manual supervision is needed. The process has been stopped.")
                                                  loopParams.agreements[agreementId].isProcessFinished = true;
                                                  return res.status(500).json(err);
                                              }
                                        }
                                    })
                                    .on("finish", function() {
                                        logger.error("Finished retrieving");

                                    });
                                }
                                    });

                                requestStream.on("error", err => {
                                    if (!retry){
                                        retry = 0
                                    }
                                     if (config.registryMaxRetries >= retry){
                                            retry++;
                                            logger.error("Error in registry connection. Retrying." + retry);
                                         //    createSocketFunctions(url, period, agreement, agreementURL, guaranteesStateURL, metricsStateURL, resolve, reject, retry);
                                         //process(res, type, agreementId, month, format, kpiParam, serviceLine, activity, pendingPeriods, retry);

                                         setTimeout(process, 5000, res, type, agreementId, month, format, kpiParam, serviceLine, activity, pendingPeriods, retry);
                                    }
                                    else{
                                         logger.error("Max retries reached. Manual supervision is needed. The process has been stopped.")
                                         loopParams.agreements[agreementId].isProcessFinished = true;
                                          return res.status(500).json(err);
                                        }

                                    });

                       
                       
                    } else {
                        logger.looper("Reported stopped and period " + JSON.stringify(period) + " will not be calculated");
                    }

                }).then((results) => {

                }, (err) => {

                });
            }).then((results) => {
                //all periods has been finished
                logger.ctl("All periods have been processed");
                // streamingResult.push(null);
                loopParams.agreements[agreementId].isProcessFinished = true;
                //res.end();
            }, (err) => {

            });

        });

    } catch (error) {
        logger.error("Unexpected error: " + error.toString().substr(0, 400));
        return res.status(500).json({
            code: 500,
            message: error.toString()
        });
    }
}

function writeOutput(type, format, data, res, callback) {

    var header = (type == 'KPIs') ? FIELDS_KPIS : FIELDS_SERVICES;

    if (!format || format === 'csv') {
        json2csv({
            data: [data],
            fields: header,
            hasCSVColumnTitle: false
        }, function (err, csv) {
            if (err) {
                logger.error('Error generating CSV for type' + type);
                return res.status(500).json({
                    code: 500,
                    message: err.toString()
                });
            }

            logger.info("Adding data to Streaming...");
            res.push(csv + "\n", 'utf8');
            callback();
        });
    } else if (format === "json") {
        res.push(data);
        callback();
    }

}

function generateResponse(agreement, month, contractDate, kpi, evidence) {
    var guarantee = agreement.terms.guarantees.find(function (guarantee) {
        return guarantee.id === kpi.id;
    });

    if (!guarantee) {
        logger.error('Guarantee not found for KPI: ' + JSON.stringify(kpi.id, null, 2));
        return;
    }

    var ofElement = guarantee.of.find(function (ofElement) {
        return checkScope(kpi, ofElement);
    });

    var metric = agreement.terms.metrics[kpi.id];

    if (!metric) {
        logger.error('Metric not found: ' + JSON.stringify(kpi.id, null, 2));
        return;
    }

    var name, description, mClass, kind, reportable;
    if (metric.metadata) {
        name = metric.metadata.name ? metric.metadata.name : '';
        description = metric.metadata.description ? metric.metadata.description : '';
        mClass = metric.metadata.class ? (metric.metadata.class == 'Negocio' ? 'N' : (metric.metadata.class == 'Totalizador' ? 'T' : '')) : '';
        kind = metric.metadata.kind ? (metric.metadata.kind == 'Penalizador' ? 'P' : (metric.metadata.kind == 'Bonificador' ? 'B' : (metric.metadata.kind == 'Facturador' ? 'F' : ''))) : '';
        reportable = metric.metadata.reportable !== undefined ? (metric.metadata.reportable ? 'SI' : 'NO') : '';
    }

    var frequency;
    if (ofElement.window.period === 'monthly') {
        frequency = 1;
    } else if (ofElement.window.period === 'quarterly') {
        frequency = 3;
    }

    var scopes = [];
    var scope;
    for (var scopeId in guarantee.scope) {
        scope = guarantee.scope[scopeId];
        if (scope && scope.metadata && scope.metadata.reported && kpi.scope[scopeId] !== undefined) {
            scopes.push({
                name: scope.name,
                value: kpi.scope[scopeId]
            });
        }
    }

    var matches;
    var params = ofElement.with[kpi.id];
    var schedule, deadlineSign, deadlineThreshold, deadlineUnit;
    if (params && params.schedule) {
        schedule = (params.schedule === 'L-DT00:00-23:59') ? '24X7' :
            params.schedule.split('T')[0] + ' de ' + params.schedule.split('T')[1].replace('-', ' a ');
    }
    if (params && params.deadline) {
        matches = params.deadline.match(/(\b\d+(\.\d+)?\b)/g);
        if (matches.length > 0) {
            deadlineThreshold = parseFloat(matches[0]).toFixed(2);
        }
        matches = params.deadline.match(/(<[=>]?|==|>=?)/g);
        if (matches.length > 0) {
            deadlineSign = matches[0];
        }

        if (metric.parameters && metric.parameters.deadline) {
            deadlineUnit = metric.parameters.deadline.schema.unit === 'hours' ? 'HORAS' : (metric.parameters.deadline.schema.unit === 'days' ? 'DIAS' : metric.parameters.deadline.schema.unit);
        }
    }

    var regexThresholdSign = /[a-zA-Z_$][a-zA-Z_$0-9]*\s*(>=|<=|<|>|==|!=)\s*(\d*\.?\d*)|(\d*\.?\d*)\s*(>=|<=|<|>|==|!=)\s*[a-zA-Z_$][a-zA-Z_$0-9]*/g;
    var regexThresholdSignArray = regexThresholdSign.exec(ofElement.objective);
    var objectiveThreshold = regexThresholdSignArray[2] ? regexThresholdSignArray[2] : regexThresholdSignArray[3];
    var objectiveSign = regexThresholdSignArray[1] ? regexThresholdSignArray[1] : regexThresholdSignArray[4];

    if (objectiveThreshold) {
        objectiveThreshold = parseFloat(objectiveThreshold).toFixed(2);
    } else {
        logger.info("objectiveThreshold is undefined. Expression: " + ofElement.objective);
        objectiveThreshold = "";
    }

    if (!objectiveSign) {
        logger.info("objectiveSign is undefined. Expression: " + ofElement.objective);
        objectiveSign = "";
    }

    var response = {
        CONTRATO: "SCO",
        MES: moment.tz(kpi.period.to, agreement.context.validity.timeZone).format('YYYYMM'),
        PERIODO: moment.tz(kpi.period.from, agreement.context.validity.timeZone).format('YYYY-MM-DD') + '/' + moment.tz(kpi.period.to, agreement.context.validity.timeZone).format('YYYY-MM-DD'),
        FECHAFAC: moment.tz(contractDate, agreement.context.validity.timeZone).toISOString(),
        LINEA: kpi.scope.serviceLine,
        ACTIVIDAD: kpi.scope.activity,
        KPI: kpi.id,
        NOMBRE: name,
        DESCRIPCION: description,
        CLASE: mClass,
        TIPO: kind,
        INFORMATIVO: reportable,
        UNIDADKPI: metric.schema.unit,
        FRECUENCIA: frequency,
        DIAINICIO: ofElement.window.initial ? moment.tz(ofElement.window.initial, agreement.context.validity.timeZone).date() : '',
        FECHAALTA: ofElement.window.initial ? moment.tz(ofElement.window.initial, agreement.context.validity.timeZone).format('YYYY-MM-DD') : '',
        FECHABAJA: ofElement.window.end ? moment.tz(ofElement.window.end, agreement.context.validity.timeZone).format('YYYY-MM-DD') : '',
        NOMBRE1: scopes[0] ? 'Por ' + scopes[0].name : "",
        NOMBRE2: scopes[1] ? 'Por ' + scopes[1].name : "",
        // NOMBRE3: scopes[2] ? 'Por ' + scopes[2].name : "",
        VALOR1: scopes[0] ? scopes[0].value : "",
        VALOR2: scopes[1] ? scopes[1].value : "",
        // VALOR3: scopes[2] ? scopes[2].value : "",
        HORARIO: schedule ? schedule : '',
        PLAZOSIG: deadlineSign ? deadlineSign : '',
        PLAZOUMB: deadlineThreshold ? deadlineThreshold : '',
        PLAZOUND: deadlineUnit ? deadlineUnit : '',
        OBJETIVOSIG: objectiveSign,
        OBJETIVOUMB: objectiveThreshold
    };

    if (evidence) {
        var CUMPLE = 'SI';
        response.CUMPLE = CUMPLE;
        response.ID = evidence.id;
        response.DURACION_TRS = evidence.issue_trs_duration;
        response.DURACION_TRL = evidence.issue_trl_duration;
        response.DURACION_PU = evidence.issue_pu_duration;
    } else {
        var trueEvidences = [];
        var population = [];
        if (kpi.evidences) {
            trueEvidences = kpi.evidences.filter(function (ev) {
                return ev[kpi.id + '_evidence'] ? JSON.parse(ev[kpi.id + '_evidence']) : false;
            });
            population = kpi.evidences.length;
        }

        var compensationValue = "";
        var compensationUnit = "";



        if (!JSON.parse(kpi.value)) {
            ofElement.penalties.forEach(function (penalty) {
                for (var compVar in penalty.over) {
                    compensationValue = Number(kpi.penalties[compVar]).toFixed(2);
                    compensationUnit = penalty.over[compVar].unit;
                    break;
                }
            });
        }

        var value;
        var oc = trueEvidences.length;
        value = Number(kpi.metrics[kpi.id]).toFixed(2);

        response.OCURRENCIA = oc;
        response.POBLACION = population;
        response.VALOR = value;
        response.COMPENSACION = compensationValue;
        response.COMPENSACIONUND = compensationUnit;
    }
    var year2 = Number(String(response.MES).substr(0, 4));
    var month2 = Number(String(response.MES).substr(4, 6)) - 1;
    var day = Number(String(moment.tz(kpi.period.to, agreement.context.validity.timeZone).format('YYYY-MM-DD')).substr(8, 10));
    //logger.ctl("--------------DAY",JSON.stringify(day));
    var dateaux = moment.tz([year2, month2, day, 23, 59, 59, 999], agreement.context.validity.timeZone).format();
    var date = moment(dateaux).valueOf();
    var properties = {};

    for (var i = 0; i < 3; i++) {
        if (scopes[i]) {
            properties[scopes[i].name] = scopes[i].value;
        }
    }

    // logger.ctl("----------- Center,Node,Priority ",JSON.stringify(properties));
    // logger.ctl("------DATEAUX ",dateaux);
    // logger.ctl("----------DATE ",date,year2,month2,day,response.MES);

    let elements = Object.keys(kpi.metrics).map(k => {
        return {
            measurement: config.influx.measurement,
            tags: {
                agreement: agreement.id,
                id: k,
                priority: (properties.Priority != undefined) ? properties.Priority : "NA",
            },
            fields: {
                value: Number(kpi.metrics[k])
            },
            timestamp: Number(date) * 1000000
        };
    });

    var today = moment();
    let elementsCurrentMonth = Object.keys(kpi.metrics).map(k => {
        logger.info(JSON.stringify({
            'moment(dateaux).format("M")': moment(dateaux).format("M"),
            'today.format("M")': today.format("M"),
            'moment(dateaux).format("YYYY")': moment(dateaux).format("YYYY"),
            'today.format("YYYY")': today.format("YYYY")
        }));
        logger.info("timestamp:" + Number(today.valueOf()) * 1000000);
        logger.info("condition:" + moment(dateaux).format("M") === today.format("M") && moment(dateaux).format("YYYY") === today.format("YYYY"));

        let shouldBeSaved = config.demo ? true : moment(dateaux).format("M") === today.format("M") && moment(dateaux).format("YYYY") === today.format("YYYY");
        if (shouldBeSaved) {
            var a = {
                measurement: config.influx.measurement_historical,
                tags: {
                    agreement: agreement.id,
                    id: k,
                    priority: (properties.Priority != undefined) ? properties.Priority : "NA",
                },
                fields: {
                    value: Number(kpi.metrics[k])
                },
                timestamp: Number(today.valueOf()) * 1000000
            };
            logger.info("OBJ: " + JSON.stringify(a));
            return a;
        }
    });

    influxInsert(elements, () => {
        return response;
    });


    if (elementsCurrentMonth && elementsCurrentMonth.length > 0 && elementsCurrentMonth[0] != null) {
        logger.info("elementsCurrentMonth: " + elementsCurrentMonth.length);
        logger.info("elementsCurrentMonth: " + JSON.stringify(elementsCurrentMonth));
        influxInsert(elementsCurrentMonth, () => {
            return response;
        });
    }

}

function generateMetricResponse(agreement, contractDate, kpi, evidence) {
    var metric = agreement.terms.metrics[kpi.id];

    if (!metric) {
        logger.error('Metric not found: ' + JSON.stringify(kpi.id, null, 2));
        return;
    }
    var name, description, mClass, kind, reportable;
    if (metric.metadata) {
        name = metric.metadata.name ? metric.metadata.name : '';
        description = metric.metadata.description ? metric.metadata.description : '';
        mClass = metric.metadata.class ? (metric.metadata.class == 'Negocio' ? 'N' : (metric.metadata.class == 'Totalizador' ? 'T' : '')) : '';
        kind = metric.metadata.kind ? (metric.metadata.kind == 'Penalizador' ? 'P' : (metric.metadata.kind == 'Bonificador' ? 'B' : (metric.metadata.kind == 'Facturador' ? 'F' : ''))) : '';
        reportable = metric.metadata.reportable !== undefined ? (metric.metadata.reportable ? 'SI' : 'NO') : '';
    }

    var scopes = [];
    // var serviceScope = Object.keys(agreement.context.definitions.scopes)[0];
    for (var scopeId in kpi.scope) {
        var scope = metric.scope[scopeId];
        if (scope && scope.metadata && scope.metadata.reported && kpi.scope[scopeId] !== undefined) {
            scopes.push({
                name: scope.name,
                value: kpi.scope[scopeId]
            });
        }
    }

    var response = {
        CONTRATO: agreement.id,
        MES: moment.tz(kpi.period.to, agreement.context.validity.timeZone).format('YYYYMM'),
        PERIODO: moment.tz(kpi.period.from, agreement.context.validity.timeZone).format('YYYY-MM-DD') + '/' + moment.tz(kpi.period.to, agreement.context.validity.timeZone).format('YYYY-MM-DD'),
        FECHAFAC: moment.tz(contractDate, agreement.context.validity.timeZone).toISOString(),
        LINEA: kpi.scope.serviceLine,
        ACTIVIDAD: kpi.scope.activity,
        KPI: kpi.id,
        NOMBRE: name,
        DESCRIPCION: description,
        // CLASE: mClass,
        // TIPO: kind,
        INFORMATIVO: reportable,
        UNIDADKPI: metric.schema.unit,
        // FRECUENCIA: metric.metadata.frequency,
        // DIAINICIO: metric.metadata.initial ? moment.tz(metric.metadata.initial, agreement.context.validity.timeZone).date() : '',
        // FECHAALTA: metric.metadata.initial ? moment.tz(metric.metadata.initial, agreement.context.validity.timeZone).format('YYYY-MM-DD') : '',
        // FECHABAJA: metric.metadata.end ? moment.tz(metric.metadata.end, agreement.context.validity.timeZone).format('YYYY-MM-DD') : '',
        NOMBRE1: scopes[0] ? 'Por ' + scopes[0].name : "",
        NOMBRE2: scopes[1] ? 'Por ' + scopes[1].name : "",
        // NOMBRE3: scopes[2] ? 'Por ' + scopes[2].name : "",
        VALOR1: scopes[0] ? scopes[0].value : "",
        VALOR2: scopes[1] ? scopes[1].value : ""
        // VALOR3: scopes[2] ? scopes[2].value : "",
        // HORARIO: "",
        // PLAZOSIG: "",
        // PLAZOUMB: "",
        // PLAZOUND: "",
        // OBJETIVOSIG: "",
        // OBJETIVOUMB: "",
    };

    if (evidence) {
        logger.info("Evidence");
        // response.CUMPLE = "SI";
        // response.ID = "";
        // response.ASUNTO = "";
        // response.FECHAAPE = "";
        // response.FECHACIE = "";
        // response.TIEMPO = "";
        // response.TIEMPOPAR = "";
        // response.ORIGEN = "";
        // response.TIPOLOGIA = "";
        // response.PRIORIDAD = "";
        // response.RECURSO = "";
        // response.AREA = "";
        // response.NODO = "";
        // response.CENTRO = "";
        // response.RESOLUTOR = "";
        // response.JUSTIFICADO = "";
        // response.JUSTIFICADODESC = "";
    } else {
        // response.OCURRENCIA = "";
        // response.POBLACION = "";
        response.VALOR = Number(kpi.value).toFixed(2);
        console.log(response.VALOR);
        // response.COMPENSACION = "";
        // response.COMPENSACIONUND = "";
        // response.JUSTIFICADO = "";
        // response.COMPENSACIONJUST = "";
        // response.JUSTIFICADODESC = "";
    }

    var year2 = Number(String(response.MES).substr(0, 4));
    var month2 = Number(String(response.MES).substr(4, 6)) - 1;
    var day = Number(String(moment.tz(kpi.period.to, agreement.context.validity.timeZone).format('YYYY-MM-DD')).substr(8, 10));
    // logger.ctl("--------------DAY",JSON.stringify(day));
    var dateaux = moment.tz([year2, month2, day, 23, 59, 59, 999], agreement.context.validity.timeZone).format();
    var date = moment(dateaux).valueOf();
    var properties = {};

    for (var i = 0; i < scopes.length; i++) {
        if (scopes[i]) {
            properties[scopes[i].name] = scopes[i].value;
        }
    }


    // logger.ctl("----------- Center,Node,Priority ",JSON.stringify(properties));
    // logger.ctl("------DATEAUX ",dateaux);
    // logger.ctl("----------DATE ",date,year2,month2,day,response.MES);

    // influxRequests.push({ id: kpi.id, priority: (properties.Priority != undefined) ? properties.Priority : "NA", node: (properties.Nodo != undefined) ? properties.Nodo : "NA", center: (properties.Centro != undefined) ? properties.Centro : "NA", value: Number(response.VALOR), timestamp: Number(date) * 1000000 })
    // insertOnInflux(kpi, properties, response, date);

    influxInsert([{
        measurement: config.influx.measurement,
        tags: {
            agreement: agreement.id,
            id: kpi.id,
            priority: (properties.Priority != undefined) ? properties.Priority : "NA"
        },
        fields: {
            value: Number(response.VALOR)
        },
        timestamp: Number(date) * 1000000
    }], () => {
        return response;
    });

    let today = moment();
    let shouldBeSaved = config.demo ? true : moment(dateaux).format("M") === today.format("M") && moment(dateaux).format("YYYY") === today.format("YYYY");
    if (shouldBeSaved) {
        influxInsert([{
            measurement: config.influx.measurement_historical,
            tags: {
                agreement: agreement.id,
                id: kpi.id,
                priority: (properties.Priority != undefined) ? properties.Priority : "NA"
            },
            fields: {
                value: Number(response.VALOR)
            },
            timestamp: Number(today.valueOf()) * 1000000
        }], () => {
            return response;
        });
    }
}

function checkScope(scopeObj1, scopeObj2) {
    var checkPriority = true,
        checkServiceLine = true,
        checkActivity = true;

    if (scopeObj1.scope.priority && scopeObj2.scope.priority && scopeObj2.scope.priority.toString() !== "*") {
        checkPriority = scopeObj2.scope.priority.toString() === scopeObj1.scope.priority.toString();
    }
    if (scopeObj1.scope.serviceLine && scopeObj2.scope.serviceLine && scopeObj2.scope.serviceLine.toString() !== "*") {
        checkServiceLine = scopeObj2.scope.serviceLine.toString() === scopeObj1.scope.serviceLine.toString();
    };
    if (scopeObj1.scope.activity && scopeObj2.scope.activity && scopeObj2.scope.activity.toString() !== "*") {
        checkActivity = scopeObj2.scope.activity.toString() === scopeObj1.scope.activity.toString();
    };

    return checkPriority && checkServiceLine && checkActivity;
}


var FIELDS_KPIS = [
    "CONTRATO",
    "MES",
    "PERIODO",
    "FECHAFAC",
    "LINEA",
    "ACTIVIDAD",
    "KPI",
    "NOMBRE",
    "DESCRIPCION",
    // "CLASE",
    // "TIPO",
    "INFORMATIVO",
    "UNIDADKPI",
    // "FRECUENCIA",
    // "DIAINICIO",
    // "FECHAALTA",
    // "FECHABAJA",
    "NOMBRE1",
    "NOMBRE2",
    // "NOMBRE3",
    "VALOR1",
    "VALOR2",
    // "VALOR3",
    // "HORARIO",
    // "PLAZOSIG",
    // "PLAZOUMB",
    // "PLAZOUND",
    // "OBJETIVOSIG",
    // "OBJETIVOUMB",
    // "OCURRENCIA",
    // "POBLACION",
    "VALOR"
    // "COMPENSACION",
    // "COMPENSACIONUND",
    // "JUSTIFICADO",
    // "COMPENSACIONJUST",
    // "JUSTIFICADODESC"
];

var FIELDS_SERVICES = [
    "CONTRATO",
    "MES",
    "PERIODO",
    "FECHAFAC",
    "LINEA",
    "ACTIVIDAD",
    "KPI",
    "NOMBRE",
    "DESCRIPCION",
    "CLASE",
    "TIPO",
    "INFORMATIVO",
    "UNIDADKPI",
    "FRECUENCIA",
    "DIAINICIO",
    "FECHAALTA",
    "FECHABAJA",
    "NOMBRE1",
    "NOMBRE2",
    "NOMBRE3",
    "VALOR1",
    "VALOR2",
    "VALOR3",
    "HORARIO",
    "PLAZOSIG",
    "PLAZOUMB",
    "PLAZOUND",
    "OBJETIVOSIG",
    "OBJETIVOUMB",
    "CUMPLE",
    "ID",
    "JUSTIFICADO",
    "JUSTIFICADODESC",
    "ASUNTO",
    "FECHAAPE",
    "FECHACIE",
    "TIEMPO",
    "TIEMPOPAR",
    "ORIGEN",
    "TIPOLOGIA",
    "PRIORIDAD",
    "RECURSO",
    "AREA",
    "NODO",
    "CENTRO",
    "RESOLUTOR"
];

/**
 * Set up stream and request response headers.
 * Response params must be set once.
 */
var setUpStreamingResult = (agreementId, streamingResult, type, format, res) => {

    if (!loopParams.agreements[agreementId].isStreamingSetUp) {
        streamingResult._read = function () { };
        streamingResult.on('error', function (err) {
            logger.error("Error with streaming: " + err.toString());
        });
        streamingResult.on('data', function (data) {
            logger.debug("Streaming data... \n" + data);
        });

        if (format == 'csv') {
            streamingResult.pipe(res);

            res.writeHead(200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-disposition': 'attachment; filename=' + type + '.csv'
            });

            var header = (type == 'KPIs') ? FIELDS_KPIS : FIELDS_SERVICES;

            json2csv({
                data: [],
                fields: header,
            }, function (err, csv) {
                if (err) {
                    logger.error('Error generating CSV headers');
                    return res.status(500).json({
                        code: 500,
                        message: err.toString()
                    });
                }
                logger.info("Adding headers to CSV...");
                streamingResult.push(csv + "\n", 'utf8');
            });

        } else if (format == 'json') {
            streamingResult.pipe(JSONStream.stringify()).pipe(res);
            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8'
            });
        }

        loopParams.agreements[agreementId].isStreamingSetUp = true;
    }
};

/**
 * Connect and create Influx database for metrics.
 */
var connectAndCreateInfluxDB = () => {

    logger.ctl("Creating influxdb connection to %s", config.influx.host);


    // Set up influx database
    influx = new Influx.InfluxDB({
        host: config.influx.host,
        database: config.influx.database,
        schema: [{
            measurement: config.influx.measurement,
            fields: {
                value: Influx.FieldType.INTEGER
            },
            tags: [
                'agreement',
                'id',
                'priority',
            ]
        }]
    });

    // Create database if it does not exist yet.
    influx.getDatabaseNames().then(names => {
        logger.ctl("DBs in influxdb", names);
        if (!names.includes(config.influx.database)) {
            return influx.createDatabase(config.influx.database);
        }
    }).then(() => {
        logger.ctl("InfluxDb: DB created");
    }).catch(err => {
        logger.ctl("Error creating Influx database!");
    });
};

/**
 * Infinity process execution
 * @param {*} res 
 * @param {*} type 
 * @param {*} agreementId 
 * @param {*} month 
 * @param {*} format 
 * @param {*} kpiParam 
 * @param {*} serviceLine 
 * @param {*} activity 
 */
var loopProcess = (res, type, agreementId, month, format, kpiParam, serviceLine, activity, period) => {

    if (agreementId in loopParams.agreements && !loopParams.isStopped(agreementId)) {
        return res.status(200).json({
            code: 400,
            message: "Reporter computation is already started for " + agreementId
        });
    }

    initAgreementLoopParams(agreementId);

    // process(res, type, agreementId, month, format, kpiParam, serviceLine, activity);

    // setTimeout(function () {
    loopParams.agreements[agreementId].interval = setInterval(function () {

        try {
            if (!loopParams.isStopped(agreementId)) {
                if (loopParams.agreements[agreementId].isProcessFinished) {
                    logger.looper("Initializing a new process from looped process");
                    process(res, type, agreementId, month, format, kpiParam, serviceLine, activity, period);
                } else {
                    logger.looper("Execution is not finished yet. Loop process will keep trying");
                }
            }
        } catch (err) {
            logger.looper("Error");
            logger.error("Error on set up loop execution." + err);
            loopParams.agreements[agreementId].isProcessFinished = true;
            return res.status(500).json(err);
        }

    }, loopParams.default.timer);
    // }, loopParams.default.timer);
};

var influxInsert = (elements, callback) => {
    influx.writePoints(elements, {
        maxRetries: 50,
        requestTimeout: 600000
    }).then(callback).catch((err, data) => {
        logger.ctl("----Error Writing in db ", err);
    });
};

connectAndCreateInfluxDB();