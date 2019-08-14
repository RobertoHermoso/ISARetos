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
const Promise = require('bluebird');
const JSONStream = require('JSONStream');
const moment = require('moment');

const config = require('../../../../configurations');
const logger = require('../../../../logger');
const ErrorModel = require('../../../../errors').errorModel;

const stateManager = require('../../../../stateManager/v5/state-manager');

const gUtils = require('./gUtils.js');
const utils = require('../../../../utils');

var Query = utils.Query;
var controllerErrorHandler = utils.errors.controllerErrorHandler;

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
    guaranteeIdPenaltyGET: _guaranteeIdPenaltyGET,
    getGuarantees: _getGuarantees,
};

//Method used internally
function _getGuarantees(agreementId, guaranteeId, query, forceUpdate){
    return new Promise(function (resolve, reject) {
    stateManager({
        id: agreementId
    }).then(function (manager) {
        var guaranteesQueries = [];
        var validationErrors = [];
        manager.agreement.terms.guarantees.forEach(function (guarantee) {
            var queryM = gUtils.buildGuaranteeQuery(guarantee.id, query.from, query.to);
            
            var validation = utils.validators.guaranteeQuery(queryM, guarantee.id, guarantee);
            if (!validation.valid) {
                validation.guarantee = guarantee.id;
                validationErrors.push(validation);
            } else {
                guaranteesQueries.push(queryM);
            }
        });
        if (validationErrors.length === 0) {
                utils.promise.processSequentialPromises('guarantees', manager, guaranteesQueries, null, null, false, true).then(function (result){
                   resolve(result);
                }, function (err){
                    reject( new ErrorModel(500, err));
                });

        } else {
            reject(new ErrorModel(400, validationErrors));
           
        }
    }, function (err) {

        let errorString = 'Error while initializing state manager for agreement: ' + agreementId;
        reject(new ErrorModel(500,errorString + " - " + err));

    });
    })
}

/**
 * Get all guarantees.
 * @param {Object} args {agreement: String, from: String, to: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:guarantees.guaranteesGET
 * */
