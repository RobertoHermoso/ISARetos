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

const ErrorModel = require('../../../../errors/index.js').errorModel;
const config = require('../../../../configurations');
const logger = require('../../../../logger');
const stateManager = require('../../../../stateManager/v1/stateManager.js');
const Promise = require("bluebird");


module.exports.metricsIdIncrease = function (args, res) {
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

};

module.exports.metricsIdPUT = function (args, res) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * metric (String)
     * metricValue ()
     **/
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
};

module.exports.metricsPOST = function (req, res) {
    /**
     * parameters expected in the args:
     * agreement (String)
     **/
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

            Promise.all(processMetrics).then(function (metricsValues) {
                for (var i in metricsValues) {
                    ret.push(manager.current(metricsValues[i]));
                }
                res.json(ret);
            });
        } else {
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
                        ret.push(manager.current(results[i]));
                    }
                }, function (err) {
                    logger.error(err);
                });
            }).then(function () {
                res.json(ret);
            }, function (err) {
                logger.error("ERROR processing metrics");
                res.status(500).json(new ErrorModel(500, err));
            });
        }

    }, function (err) {
        logger.error("ERROR processing metrics");
        res.status(500).json(new ErrorModel(500, err));
    });
};

module.exports.metricsIdPOST = function (args, res) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * metric (String)
     **/
    var agreementId = args.agreement.value;
    var metricId = args.metric.value;

    var metricParams = args.scope.value;
    metricParams.metric = metricId;
    metricParams.period = metricParams.period ? metricParams.period : {
        from: '*',
        to: '*'
    };

    stateManager({
        id: agreementId
    }).then(function (manager) {
        manager.get('metrics', metricParams).then(function (data) {
            res.json(data.map(function (element) {
                return manager.current(element);
            }));
        }, function (err) {
            logger.error(err);
            res.status(500).json(new ErrorModel(500, err));
        });
    }, function (err) {
        logger.error(err);
        res.status(500).json(new ErrorModel(500, err));
    });
};