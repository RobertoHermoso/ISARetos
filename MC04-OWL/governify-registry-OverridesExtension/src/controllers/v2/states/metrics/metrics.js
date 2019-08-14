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

const config = require('../../../../configurations');
const logger = require('../../../../logger');
const ErrorModel = require('../../../../errors/index.js').errorModel;
const stateManager = require('../../../../stateManager/v1/stateManager.js');

const Promise = require('bluebird');
const JSONStream = require('JSONStream');
const stream = require('stream');


/**
 * Metrics module
 * @module metrics
 * @see module:states
 * @requires config
 * @requires bluebird
 * @requires JSONStream
 * @requires stream
 * @requires errors
 * @requires stateManager
 * */
module.exports = {
    metricsIdIncrease: _metricsIdIncrease,
    metricsIdPUT: _metricsIdPUT,
    metricsPOST: _metricsPOST,
    metricsIdPOST: _metricsIdPOST
};


/**
 * Increase metric by ID.
 * @param {Object} args {agreement: String, metric: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:metrics.metricsIdIncrease
 * */
function _metricsIdIncrease(args, res) {
    var agreementId = args.agreement.value;
    var metricId = args.metric.value;
    var query = args.scope.value;

    logger.ctlState("New request to increase metric = %s, with values = %s", metricId, JSON.stringify(query, null, 2));

    stateManager({
        id: agreementId
    }).then(function (manager) {
        query.metric = metricId;
        manager.get('metrics', query).then(function (metric) {
            logger.ctlState("Result of getting metricValues: " + JSON.stringify(metric, null, 2));
            logger.ctlState("Query to put " + JSON.stringify(query, null, 2));
            manager.put('metrics', query, manager.current(metric[0]).value + 1).then(function (success) {
                res.json(success.map(function (element) {
                    return manager.current(element);
                }));
            }, function (err) {
                res.status(err.code).json(err);
            });
        }, function (err) {
            res.status(err.code).json(err);
        });
    }, function (err) {
        res.status(err.code).json(err);
    });
}


/**
 * Modify metric by ID.
 * @param {Object} args {agreement: String, metric: String, metricValue: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:metrics.metricsIdPUT
 * */
function _metricsIdPUT(args, res) {
    var agreementId = args.agreement.value;
    var metricValue = args.metricValue.value;
    var metricName = args.metric.value;

    logger.info("New request to PUT metrics over: " + metricName + " with value: " + metricValue);

    stateManager({
        id: agreementId
    }).then(function (manager) {
        manager.put('metrics', {
            metric: metricName,
            scope: metricValue.scope,
            window: metricValue.window
        }, metricValue.value).then(function (success) {
            res.json(success.map(function (element) {
                return manager.current(element);
            }));
        }, function (err) {
            res.status(err.code).json(err);
        });
    }, function (err) {
        res.status(err.code).json(err);
    });
}


/**
 * Post a new metric.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:metrics.metricsPOST
 * */
function _metricsPOST(req, res) {
    res.setHeader('content-type', 'application/json; charset=utf-8');
    var args = req.swagger.params;
    var agreementId = args.agreement.value;

    logger.info("New request to GET metrics of agreement: " + agreementId);

    stateManager({
        id: agreementId
    }).then(function (manager) {
        logger.info("Preparing requests to /states/" + agreementId + "/metrics/{metricId} : ");
        var ret = [];
        if (config.parallelProcess.metrics) {
            var processMetrics = [];
            for (var metricId in manager.agreement.terms.metrics) {
                var metricParams = args.scope.value;
                metricParams.period = metricParams.period ? metricParams.period : {
                    from: '*',
                    to: '*'
                };
                metricParams.metric = metricId;
                processMetrics.push(manager.get('metrics', metricParams));
            }

            var result;
            if (config.streaming) {
                logger.ctlState("### Streaming mode ###");
                result = new stream.Readable({
                    objectMode: true
                });
                result.on('error', function () {
                    logger.streaming("waiting data from stateManager...");
                });
                result.on('data', function () {
                    logger.streaming("Streaming data...");
                });
                result.pipe(JSONStream.stringify()).pipe(res);
            } else {
                logger.ctlState("### NO Streaming mode ###");
                result = [];
            }

            Promise.all(processMetrics).then(function (results) {
                for (var i in results) {
                    result.push(manager.current(results[i]));
                }
                if (config.streaming) {
                    result.push(null);
                } else {
                    result.json(ret);
                }
            });
        } else {
            if (config.streaming) {
                logger.ctlState("### Streaming mode ###");
                ret = new stream.Readable({
                    objectMode: true
                });
                ret.on('error', function () {
                    logger.streaming("waiting data from stateManager...");
                });
                ret.on('data', function () {
                    logger.streaming("Streaming data...");
                });
                ret.pipe(JSONStream.stringify()).pipe(res);
            } else {
                logger.ctlState("### NO Streaming mode ###");
                ret = [];
            }
            Promise.each(Object.keys(manager.agreement.terms.metrics), function (metricId) {
                logger.info("==> metricId = " + metricId);
                var metricParams = args.scope.value;
                metricParams.period = metricParams.period ? metricParams.period : {
                    from: '*',
                    to: '*'
                };
                metricParams.metric = metricId;
                return manager.get('metrics', metricParams).then(function (results) {
                    for (var i in results) {
                        //feeding stream
                        ret.push(manager.current(results[i]));
                    }
                }, function (err) {
                    logger.error(err);
                });
            }).then(function () {
                //end stream
                if (config.streaming) {
                    ret.push(null);
                } else {
                    res.json(ret);
                }
            }, function (err) {
                logger.error("ERROR processing metrics");
                res.status(500).json(new ErrorModel(500, err));
            });
        }

    }, function (err) {
        logger.error("ERROR processing metrics");
        res.status(500).json(new ErrorModel(500, err));
    });
}


/**
 * Post a new metric by ID.
 * @param {Object} args {agreement: String, metric: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:metrics.metricsIdPOST
 * */
function _metricsIdPOST(args, res) {
    var agreementId = args.agreement.value;
    var metricId = args.metric.value;

    var metricParams = args.scope.value;
    metricParams.metric = metricId;
    metricParams.period = metricParams.period ? metricParams.period : {
        from: '*',
        to: '*'
    };

    var ret;
    if (config.streaming) {
        logger.ctlState("### Streaming mode ###");
        ret = new stream.Readable({
            objectMode: true
        });
        ret.on('error', function () {
            logger.streaming("waiting data from stateManager...");
        });
        ret.on('data', function () {
            logger.streaming("Streaming data...");
        });
        ret.pipe(JSONStream.stringify()).pipe(res);
    }

    stateManager({
        id: agreementId
    }).then(function (manager) {
        manager.get('metrics', metricParams).then(function (data) {
            if (config.streaming) {
                res.json(data.map(function (element) {
                    return manager.current(element);
                }));
            } else {
                data.forEach(function (element) {
                    ret.push(manager.current(element));
                });
                ret.push(null);
            }
        }, function (err) {
            logger.error(err);
            res.status(500).json(new ErrorModel(500, err));
        });
    }, function (err) {
        logger.error(err);
        res.status(500).json(new ErrorModel(500, err));
    });
}