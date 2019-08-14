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
const stateManager = require('../../../../stateManager/v5/state-manager.js');
const utils = require('../../../../utils');

var Error = utils.errors.Error;
const Query = utils.Query;

/**
 * Pricing state module.
 * @module pricing
 * @see module:states
 * @requires config
 * @requires stateManager
 * */
module.exports = {
    PricingBillingPenaltiesGET: _PricingBillingPenaltiesGET
};


/**
 * GET pricing billing penalties.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:pricing.PricingBillingPenaltiesGET
 * */
function _PricingBillingPenaltiesGET(req, res) {
    var args = req.swagger.params;

    logger.warning(JSON.stringify(args));
    var agreementId = args.agreement.value;
    var query = new Query(req.query);
    logger.ctlState("New request to get pricing state for agreementId = " + agreementId);

    stateManager({
        id: agreementId
    }).then(function (manager) {
        var validation = utils.validators.pricingQuery(query);
        if (!validation.valid) {
            logger.error("Query validation error");
            res.status(400).json(new Error(400, validation));
        } else {
            manager.get('pricing', query).then(function (data) {

                logger.ctlState("Sending Pricing-Billing-Penalties state");
                res.json(data);

            }, function (err) {
                logger.ctlState("ERROR: " + err.message);
                res.status(err.code).json(err);
            });
        }
    }, function (err) {
        logger.ctlState("ERROR: " + err.message);
        res.status(err.code).json(err);
    });
}