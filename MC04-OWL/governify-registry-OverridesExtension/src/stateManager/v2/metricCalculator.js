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

const logger = require('../../logger');
const Promise = require('bluebird');
const request = require('request');
const JSONStream = require('JSONStream');

/**
 * Metric calculator module.
 * @module metricCalculator
 * @requires config
 * @requires bluebird
 * @requires js-yaml
 * @requires request
 * @requires JSONStream
 * @see module:calculators
 * */
module.exports = {
    process: processMetric
};


/**
 * Process all metrics.
 * @param {Object} agreement agreement
 * @param {Object} metricId metric ID
 * @param {Object} metricParameters metric parameters
 * @alias module:metricCalculator.process
 * */
function processMetric(agreement, metricId, metricParameters) {
    return new Promise(function (resolve, reject) {
        try {
            var metric = agreement.terms.metrics[metricId];
            if (!metric) {
                return reject('Metric ' + metricId + ' not found.');
            }

            var computerEndpoint = metric.computer;

            var data = {};
            data.parameters = metricParameters.parameters;
            data.window = metricParameters.window;

            if (metricParameters.evidences) {
                data.evidences = metricParameters.evidences;
            }

            // Binding of columns names in log
            var scope = {};
            if (metric.log) {
                // Binding of columns names in custom log
                data.logs = {};
                var logId = Object.keys(metric.log)[0];
                //building computer logs
                data.logs[logId] = {
                    uri: metric.log[logId].uri,
                    stateUri: metric.log[logId].stateUri,
                    measures: metric.log[logId].measures || null,
                    holidays: metric.log[logId].holidays || null
                };
                for (var prop in data.logs[logId]) {
                    if (!data.logs[logId][prop]) {
                        delete data.logs[logId][prop];
                    }
                }

                var scopeId = Object.keys(metric.scope)[0];
                for (var metricScope in metricParameters.scope) {
                    var logScope = metric.log[logId].scopes[scopeId][metricScope];
                    if (metric.log[logId].scopes[scopeId] && logScope) {
                        scope[logScope] = metricParameters.scope[metricScope];
                    } else {
                        scope[metricScope] = metricParameters.scope[metricScope];
                    }
                }
            } else {
                // Binding of columns names in default log
                for (var logId2 in agreement.context.definitions.logs) {
                    var log1 = agreement.context.definitions.logs[logId2];
                    if (log1.default) {
                        data.logs = {};
                        //building computer logs
                        data.logs[logId2] = {
                            uri: log1.uri,
                            stateUri: log1.stateUri,
                            measures: log1.measures || null,
                            holidays: log1.holidays || null
                        };
                        for (var prop2 in data.logs[logId2]) {
                            if (!data.logs[logId2][prop2]) {
                                delete data.logs[logId2][prop2];
                            }
                        }

                        if (metric.scope) {
                            var scopeId2 = Object.keys(metric.scope)[0];
                            for (var metricScope2 in metricParameters.scope) {
                                if (log1.scopes[scopeId2] && log1.scopes[scopeId2][metricScope2]) {
                                    var logScope2 = log1.scopes[scopeId2][metricScope2];
                                    scope[logScope2] = metricParameters.scope[metricScope2];
                                } else {
                                    scope[metricScope2] = metricParameters.scope[metricScope2];
                                }
                            }
                            break;
                        }
                    }
                }
            }

            if (!data.logs) {
                return reject('Log not found for metric ' + metricId + '. ' +
                    'Please, specify metric log or default log.');
            }

            data.scope = Object.keys(scope).length > 0 ? scope : metricParameters.scope;
            logger.metrics("Sending request to computer (" + computerEndpoint + ") with payload: " + JSON.stringify(data, null, 2));

            var compositeResponse = [];
            var computerRequest = request.post({
                headers: {
                    'Content-Type': 'application/json'
                },
                url: computerEndpoint,
                body: JSON.stringify(data)
            }).on('response', function (httpResponse) {
                if (httpResponse.statusCode !== 200) {
                    logger.error("Error in PPINOT Computer response", httpResponse.statusCode + ':' + httpResponse.statusMessage);
                    return reject("Error in PPINOT Computer response", httpResponse.statusCode + ':' + httpResponse.statusMessage);
                }
                computerRequest.pipe(JSONStream.parse()).on('data', function (monthMetrics) {
                    //console.log(monthMetrics);
                    try {
                        //monthMetrics = yaml.safeLoad(monthMetrics);
                        logger.metrics('Processing column name bindings from log...');
                        if (monthMetrics && Array.isArray(monthMetrics)) {
                            monthMetrics.forEach(function (metricState) {
                                if (metricState.logs && metric.scope) {
                                    var logId = Object.keys(metricState.logs)[0];
                                    var log = agreement.context.definitions.logs[logId];
                                    var scope = {};
                                    var scopeId = Object.keys(metric.scope || {})[0];
                                    var logScopes = Object.keys(log.scopes[scopeId] || {}).map(function (key) {
                                        return log.scopes[scopeId][key];
                                    });
                                    for (var metricScope in metricState.scope) {
                                        if (logScopes.indexOf(metricScope) > -1) {
                                            for (var logScope in log.scopes[scopeId]) {
                                                if (log.scopes[scopeId][logScope] === metricScope) {
                                                    scope[logScope] = metricState.scope[metricScope];
                                                }
                                            }
                                        } else {
                                            scope[metricScope] = metricState.scope[metricScope];
                                        }
                                    }
                                    metricState.scope = scope ? scope : metricState.scope;
                                }
                                compositeResponse.push(metricState);
                            });
                            logger.metrics('Column name bindings processed');
                        } else {
                            logger.error('Error in computer response. Response is not an array: ', JSON.stringify(monthMetrics, null, 2));
                            return reject('There was a problem retrieving indicator ' + metricId);
                        }
                    } catch (error) {
                        logger.error("Error in computer response: " + error.toString() + "\nResponse: " + JSON.stringify(monthMetrics, null, 2));
                        return reject("Error in computer response: " + error.toString() + "\nResponse: " + JSON.stringify(monthMetrics, null, 2));
                    }
                }).on('end', function () {
                    return resolve({
                        metricId: metricId,
                        metricValues: compositeResponse
                    });
                });
            });
        } catch (err) {
            logger.error('Error processing metric: ' + metricId + ': ', err);
            return reject('Error processing metric: ' + metricId + ': ' + JSON.stringify(err.toString(), null, 2));
        }
    });

}