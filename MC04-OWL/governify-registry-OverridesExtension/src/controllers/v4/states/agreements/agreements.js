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
const db = require('../../../../database');
const stateManager = require('../../../../stateManager/v5/state-manager.js');
const mailer = require('../../../../utils/mailer');
const calculators = require('../../../../stateManager/v5/calculators.js');

const Promise = require('bluebird');
const request = require('request');


/**
 * Agreement state module.
 * @module agreementsState
 * @see module:states
 * @requires config
 * @requires stateManager
 * @requires mailer
 * @requires calculators
 * @requires bluebird
 * @requires request
 * */
module.exports = {
    agreementIdGET: _agreementIdGET,
    agreementIdDELETE: _agreementIdDELETE,
    agreementIdRELOAD: _agreementIdRELOAD,
    statesDELETE: _statesDELETE,
    guaranteesGET: require('../guarantees/guarantees.js').guaranteesGET,
    guaranteeIdGET: require('../guarantees/guarantees.js').guaranteeIdGET
};


/**
 * Get an agreement state by agreement ID.
 * @param {Object} args {agreement: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:agreements.agreementIdGET
 * */
function _agreementIdGET(args, res) {
    logger.info("New request to GET agreements (states/agreements/agreements.js)");
    var agreementId = args.agreement.value;

    stateManager({
        id: agreementId
    }).then(function (manager) {
        manager.get("agreement").then(function (agreement) {
            res.json(agreement);
        }, function (err) {
            logger.error(err.message.toString());
            res.status(err.code).json(err);
        });
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });
}


/**
 * Delete an agreement state by agreement ID.
 * @param {Object} args {agreement: String, from: String, to: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:agreements.agreementIdDELETE
 * */
function _agreementIdDELETE(args, res) {
    var agreementId = args.agreements.value;
    logger.info("New request to DELETE agreement state for agreement " + agreementId);
    if (agreementId) {
        var StateModel = db.models.StateModel;
        StateModel.find({
            "agreementId": agreementId
        }).remove(function (err) {
            if (!err) {
                res.sendStatus(200);
                logger.ctlState("Deleted state for agreement " + agreementId);
            } else {
                res.sendStatus(404);
                logger.warning("Can't delete state for agreement " + agreementId + " :" + err);
            }
        });
    } else {
        res.sendStatus(400);
        logger.warning("Can't delete state for agreement " + agreementId);
    }
}


/**
 * Delete all agreement states
 * @param {Object} args {agreement: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:agreements.statesDELETE
 * */
function _statesDELETE(args, res) {
    logger.ctlState("New request to DELETE all agreement states");
    var StateModel = db.models.StateModel;
    StateModel.remove(function (err) {
        if (!err) {
            res.sendStatus(200);
            logger.info("Deleted state for all agreements");
        } else {
            res.sendStatus(404);
            logger.warning("Can't delete state for all agreements: " + err);
        }
    });
}


/**
 * Reload an agreement state by agreement ID.
 * @param {Object} args {agreement: String, from: String, to: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:agreements.agreementIdRELOAD
 * */
function _agreementIdRELOAD(args, res) {
    var agreementId = args.agreements.value;
    var parameters = args.parameters.value;

    logger.ctlState("New request to reload state of agreement " + agreementId);

    var StateModel = db.models.StateModel;
    StateModel.find({
        "agreementId": agreementId
    }).remove(function (err) {
        var errors = [];
        if (!err) {
            var message = 'Reloading state of agreement ' + agreementId + '. ' +
                (parameters.mail ? 'An email will be sent to ' + parameters.mail.to + ' when the process ends' : '');
            res.end(message);

            logger.ctlState("Deleted state for agreement " + agreementId);

            var AgreementModel = db.models.AgreementModel;
            AgreementModel.findOne({
                id: agreementId
            }, function (err, agreement) {
                if (err) {
                    logger.error(err.toString());
                    errors.push(err);
                }
                stateManager({
                    id: agreementId
                }).then(function (manager) {
                    logger.ctlState("Calculating agreement state...");
                    calculators.agreementCalculator.process(manager, parameters.requestedState).then(function () {
                        logger.debug("Agreement state has been calculated successfully");
                        if (errors.length > 0) {
                            logger.error("Agreement state reload has been finished with " + errors.length + " errors: \n" + JSON.stringify(errors));
                        } else {
                            logger.ctlState("Agreement state reload has been finished successfully");

                            if (parameters.mail) {
                                sendMail(agreement, parameters.mail);
                            }
                        }
                    }, function (err) {
                        logger.error(err.message.toString());
                        errors.push(err);
                    });
                }, function (err) {
                    logger.error(err.message.toString());
                    errors.push(err);
                });
            });
        } else {
            logger.error("Can't delete state for agreement " + agreementId + " :" + err);
            errors.push(err);
        }
    });
}


/**
 * Send an email.
 * @function sendMail
 * @param {Object} agreement agreement
 * @param {Object} mail mail parameters
 * */
function sendMail(agreement, mail) {
    logger.ctlState("Sending email to " + mail.to);

    var logRequests = [];
    for (var logId in agreement.context.definitions.logs) {
        var log = agreement.context.definitions.logs[logId];
        log.id = logId;
        logRequests.push(log);
    }

    var logStates = [];
    Promise.each(logRequests, function (log) {
        return new Promise(function (resolve, reject) {
            request.get({
                uri: log.stateUri
            }, function (err, response, body) {
                if (err) {
                    logger.error(err);
                    return reject(err);
                }
                logStates.push({
                    id: log.id,
                    state: body
                });
                return resolve();
            });
        });
    }).then(function () {
        if (logStates.length > 0) {
            mail.content += '<ul>';
            logStates.forEach(function (logState) {
                mail.content += '<li>' + logState.id + ' (' + logState.state + ')</li>';
            });
            mail.content += '<ul/>';
        }

        var mailOptions = {
            from: mail.from,
            to: mail.to,
            subject: mail.subject,
            html: mail.content
        };

        mailer.sendMail(mailOptions, function (error) {
            if (error) {
                return logger.error(error);
            }
            logger.ctlState('Email to ' + mail.to + ' has been sent');
            logger.ctlState('Summer is coming');
        });
    });
}