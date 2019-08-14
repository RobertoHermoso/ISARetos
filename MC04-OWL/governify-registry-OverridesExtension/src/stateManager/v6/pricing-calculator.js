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

const config = require('../../configurations');
const logger = require('../../logger');
const utils = require('../../utils');

const Promise = require('bluebird');
const moment = require('moment');

// const promiseErrorHandler = utils.errors.promiseErrorHandler;

/**
 * Pricing calculator module.
 * @module pricingCalculator
 * @requires config
 * @requires utils
 * @requires bluebird
 * @requires moment
 * @see module:calculators
 * */
module.exports = {
    process: processPricing
};


/**
 * Process all quotas for a given query.
 * @param {Object} agreementDef agreement definition
 * @param {String} query query
 * @param {Object} manager manager
 * @alias module:pricingCalculator.process
 * */

// TODO: issue #74
function processPricing(agreementDef, query, manager) {
    logger.pricing("Preparing Promise to calculate pricing states");
    return new Promise(function (resolve, reject) {
        // Get pricing definition
        var pricingPenaltiesDef = agreementDef.terms.pricing.billing.penalties;

        // Initialize scope classifiers
        var classifiers = [];

        // Initialize penalty object that will be constructed and returned
        var penalties = [];

        if (config.parallelProcess.guarantees) {
            // ** Parallel calculation **
            var processGuarantees = [];
            agreementDef.terms.guarantees.forEach(function (guarantee) {
                processGuarantees.push(manager.get('guarantees', {
                    guarantee: guarantee.id,
                    period: {
                        from: query.window && query.window.initial && query.window.end ? query.window.initial : "*",
                        to: query.window && query.window.initial && query.window.end ? query.window.end : "*"
                    }
                }));
            });

            Promise.all(processGuarantees).then(function (guaranteesStates) {
                guaranteesStates.forEach(function (guaranteeStates) {
                    pricingPenaltiesDef.forEach(function (penalty) {
                        var penaltyId = Object.keys(penalty.over)[0];
                        var groupBy = Object.keys(penalty.groupBy);
                        logger.pricing("Calculating pricing state with values: [penalty=" + penaltyId + ", aggregatedBy=" + penalty.aggregatedBy + ", groupBy= " + groupBy.toString() + "]");
                        for (var i = 0; i < guaranteeStates.length; i++) {
                            var guaranteeState = manager.current(guaranteeStates[i]);
                            logger.info("Processing guaranteeState " + i + " node: " + guaranteeState.scope.node);
                            var classifier = {};
                            classifier.scope = {};
                            classifier.period = guaranteeState.period;
                            classifier.penalty = penaltyId;

                            groupBy.forEach(function (group) {
                                classifier.scope[group] = guaranteeState.scope[group];
                            });

                            var cIndex = utils.containsObject(classifier, classifiers);
                            if (cIndex == -1) {
                                cIndex = classifiers.push(classifier) - 1;
                                penalties[cIndex] = {
                                    "scope": classifier.scope,
                                    "period": classifier.period,
                                    "value": 0,
                                    "penalty": classifier.penalty
                                };
                            }
                            if (guaranteeState.penalties) {
                                penalties[cIndex].value += guaranteeState.penalties[penaltyId];
                            }
                        }
                        logger.pricing("penalties: " + JSON.stringify(penalties, null, 2));
                    });
                });
                return resolve(penalties);
            }, function (err) {
                logger.error(err);
                return reject(err.toString());
            });
        } else {
            // ** Sequential calculation **
            // Initialize array for guarantees states to be queried
            var guaranteesStates = [];
            // Harvest (sequentially) all states of all guarantees
            Promise.each(agreementDef.terms.guarantees, function (guarantee) {
                logger.pricing("Getting state for guarantee = " + guarantee.id);
                return manager.get('guarantees', {
                    guarantee: guarantee.id,
                    period: {
                        from: query.window && query.window.initial && query.window.end ? query.window.initial : "*",
                        to: query.window && query.window.initial && query.window.end ? query.window.end : "*"
                    }
                }).then(function (results) {
                    // store array of guarantee states
                    logger.pricing("States retrieved from guarantee '" + guarantee.id + "' : " + results.length);
                    results.forEach(function (element) {
                        // Store single guarantee state
                        guaranteesStates.push(element);
                    });
                }, function (err) {
                    logger.pricing("Has ocurred an error getting guarantee = " + guarantee.id + ": " + err.toString());
                    return reject(err);
                });
            }).then(function () {
                //Once we have all guarantee States...
                // For each penalty in the definition of pricing/billing/penalties...
                // Generate an item in the penalties array for each serviceLine, for each activity, for each period
                var classifiers = [];
                pricingPenaltiesDef.forEach(function (penalty) {
                    // initialize Id of penalty (e.g. PTOT)
                    var penaltyId = Object.keys(penalty.over)[0];
                    // initialize grouping keys (e.g. serviceLine, activity)
                    var groupBy = Object.keys(penalty.groupBy);
                    logger.pricing("Calculating pricing state with values: [penalty=" + penaltyId + ", aggregatedBy=" + penalty.aggregatedBy + ", groupBy= " + groupBy.toString() + "]:");
                    var periods = utils.time.getPeriods(agreementDef, query.window ? query.window : {
                        window: {}
                    });
                    periods.forEach(function (period) {
                        // Populate scopes from groupBy (e.g. serviceLine & activity)
                        var classifier = {};
                        classifier.scope = {};
                        groupBy.forEach(function (group) {
                            classifier.scope[group] = penalty.groupBy[group].default;
                        });
                        classifier.period = period;
                        classifier.value = 0;
                        classifier.penalty = penaltyId;
                        classifiers.push(classifier);
                    });
                    // For all states (of all guarantees) harvested...
                    for (var i = 0; i < guaranteesStates.length; i++) {
                        // Get current (most recent) record of the state.
                        var guaranteeState = manager.current(guaranteesStates[i]);
                        logger.pricing("\t(" + i + "/" + guaranteesStates.length + ") Processing guaranteeState with scope: ");
                        logger.pricing("\t\t\t" + JSON.stringify(guaranteeState.scope));
                        logger.pricing("ID: " + guaranteeState.id);
                        logger.pricing("Classifiers" + JSON.stringify(classifiers, null, 2));
                        var classifier = classifiers.find(function (classif) {
                            //logger.info(classif);
                            return moment.utc(moment.tz(guaranteeState.period.from, agreementDef.context.validity.timeZone)).isSameOrAfter(classif.period.from) &&
                                moment.utc(moment.tz(guaranteeState.period.to, agreementDef.context.validity.timeZone)).isSameOrBefore(classif.period.to);
                        });

                        if (!!classifier) {
                            logger.pricing("Classifier already initialized");
                            logger.pricing(JSON.stringify(classifier, null, 2));

                            var validScope = true;
                            groupBy.forEach(function (group) {
                                validScope = validScope && (classifier.scope[group] == guaranteeState.scope[group]);
                            });

                            if (validScope) {
                                // Once the classifier is initialized (now or before) ...
                                //... In case this guarantee state has penalties we aggregated it....
                                if (guaranteeState.penalties) {
                                    // Calculate aggregated values of penalty
                                    switch (penalty.aggregatedBy) {
                                        case 'sum':
                                            logger.pricing("SUM " + guaranteeState.penalties[penaltyId] + " penalty to classifier");
                                            classifier.value += guaranteeState.penalties[penaltyId];
                                            break;
                                        case 'prod':
                                            logger.pricing("PROD " + guaranteeState.penalties[penaltyId] + " penalty to classifier");
                                            classifier.value *= guaranteeState.penalties[penaltyId];
                                            break;
                                        default:
                                            logger.pricing("(DEFAULT) SUM " + guaranteeState.penalties[penaltyId] + " penalty to classifier");
                                            classifier.value += guaranteeState.penalties[penaltyId];
                                    }
                                }
                                // Control Saturation (maximum value) with UpTo in the definition
                                if (penalty.upTo && (Math.abs(classifier.value) > Math.abs(penalty.upTo))) {
                                    classifier.value = penalty.upTo;
                                }
                            } else {
                                var classif = {};
                                classif.scope = {};
                                groupBy.forEach(function (group) {
                                    classif.scope[group] = guaranteesStates.scope[group];
                                });
                                classif.period = classifier.period;
                                classif.value = guaranteeState.penalties ? guaranteeState.penalties[penaltyId] : 0;
                                classif.penalty = penaltyId;
                                classifiers.push(classif);
                            }
                        } else {
                            logger.info('Invalid guarantee period: ' + JSON.stringify(guaranteeState.period, null, 2));
                        }
                    }
                    logger.pricing(" Penalties calculated: " + classifiers.length);
                });
                return resolve(classifiers);
            }, function (err) {
                logger.pricing(err.toString());
                return reject(err);
            });
        }
    });
}