function _guaranteesGET(req, res) {
    logger.ctlState("New request to GET guarantees");
    var agreementId = req.swagger.params.agreement.value;


    var result;
    if (config.streaming) {
        logger.ctlState("### Streaming mode ###");

        res.setHeader('content-type', 'application/json; charset=utf-8');
        result = utils.stream.createReadable();
        result.pipe(JSONStream.stringify()).pipe(res);

    } else {
        logger.ctlState("### NO Streaming mode ###");
        result = [];
    }

    stateManager({
        id: agreementId
    }).then(function (manager) {

        logger.ctlState("Getting state of guarantees...");
        var validationErrors = [];
        if (config.parallelProcess.guarantees) {

            logger.ctlState("### Process mode = PARALLEL ###");

            var guaranteesPromises = [];
            manager.agreement.terms.guarantees.forEach(function (guarantee) {
                var query = new Query(req.query);
                
                var validation = utils.validators.guaranteeQuery(query, guarantee.id, guarantee);
                if (!validation.valid) {
                    validation.guarantee = guarantee.id;
                    validationErrors.push(validation);
                } else {
                    if (req.query.forceUpdate == "true"){
                    guaranteesPromises.push(manager.get('guarantees', query, true));
                    } else {
                        guaranteesPromises.push(manager.get('guarantees', query, false )); 
                    }
                }
            });

            if (validationErrors.length === 0) {
                utils.promise.processParallelPromises(manager, guaranteesPromises, result, res, config.streaming);
            } else {
                res.status(400).json(new ErrorModel(400, validationErrors));
            }
        } else {

            logger.ctlState("### Process mode = SEQUENTIAL ###");
            var guaranteesQueries = [];
            manager.agreement.terms.guarantees.forEach(function (guarantee) {
                var query = gUtils.buildGuaranteeQuery(guarantee.id, req.query.from, req.query.to);
               
                var validation = utils.validators.guaranteeQuery(query, guarantee.id, guarantee);
                if (!validation.valid) {
                    validation.guarantee = guarantee.id;
                    validationErrors.push(validation);
                } else {
                    guaranteesQueries.push(query);
                }
            });
            if (validationErrors.length === 0) {

                if (req.query.forceUpdate == "true") {
                    utils.promise.processSequentialPromises('guarantees', manager, guaranteesQueries, result, res, config.streaming, true);
                } else {
                    utils.promise.processSequentialPromises('guarantees', manager, guaranteesQueries, result, res, config.streaming, false);
                }
                
            } else {
                res.status(400).json(new ErrorModel(400, validationErrors));
            }
        }
    }, function (err) {
        logger.error('(guarantee controller)' + err);
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
function _guaranteeIdGET(req, res) {
    logger.ctlState("New request to GET guarantee");
    var args = req.swagger.params;
    var agreementId = args.agreement.value;
    var query = new Query(req.query);
    var guaranteeId = args.guarantee.value;
    var forceUpdate = req.headers.forceupdate;

    var ret;
    if (config.streaming) {
        logger.ctlState("### Streaming mode ###");
        res.setHeader('content-type', 'application/json; charset=utf-8');
        ret = utils.stream.createReadable();
        ret.pipe(JSONStream.stringify()).pipe(res);
    } else {
        logger.ctlState("### NO Streaming mode ###");
    }

    stateManager({
        id: agreementId
    }).then(function (manager) {
        var validation = utils.validators.guaranteeQuery(query, guaranteeId, manager.agreement.terms.guarantees.find((e) => {
            return guaranteeId === e.id;
        }));
        if (!validation.valid) {

            let errorString = "Query validation error";
            return controllerErrorHandler(res, "guarantees-controller", "_guaranteeIdGET", 400, errorString);

        } else {
            manager.get('guarantees', query, JSON.parse(forceUpdate)).then(function (success) {
                if (config.streaming) {
                    success.forEach(function (element) {
                        ret.push(manager.current(element));
                    });
                    ret.push(null);
                } else {
                    res.json(success.map(function (element) {
                        return manager.current(element);
                    }));
                }
            }, function (err) {

                let errorString = 'Error retrieving guarantee ' + guaranteeId;
                return controllerErrorHandler(res, "guarantees-controller", "_guaranteeIdGET", err.code || 500, errorString, err);

            });
        }
    }, function (err) {

        let errorString = 'Error while initializing state manager for agreement: ' + agreementId;
        return controllerErrorHandler(res, "guarantees-controller", "_guaranteeIdGET", err.code || 500, errorString, err);

    });
}


/**
 * Post guarantee penalty by ID.
 * @param {Object} args {agreement: String, guarantee: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:guarantees.guaranteeIdPenaltyPOST
 * */
function _guaranteeIdPenaltyGET(req, res) {
    var args = req.swagger.params;
    var guaranteeId = args.guarantee.value;
    var agreementId = args.agreement.value;
    var query = new Query(req.query);
    logger.ctlState("New request to GET penalty of " + guaranteeId);

    var offset = query.parameters.offset;
    logger.ctlState("With offset = " + offset);

    stateManager({
        id: agreementId
    }).then(function (manager) {
        var validation = utils.validators.metricQuery(query, guaranteeId, manager.agreement.terms.guarantees.find((e) => {
            return e.id === guaranteeId;
        }));

        if (!validation.valid) {

            logger.error("Query validation error");
            res.status(400).json(new ErrorModel(400, validation));

        } else {
            var periods = utils.time.getPeriods(manager.agreement, query.window);
            var result = [];

            Promise.each(periods, function (element) {
                var metricPeriod = {
                    from: element.from.toISOString(),
                    to: element.to.toISOString()
                };
                var p = {
                    from: element.from.subtract(Math.abs(offset), "months").toISOString(),
                    to: element.to.subtract(Math.abs(offset), "months").toISOString()
                };

                logger.ctlState("Query before parse: " + JSON.stringify(query, null, 2));
                if (!query.log) {
                    throw new Error('Logs fields is required');
                }
                var logId = Object.keys(query.log)[0];
                var log = manager.agreement.context.definitions.logs[logId];

                query.scope = utils.scopes.computerToRegistryParser(query.scope, log.scopes);
                logger.ctlState("Query after parse: " + JSON.stringify(query, null, 2));

                return manager.get('guarantees', {
                    guarantee: guaranteeId,
                    scope: query.scope,
                    period: p
                }).then(function (success) {
                    var ret = [];
                    for (var ie in success) {
                        var e = success[ie];
                        if (moment(e.period.from).isSameOrAfter(p.from) && moment(e.period.to).isSameOrBefore(p.to) /*&& gUtils.checkQuery(e, query)*/) {
                            ret.push(e);
                        }
                    }
                    for (var i in ret) {
                        if (manager.current(ret[i]).penalties) {
                            var penalties = manager.current(ret[i]).penalties;
                            for (var penaltyI in penalties) {
                                result.push(new gUtils.penaltyMetric(ret[i].scope, query.parameters, metricPeriod, query.logs, penaltyI, penalties[penaltyI]));
                            }
                        }
                    }

                }, function (err) {
                    logger.error(err);
                });

            }).then(function () {

                res.json(result);

            }, function (err) {
                logger.error(err);
                res.status(500).json(new ErrorModel(500, err));
            });
        }

    }, function (err) {
        logger.error(err);
        res.status(500).json(new ErrorModel(500, err));
    });
}