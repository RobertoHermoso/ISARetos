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
const gUtils = require('./gUtils.js');

const Promise = require('bluebird');
const JSONStream = require('JSONStream');
const stream = require('stream');
const moment = require('moment');


/**
 * Guarantees module
 * @module guarantees
 * @see module:states
 * @requires config
 * @requires bluebird
 * @requires JSONStream
 * @requires stream
 * @requires errors
 * @requires stateManager
 * @requires gUtils
 * */
module.exports = {
    guaranteesGET: _guaranteesGET,
    guaranteeIdGET: _guaranteeIdGET,
    guaranteeIdPenaltyPOST: _guaranteeIdPenaltyPOST
};


/**
 * Get all guarantees.
 * @param {Object} args {agreement: String, from: String, to: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:guarantees.guaranteesGET
 * */
function _guaranteesGET(args, res) {
    res.setHeader('content-type', 'application/json; charset=utf-8');
    logger.ctlState("New request to GET guarantees");
    var agreementId = args.agreement.value;

    stateManager({
        id: agreementId
    }).then(function (manager) {
        logger.ctlState("Getting state of guarantees...");

        if (config.parallelProcess.guarantees) {
            logger.ctlState("Processing guarantees in parallel mode");
            var processGuarantees = [];
            manager.agreement.terms.guarantees.forEach(function (guarantee) {
                processGuarantees.push(manager.get('guarantees', {
                    guarantee: guarantee.id
                }));
            });

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

            Promise.settle(processGuarantees).then(function (guaranteesValues) {
                try {
                    if (guaranteesValues.length > 0) {

                        for (var i = 0; i < guaranteesValues.length; i++) {
                            if (guaranteesValues[i].isFulfilled()) {
                                if (guaranteesValues[i].value().length > 0) {
                                    if (config.streaming) {
                                        guaranteesValues[i].value().forEach(function (guaranteeValue) {
                                            result.push(manager.current(guaranteeValue));
                                        });
                                    } else {
                                        var guaranteesResults = guaranteesValues[i].value().map(function (guaranteeValue) {
                                            return manager.current(guaranteeValue);
                                        });
                                        result = result.concat(guaranteesResults);
                                    }
                                }
                            }
                        }
                        if (config.streaming) {
                            result.push(null);
                        } else {
                            res.json(result);
                        }
                    } else {
                        var err = 'Error processing guarantee: empty result';
                        logger.error(err);
                        res.status(500).json(new ErrorModel(500, err));
                    }
                } catch (err) {
                    logger.error(err);
                    res.status(500).json(new ErrorModel(500, err));
                }
            }, function (err) {
                logger.error(err);
                res.status(500).json(new ErrorModel(500, err));
            });
        } else {
            logger.ctlState("Processing guarantees in sequential mode");
            //Build stream when it's required
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
            } else {
                logger.ctlState("### NO Streaming mode ###");
                ret = [];
            }
            Promise.each(manager.agreement.terms.guarantees, function (guarantee) {
                logger.ctlState("- guaranteeId: " + guarantee.id);
                logger.warning("1º ( CTL ) query" + JSON.stringify({
                    guarantee: guarantee.id
                }, null, 2));
                return manager.get('guarantees', {
                    guarantee: guarantee.id
                }).then(function (results) {
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
                logger.error("ERROR processing guarantees: ", err);
                res.status(500).json(new ErrorModel(500, err));
            });
        }
    }, function (err) {
        logger.error(err);
        res.status(500).json(new ErrorModel(500, err));
    });
}


/**
 * Get guarantees by ID.
 * @param {Object} args {agreement: String, guarantee: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:guarantees.guaranteeIdGET
 * */
function _guaranteeIdGET(args, res) {
    logger.ctlState("New request to GET guarantee");
    var agreementId = args.agreement.value;
    var guaranteeId = args.guarantee.value;

    res.setHeader('content-type', 'application/json; charset=utf-8');

    stateManager({
        id: agreementId
    }).then(function (manager) {
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
        manager.get('guarantees', {
            guarantee: guaranteeId
        }).then(function (success) {
            if (config.streaming) {
                res.json(success.map(function (element) {
                    return manager.current(element);
                }));
            } else {
                success.forEach(function (element) {
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


/**
 * Post guarantee penalty by ID.
 * @param {Object} args {agreement: String, guarantee: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:guarantees.guaranteeIdPenaltyPOST
 * */
function _guaranteeIdPenaltyPOST(args, res) {
    var guaranteeId = args.guarantee.value;
    var agreementId = args.agreement.value;
    var query = args.query.value;

    logger.ctlState("New request to GET penalty of " + guaranteeId);

    var offset = query.parameters.offset;

    logger.ctlState("With offset = " + offset);

    stateManager({
        id: agreementId
    }).then(function (manager) {

        var periods = gUtils.getPeriods(manager.agreement, query.window);
        logger.warning("periods: " + JSON.stringify(periods, null, 2));
        var result = [];
        Promise.each(periods, function (element) {
            var p = {
                from: moment.utc(moment.tz(element.from, manager.agreement.context.validity.timeZone).subtract(Math.abs(offset), "months")).toISOString(),
                to: moment.utc(moment.tz(element.to, manager.agreement.context.validity.timeZone).subtract(Math.abs(offset), "months")).toISOString()
            };
            //  logger.ctlState("Query before parse: " + JSON.stringify(query, null, 2));
            var logId = Object.keys(query.logs)[0];
            var log = manager.agreement.context.definitions.logs[logId];
            var scope = {};
            var scopeId = Object.keys(log.scopes)[0];
            var logScopes = Object.keys(log.scopes[scopeId]).map(function (key) {
                return log.scopes[scopeId][key];
            });
            for (var queryScope in query.scope) {
                if (logScopes.indexOf(queryScope) > -1) {
                    for (var logScope in log.scopes[scopeId]) {
                        if (log.scopes[scopeId][logScope] === queryScope) {
                            scope[logScope] = query.scope[queryScope];
                        }
                    }
                } else {
                    scope[queryScope] = query.scope[queryScope];
                }
            }
            query.scope = scope ? scope : query.scope;

            //  logger.ctlState("Query after parse: " + JSON.stringify(query, null, 2));
            logger.warning("Query after parse: " + JSON.stringify(p, null, 2));
            return manager.get('guarantees', {
                guarantee: guaranteeId
                //  period: p //,
                //  window: query.window
            }).then(function (success) {
                var ret = [];
                for (var ie in success) {
                    var e = success[ie];
                    //logger.ctlState("Comparing period:  " + e.period.from + ">=" + p.from + " && " + e.period.to + "<=" + p.to);
                    if (moment(e.period.from).isSameOrAfter(p.from) && moment(e.period.to).isSameOrBefore(p.to) && gUtils.checkQuery(e, query)) {
                        ret.push(e);
                    }
                }
                //logger.ctlState("Result for the period : " + JSON.stringify(element) + "=>\n" + JSON.stringify(ret, null, 2));

                for (var i in ret) {
                    if (manager.current(ret[i]).penalties) {
                        var penalties = manager.current(ret[i]).penalties;
                        for (var penaltyI in penalties) {
                            logger.warning("element: " + JSON.stringify(element, null, 2));
                            result.push(new gUtils.penaltyMetric(ret[i].scope, query.parameters, element, query.logs, penaltyI, penalties[penaltyI]));
                        }
                    }
                }

            }, function (err) {
                logger.error(err);
                //res.status(500).json(new ErrorModel(500, err));
            });

        }).then(function () {

            res.json(result);

        }, function (err) {
            logger.error(err);
            res.status(500).json(new ErrorModel(500, err));
        });

    }, function (err) {
        logger.error(err);
        res.status(500).json(new ErrorModel(500, err));
    });
}