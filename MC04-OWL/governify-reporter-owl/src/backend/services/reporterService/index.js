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

/////////////////////////// EXT DEPENDENCIES ///////////////////////////
const Promise = require("bluebird");
const request = require('request');
const moment = require('moment-timezone');
const JSONStream = require('JSONStream');
const stream = require('stream');

/////////////////////////// INT DEPENDENCIES ///////////////////////////
const config = require("../../configurations");
const logger = require("../../logger");
const utils = require('../../utils');


/////////////////////////// PRIVATE ATTRIBUTES ///////////////////////////
const _contractId = Symbol();
const _guaranteesStateURL = Symbol();
const _metricsStateURL = Symbol();
const _isExecutionFinished = Symbol();
const _kpiParam = Symbol();
const _agreement = Symbol();
const _contractDate = Symbol();
const _persistence = Symbol();
const _metricsForOnDemandCalculation = Symbol();

/////////////////////////////////////////////////////////////// BEGIN CLASS ///////////////////////////////////////////////////////////////
class Reporter {

    /////////////////////////// BEGIN CONSTRUCTOR ///////////////////////////
    constructor(persistence) {
        this["_persistence"] = persistence;
    }
    /////////////////////////// END CONSTRUCTOR ///////////////////////////


    /////////////////////////// SETTERS ///////////////////////////
    set isExecutionFinished(new_isExecutionFinished) {
        this._isExecutionFinished = new_isExecutionFinished;
    }

    set contractId(new_contractId) {
        this._contractId = new_contractId;
        this._agreementURL = config.v1.agreementURL + new_contractId;
        this._guaranteesStateURL = config.v1.statesURL + new_contractId + '/guarantees' + (this._kpiParam ? '/' + this._kpiParam : '');
        this._metricsStateURL = config.v1.statesURL + new_contractId + '/metrics/';
    }

    set kpiParam(new_kpiParam) {
        this._kpiParam = new_kpiParam;
        this._guaranteesStateURL = config.v1.statesURL + this._contractId + '/guarantees' + (new_kpiParam ? '/' + new_kpiParam : '');
    }
    /////////////////////////// END SETTERS ///////////////////////////

    /////////////////////////// GETTERS ///////////////////////////
    get agreementURL() {
        return this._agreementURL;
    }

    get kpiParam() {
        return this._kpiParam;
    }

    get isExecutionFinished() {
        return this._isExecutionFinished;
    }

    get contractId() {
        return this._contractId;
    }

    get guaranteesStateURL() {
        return this._guaranteesStateURL;
    }

    get metricsStateURL() {
        return this._metricsStateURL;
    }

    get agreement() {
        return this._agreement;
    }

    get contractDate() {
        return this._contractDate;
    }

    get persistence() {
        return this._persistence;
    }

    get metricsForOnDemandCalculation() {
        return this._metricsForOnDemandCalculation;
    }
    /////////////////////////// END GETTERS ///////////////////////////


    /////////////////////////// AUX FUNCTIONS ///////////////////////////
    /**
     * This method returns a set of periods which are based on a window parameter.
     * @param {AgreementModel} agreement agreement model passed
     * @param {WindowModel} window window model passed
     * @return {Set} set of periods
     * @alias module:gUtils.getPeriods
     * */
    static getPeriods(agreement, window) {

        let periods = [];
        let Wfrom = moment.utc(moment.tz(window.initial, agreement.context.validity.timeZone));
        let Wto = window.end ? moment.utc(moment.tz(window.end, agreement.context.validity.timeZone)) : moment.utc();

        let from = moment.utc(moment.tz(Wfrom, agreement.context.validity.timeZone)),
            to = moment.utc(moment.tz(Wfrom, agreement.context.validity.timeZone).add(1, "months").subtract(1, "milliseconds"));

        while (!to || to.isSameOrBefore(Wto)) {
            periods.push({
                from: from.toISOString(),
                to: to.toISOString()
            });
            from = moment.utc(moment.tz(from, agreement.context.validity.timeZone).add(1, "months"));
            to = moment.utc(moment.tz(from, agreement.context.validity.timeZone).add(1, "months").subtract(1, "milliseconds"));
        }

        return periods;
    }
    /////////////////////////// END AUX FUNCTIONS ///////////////////////////


