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

const $RefParser = require('json-schema-ref-parser');
const logger = require('../../../logger');
const db = require('../../../database');
const agreementManager = require('governify-agreement-manager').operations.states;

const agreementState = require('../states/agreements/agreements');
const stateRegistrySrv = require('../StateRegistryService');
const ErrorModel = require('../../../errors/index.js').errorModel;

module.exports = {
    agreementsPOST: _agreementsPOST,
    agreementsDELETE: _agreementsDELETE,
    agreementsGET: _agreementsGET,
    agreementIdGET: _agreementIdGET,
    agreementIdDELETE: _agreementIdDELETE
};

function _agreementsGET(args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     **/
    logger.info("New request to GET agreements agreements/agreements.js");
    var AgreementModel = db.models.AgreementModel;
    AgreementModel.find(function (err, agreements) {
        if (err) {
            logger.error(err.toString());
            res.json(new ErrorModel(500, err));
        }
        logger.info("Agreements returned");
        res.json(agreements);
    });
}


function _agreementsDELETE(args, res) {
    logger.info("New request to DELETE all agreements");
    var AgreementModel = db.models.AgreementModel;
    AgreementModel.remove({}, function (err) {
        if (!err) {
            logger.info("Deleted all agreements");
            stateRegistrySrv.statesDELETE(args, res);
        } else {
            res.sendStatus(404);
            logger.warning("Can't delete all agreements: " + err);
        }
    });

}

function _agreementIdGET(args, res) {
    /**
     * parameters expected in the args:
     * agreement (String)
     **/
    logger.info("New request to GET agreement with id = " + args.agreement.value);
    var AgreementModel = db.models.AgreementModel;
    AgreementModel.findOne({
        id: args.agreement.value
    }, function (err, agreement) {
        if (err) {
            logger.error(err.toString());
            return res.status(500).json(new ErrorModel(500, err));
        }

        if (!agreement) {
            logger.error('There is no agreement with id: ' + args.agreement.value);
            return res.status(404).json(new ErrorModel(404, 'There is no agreement with id: ' + args.agreement.value));
        }

        logger.info("Agreement returned");
        res.json(agreement);
    });
}

function _agreementIdDELETE(args, res) {
    logger.info("New request to DELETE agreement");
    var agreementId = args.agreement.value;
    if (agreementId) {
        var AgreementModel = db.models.AgreementModel;
        AgreementModel.find({
            "id": agreementId
        }).remove(function (err) {
            if (!err) {
                logger.info("Deleted agreement with id " + agreementId);
                agreementState.agreementIdDELETE(args, res);
            } else {
                res.sendStatus(404);
                logger.warning("Can't delete agreement with id " + agreementId);
            }
        });
    } else {
        res.sendStatus(400);
        logger.warning("Can't delete agreement with id " + agreementId);
    }
}


function _agreementsPOST(args, res) {
    /**
     * parameters expected in the args:
     * agreement (Agreement)
     **/
    // no response value expected for this operation

    //console.log(db.models.agreement);
    logger.info("New request to CREATE agreement");
    $RefParser.dereference(args.agreement.value, function (err, schema) {
        if (err) {
            logger.error(err.toString());
            res.json(new ErrorModel(500, err));
        } else {
            var agreement = new db.models.AgreementModel(schema);
            agreement.save(function (err) {
                if (err) {
                    logger.error("Mongo error saving agreement: " + err.toString());
                    res.json(new ErrorModel(500, err));
                } else {
                    logger.info('New agreement saved successfully!');
                    logger.info('Initializing agreement state');
                    //Initialize state
                    agreementManager.initializeState(schema, function (st) {
                        var state = new db.models.StateModel(st);
                        state.save(function (err) {
                            if (err) {
                                logger.error("Mongo error saving state: " + err.toString());
                                res.json(new ErrorModel(500, err));
                            } else {
                                logger.info("State initialized successfully!");
                                res.json({
                                    code: 200,
                                    message: 'New agreement saved successfully!',
                                    data: agreement
                                });
                            }
                        });
                    }, function (err) {
                        logger.error("Mongo error saving state: " + err.toString());
                        res.json(new ErrorModel(500, err));
                    });
                }
            });
        }
    });
}