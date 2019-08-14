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
const qs = require('querystring');

const utils = require('../../utils');

const Query = utils.Query;
const promiseErrorHandler = utils.errors.promiseErrorHandler;

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
 * @param {Object} metricQuery metric query object
 * @alias module:metricCalculator.process
 * */
function processMetric(agreement, metricId, metricQuery) {
    return new Promise(function (resolve, reject) {
        try {
            var metric = agreement.terms.metrics[metricId];
            if (!metric) {
                return reject('Metric ' + metricId + ' not found.');
            }
   
            var computerObj = metric.computer;

            /**### BUILD COMPUTER REQUEST QUERY ###**/
            var computerQuery = {};
            computerQuery.parameters = metricQuery.parameters;
            computerQuery.window = metricQuery.window;

            if (metricQuery.evidences) {
                computerQuery.evidences = metricQuery.evidences;
            }
            // //Select logs data. If metric has not log, select by default log.
            // var logDefinition, logId;
            // if (metric.log) {
            //     logId = Object.keys(metric.log)[0]; //control this potential error
            //     if (!logId) { throw new Error('The log field of metric is not well defined in the agreement'); }
            //     logDefinition = metric.log[logId];
            // } else {
            //     //Search default log
            //     var agLogs = agreement.context.definitions.logs;
            //     for (var l in agLogs) {
            //         if (agLogs[l].default) {
            //             logId = l;
            //             logDefinition = agLogs[l];
            //             break;
            //         }
            //     }
            //     if (!logDefinition) { throw new Error('Agreement is not well defined. It Must has at least a default log.'); }
            // }
            // //Build logs field on computer request body //
            // computerQuery.logs = {};
            // computerQuery.logs[logId] = new LogField(
            //     logDefinition.uri,
            //     logDefinition.stateUri,1
            //     logDefinition.terminator,
            //     logDefinition.structure
            // );
           
            // Mapping of columns names in log
           // var scope = utils.scopes.registryToComputerParser(metricQuery.scope, null);
   
            var scope = metricQuery.scope
            computerQuery.measure = JSON.stringify(metric.measure);
            // adding computer config
            computerQuery.config = new Config(
               // computerObj.config.measures,
                computerObj.config.schedules,
                computerObj.config.holidays || null,
                agreement.context.infrastructure.registry + "/states/" + agreement.id + "/guarantees/" + metricId + "/overrides"
            );
            // if (!computerQuery.logs) {
            //     return reject('Log not found for metric ' + metricId + '. ' +
            //         'Please, specify metric log or default log.');
            // }
           // computerQuery.scope = Object.keys(scope).length > 0 ? scope : metricQuery.scope;
            computerQuery.scope = Object.keys(scope).length > 0 ? scope : metricQuery.scope;
            // ### PREPARE REQUEST ###
            //Build URL query that will use on computer request
            var urlParams = Query.parseToQueryParams(computerQuery);
            var computerEndpoint = computerObj.url.replace(/\/$/, '') + "/api/v" + computerObj.apiVersion + "/" + computerObj.name.replace(/^\//, "");
            var url = computerEndpoint + '?' + urlParams;
            var compositeResponse = [];
            logger.metrics("Sending request to computer ( %s ) with params: %s", computerEndpoint, JSON.stringify(computerQuery, null, 2));
            logger.metrics("URL: %s", url);

            //Build and send computer request
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
            var computerRequest = request.get({
                url: computerEndpoint,
                qs: qs.parse(urlParams)
            }).on('response', function computerResponseHandler(httpResponse) {
                //Processing computer response
                //If HTTP status code is not equal 200 reject the promise and end the process
                if (httpResponse.statusCode !== 200) {
                    var errorString = "Error in PPINOT Computer response " + httpResponse.statusCode + ':' + httpResponse.statusMessage;
                    return promiseErrorHandler(reject, "metrics", processMetric.name, httpResponse.statusCode, errorString);
                }

                //Processing data with streaming using JSONStream 
                logger.metrics('Processing streaming and mapping of columns names in log...');
                computerRequest.pipe(JSONStream.parse()).on('data', function (monthMetrics) {
                    try {
                        //Check if computer response is correct
                        if (monthMetrics && Array.isArray(monthMetrics)) {

                            //For each state returned by computer map the scope
                            monthMetrics.forEach(function (metricState) {
                                if (metricState.log && metric.scope) {

                                    //Getting the correct log for mapping scope
                                    var logId = Object.keys(metricState.log)[0];
                                    var log = agreement.context.definitions.logs[logId];
                                    //doing scope mapping
                                    metricState.scope = utils.scopes.computerToRegistryParser(metricState.scope, log.scopes);

                                }
                                //aggregate metrics in order to return all
                                compositeResponse.push(metricState);
                            });
                            logger.metrics('Mapping of columns names in log processed.');

                        } else {
                            let errorString = "Error in computer response for metric: " + metricId + ". Response is not an array:  " + JSON.stringify(monthMetrics);
                            return promiseErrorHandler(reject, "metrics", processMetric.name, 500, errorString);
                        }

                    } catch (err) {
                        let errorString = "Error processing computer response for metric: " + metricId;
                        return promiseErrorHandler(reject, "metrics", processMetric.name, 500, errorString, err);
                    }

                }).on('end', function () {
                    return resolve({
                        metricId: metricId,
                        metricValues: compositeResponse
                    });
                });
            });
        } catch (err) {
            let errorString = 'Error processing metric: ' + metricId + '(' + err + ')';
            return promiseErrorHandler(reject, "metrics", processMetric.name, 500, errorString, err);
        }
    });

}


//### OBJECTS CONSTRUCTORS ###

//constructor of computer request config object
class Config {
    constructor(schedules, holidays, overrides) {
      //  this.measures = measures;
        this.schedules = schedules;
        this.holidays = holidays;
        this.overrides = overrides;
    }
}

//constructor of computer request log object
class LogField {
    constructor(uri, stateUri, terminator, structure) {
        if (!!!uri || !!!stateUri || !!!terminator || !!!structure) {
            throw new Error('The log field of metric is not well defined in the agreement, uri, stateUri, terminator and structure are required fields.');
        }
        this.uri = uri;
        this.stateUri = stateUri;
        this.terminator = terminator;
        this.structure = structure;
    }

}