    /////////////////////////// MAIN FUNCTION ///////////////////////////
    process(periods) {
        console.log("STARTING")
        return new Promise((resolve, reject) => {
            console.log("STARTING2")
            this._
            logger.ctl("New request to get states for the agreement = %s", this._contractId);
            try {
                logger.ctl("Getting the agreements from Registry with contractId = %s", this._contractId);
                request.get({
                    url: this._agreementURL,
                    json: true
                }, (error, httpResponse, response) => {
                    if (error) {
                        logger.error("Error while retrieving agreement: %s", error.toString().substr(0, 400));
                        return reject(error.toString());
                    }

                    if (!!!httpResponse || typeof !!!httpResponse === "undefined" || httpResponse.statusCode !== 200) {
                        logger.error("Error while retrieving agreement: %s", httpResponse ? JSON.stringify(response, null, 2).substr(0, 400) : "undefined response");
                        return reject(response);
                    }

                    logger.ctl("The agreement has been retrieved successfully");

                    this._agreement = response;
                    this._contractDate = this._agreement.context.validity.initial;
                    logger.ctl("Setting agreement and initial date: %s", this._contractDate);

                    logger.ctl("Retrieving info from: %s", this._guaranteesStateURL);

                   // periods = ""; //TEMPORAL FIX
                    if (!periods || periods == null || periods == ""){
                        periods = Reporter.getPeriods(this._agreement, {
                            initial: this._agreement.context.validity.initial
                        });
                    }
                 

                    logger.ctl("Periods for requests %s", JSON.stringify(periods, null, 2));

                    Promise.each(periods, this._calculatePeriods.bind(this)).then((results) => {
                        logger.ctl("All the periods have been processed (results length: %d)", results.length);
                        return resolve(results);
                    }).catch((error) => {
                        return reject(error);
                    });
                });

            } catch (error) {
                logger.error("Unexpected error: " + error.toString().substr(0, 400));
                return reject(error.toString());
            }
        });
    }
    /////////////////////////// END MAIN FUNCTION ///////////////////////////


    /////////////////////////// CORE FUNCTIONS ///////////////////////////
    _calculatePeriods(period, index) {
        return new Promise((resolve, reject) => {
            let url = this._guaranteesStateURL + '?from=' + period.from + '&to=' + period.to;
            logger.ctl("Request %d from %s", (index + 1), JSON.stringify(url, null, 2));
            let requestStream = request.get(url);

            requestStream.on('response', (response) => {
                if (response.code && response.code !== 200) {
                    logger.error("Error while retrieving information from the period (%s,%s): %s", period.from, period.to, response.message);
                    return reject(response.message);
                } else {
                    logger.ctl("Connection with Registry successfully established");
                    let kpis = [];

                    logger.ctl("Receiving scoped guarantees information...");

                    requestStream.pipe(JSONStream.parse()).on('error', (error) => {
                        logger.error("Error while retrieving scoped guarantees information: %s", error);
                        return reject(error);
                    }).on('data', (guaranteeStates) => {
                        if (guaranteeStates.code) {
                            return reject(guaranteeStates.code);
                        } else {
                            this._processGuaranteeStates(guaranteeStates).catch((error) => {
                                return reject(error);
                            });
                        }
                    }).on('end', (data) => {
                        return resolve(data);
                    });
                }
            });
        });
    }

    _processGuaranteeStates(guaranteeStates) {
        return new Promise((resolve, reject) => {
            logger.ctl("Scoped guarantees states received: %d", guaranteeStates.length);
            Promise.each(guaranteeStates, this._calculateScopedGuaranteeState.bind(this)).then((results) => {
                logger.ctl("All the scoped guarantees states for the period been processed: %d", results.length);
                return resolve(results);

                if (false && this._metricsForOnDemandCalculation) { //FIXME: this feature should be modelled and defined in depth. Currently not supported
                    logger.ctl("Receiving metrics information for on-demand calculation for this period...");
                    Promise.each(this._metricsForOnDemandCalculation.names, this._calculateOnDemandMetric.bind(this)).then((metricsValues) => {
                        logger.ctl("All the metrics for on-demand calculation for the period have been processed: %d", metricsValues.length);
                        logger.ctl("Calculated metrics: ", metricsValues);
                        return resolve(metricsValues);
                    }, (error) => {
                        logger.warning("Error while retrieving metrics information for on-demand calculation for the period : %s", JSON.stringify(error, 2));
                        return reject(error);
                    });
                }

            }, (error) => {
                logger.warning("Error while retrieving scoped guarantees states for the period: %s", JSON.stringify(error, 2));
                return reject(error);
            });
        });
    }

    //TODO: Remove. This method for recalculate point

    _calculateScopedGuaranteeState(scopedGuaranteeState, index, length) {
        return new Promise((resolve, reject) => {
            if (!this._kpiParam || this._kpiParam === scopedGuaranteeState.id) {
                logger.ctl("Processing KPI: %d/%d", (index + 1), length);
                if (scopedGuaranteeState.evidences) { 
                    Promise.each(scopedGuaranteeState.evidences, this._calculateEvidence.bind(this)).then((results) => {
                        return resolve(results);
                    });
                } else {
                    logger.warning("There are no evidences for the KPI: %s", JSON.stringify(scopedGuaranteeState.id, null, 2));
                    return resolve();
                }
            }
        });
    }

    _calculateEvidence(evidence, index, length) {
        return new Promise((resolve, reject) => {
            logger.ctl("Processing evidence: %d/%d", (index + 1), length);
          //  logger.warning("Guarantee to: %s", scopedGuaranteeState.period.to);
            logger.warning("Limit TO: %s", moment.tz(this._agreement.context.validity.end, this._agreement.context.validity.timeZone).subtract(1, 'milliseconds').toISOString());

            this._generateResponse(this._agreement, this._month, this._contractDate, this._scopedGuaranteeState, evidence).then((elementProcessed) => {
                return resolve(elementProcessed);
            });

        });

    }
    /////////////////////////// END CORE FUNCTIONS ///////////////////////////

