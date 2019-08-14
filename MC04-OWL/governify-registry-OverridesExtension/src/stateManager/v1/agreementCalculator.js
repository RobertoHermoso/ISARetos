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


"use strict";

const config = require('../../configurations');
const logger = require('../../logger');

const Promise = require('bluebird');

/**
 * Agreement calculator module.
 * @module agreementCalculator
 * @requires config
 * @requires bluebird
 * @see module:calculators
 * */
module.exports = {
    process: _process
};


/**
 * Process agreement.
 * @param {Object} manager manager
 * @param {Object} parameters parameters
 * @param {date} from from date
 * @param {date} to to date
 * @alias module:agreementCalculator.process
 * */
function _process(manager, parameters) {
    return new Promise(function (resolve, reject) {
        try {
            //Process guarantees
            processGuarantees(manager, parameters).then(function (guaranteeResults) {
                // Process metrics
                processMetrics(manager, parameters).then(function () {
                    return resolve(guaranteeResults);
                }, function (err) {
                    return reject(err);
                });
            }, function (err) {
                return reject(err);
            });
        } catch (e) {
            logger.error(e);
            return reject(e);
        }
    });
}


/**
 * Process metrics.
 * @function processMetrics
 * @param {Object} manager manager
 * @param {Object} parameters parameters
 * */
function processMetrics(manager, parameters) {
    return new Promise(function (resolve, reject) {
        var metrics = [];
        if (!parameters.metrics) {
            metrics = Object.keys(manager.agreement.terms.metrics);
        } else {
            for (var metricId in manager.agreement.terms.metrics) {
                if (Object.keys(parameters.metrics).indexOf(metricId) != -1) {
                    metrics.push(metricId);
                }
            }
        }
        var processMetrics = [];
        if (config.parallelProcess.metrics) {
            logger.agreement("Processing metrics in parallel mode");
            logger.agreement("- metrics: " + metrics);

            metrics.forEach(function (metricId) {
                var priorities = ['P1', 'P2', 'P3'];
                if (metricId == 'SPU_IO_K00') {
                    priorities = [''];
                }

                priorities.forEach(function (priority) {
                    parameters.metrics[metricId].scope.priority = priority;
                    processMetrics.push(manager.get('metrics', parameters.metrics[metricId]));
                });
            });

            Promise.settle(processMetrics).then(function (results) {
                if (results.length > 0) {
                    var values = [];
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].isFulfilled()) {
                            if (results[i].value().length > 0) {
                                results[i].value().forEach(function (metricValue) {
                                    values.push(metricValue);
                                });
                            }
                        }
                    }
                    return resolve(values);
                } else {
                    return reject('Error processing metric: empty result');
                }
            }, function (err) {
                console.error(err);
                return reject(err);
            });
        } else {
            logger.agreement("Processing metrics in sequential mode");
            logger.agreement("- metrics: " + metrics);


            metrics.forEach(function (metricId) {
                var priorities = ['P1', 'P2', 'P3'];
                if (metricId == 'SPU_IO_K00') {
                    priorities = [''];
                }

                priorities.forEach(function (priority) {
                    var scp = JSON.parse(JSON.stringify(parameters.metrics[metricId].scope));
                    scp.priority = priority;
                    processMetrics.push({
                        metric: metricId,
                        scope: scp,
                        parameters: parameters.metrics[metricId].parameters,
                        evidences: parameters.metrics[metricId].evidences,
                        window: parameters.metrics[metricId].window,
                        logs: parameters.metrics[metricId].logs,
                        period: {
                            from: '*',
                            to: '*'
                        }
                    });
                });
            });

            var ret = [];

            Promise.each(processMetrics, function (metricParam) {
                logger.agreement("- metricId: " + metricParam.metric);
                return manager.get('metrics', metricParam).then(function (results) {
                    for (var i in results) {
                        ret.push(manager.current(results[i]));
                    }
                }, function (err) {
                    logger.error(err);
                    return reject(err);
                });
            }).then(function (results) {
                if (results.length > 0) {
                    return resolve(ret);
                } else {
                    return reject('Error processing metric: empty result');
                }
            }, function (err) {
                console.error(err);
                return reject(err);
            });
        }
    });
}


/**
 * Process guarantees.
 * @function processGuarantees
 * @param {Object} manager manager
 * @param {Object} parameters parameters
 * */
function processGuarantees(manager, parameters) {
    return new Promise(function (resolve, reject) {

        var guarantees = [];
        if (!parameters.guarantees) {
            guarantees = manager.agreement.terms.guarantees;
        } else {
            guarantees = manager.agreement.terms.guarantees.filter(function (guarantee) {
                return Object.keys(parameters.guarantees).indexOf(guarantee.id) != -1;
            });
        }

        if (config.parallelProcess.guarantees) {
            logger.agreement("Processing guarantees in parallel mode");
            logger.agreement("- guarantees: " + guarantees);

            var processGuarantees = [];
            guarantees.forEach(function (guarantee) {
                processGuarantees.push(manager.get('guarantees', {
                    guarantee: guarantee.id
                }));
            });

            Promise.settle(processGuarantees).then(function (results) {
                if (results.length > 0) {
                    var values = [];
                    for (var i = 0; i < results.length; i++) {
                        if (results[i].isFulfilled()) {
                            if (results[i].value().length > 0) {
                                results[i].value().forEach(function (guaranteeValue) {
                                    values.push(guaranteeValue);
                                });
                            }
                        }
                    }
                    return resolve(values);
                } else {
                    return reject('Error processing compensations: empty result');
                }
            }, function (err) {
                console.error(err);
                return reject(err);
            });
        } else {
            logger.agreement("Processing guarantees in sequential mode");
            logger.agreement("- guarantees: " + guarantees);

            var ret = [];

            Promise.each(guarantees, function (guarantee) {
                logger.agreement("- guaranteeId: " + guarantee.id);
                return manager.get('guarantees', {
                    guarantee: guarantee.id
                }).then(function (results) {
                    for (var i in results) {
                        ret.push(manager.current(results[i]));
                    }
                }, function (err) {
                    logger.error(err);
                    return reject(err);
                });
            }).then(function () {
                return resolve(ret);
            }, function (err) {
                logger.error("Error processing guarantees: ", err);
                return reject(err);
            });
        }
    });
}