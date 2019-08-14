/*!
governify-registry 3.0.1, built on: 2018-04-18
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-registry

governify-registry is an Open-source software available under the 
GNU General Public License (GPL) version 2 (GPL v2) for non-profit 
applications; for commercial licensing terms, please see README.md 
for any inquiry.

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


'use strict';

const logger = require('../../../../logger');

const Promise = require('bluebird');
const moment = require('moment');


/**
 * Utils that are required in guarantees controller module
 * @module gUtils
 * @requires config
 * @requires bluebird
 * @requires moment
 * */
module.exports = {
    getPeriods: _getPeriods,
    penaltyMetric: _PenaltyMetric,
    checkQuery: _checkQuery,
    processMode: _processMode
};


/**
 * This method return a set of periods which are based on a window parameter.
 * @param {AgreementModel} agreement agreement model passed
 * @param {WindowModel} window window model passed
 * @return {Set} set of periods
 * @alias module:gUtils.getPeriods
 * */
function _getPeriods(agreement, window) {
    var periods = [];
    logger.warning("Window: " + JSON.stringify(window, null, 2));
    var Wfrom = moment.utc(moment.tz(window.initial, agreement.context.validity.timeZone));
    var Wto = window.end ? moment.utc(moment.tz(window.end, agreement.context.validity.timeZone)) : moment.utc();
    logger.warning("Window: " + JSON.stringify({
        initial: Wfrom,
        end: Wto
    }, null, 2));
    var from = moment.utc(Wfrom),
        to = moment.utc(Wfrom).add(1, "months").subtract(1, "milliseconds");
    logger.warning("period: " + JSON.stringify({
        from: from,
        to: to
    }, null, 2));
    while (!to || to.isSameOrBefore(Wto)) {
        periods.push({
            from: from,
            to: to
        });
        from = moment.utc(moment.tz(from, agreement.context.validity.timeZone).add(1, "months"));
        to = moment.utc(moment.tz(from, agreement.context.validity.timeZone).add(1, "months").subtract(1, "milliseconds"));
    }

    return periods;
}


/**
 * Constructor for a metric of type penalty.
 * @param {ScopeModel} scope scope
 * @param {ParametersModel} parameters parameters
 * @param {PeriodModel} period period
 * @param {LogsModel} logs logs
 * @param {String} penaltyName penalty name
 * @param {Number} penaltyValue penalty value
 * @return {Object} penalty metric
 * @alias module:gUtils.penaltyMetric
 * */
function _PenaltyMetric(scope, parameters, period, logs, penaltyName, penaltyValue) {
    this.scope = scope;
    this.parameters = parameters;
    this.period = period;
    this.penalty = penaltyName;
    this.value = penaltyValue;
    this.logs = logs;
}


/**
 * This method return 'true' or 'false' when check if query is complied.
 * @param {StateModel} state state
 * @param {QueryModel} query query
 * @return {Boolean} ret
 * @alias module:gUtils.checkQuery
 * */
function _checkQuery(state, query) {
    var ret = true;
    for (var v in query) {
        if (v != "parameters" && v != "evidences" && v != "logs" && v != "window") {
            if (query[v] instanceof Object) {
                ret = ret && _checkQuery(state[v], query[v]);
            } else {
                if ((state[v] !== query[v] && query[v] != "*") || !state[v]) {
                    ret = ret && false;
                }
            }
        }
    }
    return ret;
}


/**
 * Process mode.
 * @param {Object} mode mode
 * @param {Object} stateType state type
 * @param {Object} query query
 * @param {Object} manager manager
 * @param {Object} resolve resolve
 * @param {Object} reject reject
 * @alias module:gUtils.processMode
 * */
function _processMode(mode, stateType, query, manager, resolve, reject) {
    /** if mode is 'true' processMode is parallel **/
    var managerGetPromise = [];
    manager.agreement.terms[stateType].forEach(function (guarantee) {
        managerGetPromise.push(manager.get(stateType, {
            guarantee: guarantee.id
        }));
    });
    var results = [];
    if (mode) {
        logger.ctlState("### Process mode = PARALLEL ###");
        return Promise.settle(managerGetPromise).then(function (promisesResults) {
            if (promisesResults.length > 0) {
                for (var r in promisesResults) {
                    var onePromiseResults = promisesResults[r];
                    if (onePromiseResults.isFulfilled()) {
                        onePromiseResults.value().forEach(function (value) {
                            results.push(manager.current(value));
                        });
                    }
                }
                return resolve(results);
            } else {
                var err = 'Error processing guarantee: empty result';
                logger.error(err);
                return reject(err);
            }
        }, function (err) {
            logger.error(err);
            return reject(err);
        });

    } else {
        logger.ctlState("### Process mode = SEQUENTIAL ###");
        return Promise.each(managerGetPromise, function (promise) {
            return promise.then(resolve, reject);
        });
    }
}