    /////////////////////////// BEGIN OVERRIDABLE BUSINESS FUNCTIONS ///////////////////////////
    _generateResponse(kpi, evidence) {
        return new Promise((resolve, reject) => {
            return reject("This abstract Reporter cannot generate a response. Please consider using a specific implementation.");
        });
    }
    /////////////////////////// END OVERRIDABLE BUSINESS FUNCTIONS ///////////////////////////

    /////////////////////////// METRIC ON DEMAND FUNCTIONS ///////////////////////////
    _calculateOnDemandMetric(metricId) {
        logger.ctl("Receiving %s for this period...", metricId);
        return new Promise((resolve, reject) => {
            //TODO: now it only supports priority calculation.
            Promise.each(this._metricsForOnDemandCalculation.scope.priorities, this._calculateScopedOnDemandMetric.bind(this)).then((scopedMetricValues) => {
                logger.ctl("All the scoped metrics for on-demand calculation for the period %s have been processed: %d", JSON.stringify(period), scopedMetricValues.length);
                logger.ctl("Calculated scoped metrics: %s", scopedMetricValues);
                return resolve(scopedMetricValues);
            }, (error) => {
                logger.warning("Error while retrieving scoped metrics information for on-demand calculation for metric %s", metricId, JSON.stringify(error, 2));
                return reject(error);
            });
        });
    }

    _calculateScopedOnDemandMetric(priority) {
        //TODO: now it only supports priority calculation.
        logger.ctl("Receiving metric scope %s for this period...", priority);
        return new Promise((resolve, reject) => {
            logger.ctl("Getting scoped metric %s ", url);

            //FIXME
            let params = "?" +
                "scope.priority=" + String(priority) +
                "&scope.type=" + String("*") +
                "&scope.serviceLine=" + String(agreement.context.definitions.scopes[this._contractId].serviceLine.default) +
                "&scope.activity=" + String(agreement.context.definitions.scopes[this._contractId].activity.default) +
                "&window.type=" + String('static') +
                "&window.period=" + String('monthly') +
                "&window.initial=" + String(period.from) +
                "&window.timeZone=" + String(agreement.context.validity.timeZone) +
                "&parameters.schedule=" + this._agreement.terms.guarantees.filter((g) => g.id === metricId)[0].of[0].with[metricId].schedule +
                "&parameters.deadline=" + this._agreement.terms.guarantees.filter((g) => g.id === metricId)[0].of[0].with[metricId].deadline +
                "&log." + this._metricsForOnDemandCalculation.logName + ".uri=" + String(agreement.context.definitions.logs[this._metricsForOnDemandCalculation.logName].uri);

            let queryURL = (metricsStateURL + metricId + params).replace("//,/");

            logger.ctl("Doing request to retrieve scoped metric to:", queryURL);

            request(queryURL, (err, httpResponse, metricsStates) => {
                if (error) {
                    logger.warning("There was an error while retrieving metric: " + error.toString().substr(0, 400));
                    return reject("There was an error while retrieving metric: " + error.toString());
                }

                if (!!!!httpResponse || typeof !!!httpResponse === "undefined" || httpResponse.statusCode != 200) {
                    logger.warning("Error while retrieving metric: " + JSON.stringify(metricsStates, null, 2));
                    return reject("Error while retrieving metric: " + JSON.stringify(metricsStates, null, 2));
                } else {
                    logger.ctl("All metrics %s", metricsStates);
                    let metricsStatesArray = JSON.parse(metricsStates);
                    logger.ctl("Metrics length %d type of %s", metricsStatesArray.length, typeof metricsStatesArray);
                    if (metricsStatesArray && Array.isArray(metricsStatesArray)) {
                        logger.ctl("Processing metric response");
                        Promise.each(metricsStatesArray, (metricState, index, length) => {
                            return new Promise((resolve, reject) => {
                                logger.ctl("Processing metric: %d/%d", (index + 1), length);
                                this._generateOnDemandMetricResponse(metricState).then((elementProcessed) => {
                                    return resolve(elementProcessed);
                                });
                            });
                        }).then((results) => {
                            logger.ctl("Finished metric calculation %s, with scope: %s", metricId, priority);
                            return resolve(results);
                        });
                    }
                }
            });
        });
    }

    _generateOnDemandMetricResponse(metricState) {
        return new Promise((resolve, reject) => {
            logger.error("_generateOnDemandMetricResponse NOT implemented yet.");
            return reject("_generateOnDemandMetricResponse NOT implemented yet.");
        });
    }
    /////////////////////////// END METRIC ON DEMAND FUNCTIONS ///////////////////////////


    /////////////////////////////////////////////////////////////// END CLASS ///////////////////////////////////////////////////////////////
}

module.exports = {
    Reporter: Reporter,
};