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
const stateManager = require('../../../../stateManager/v6/state-manager.js');


/**
 * Quotas state module.
 * @module quotas
 * @see module:states
 * @requires config
 * @requires stateManager
 * */
module.exports = {
    quotasGET: _quotasGET,
    quotasQuotaGET: _quotasIdGET
};


/**
 * Get all quotas.
 * @param {Object} args {agreement: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:quotas.quotasGET
 * */
function _quotasGET(args, res) {
    logger.info("New request to GET quotas");
    var agreementId = args.agreement.value;

    stateManager({
        id: agreementId
    }).get("quotas", function (quotas) {
        res.json(quotas);
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });
}


/**
 * Get quotas by ID.
 * @param {Object} args {agreement: String, quota: String}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:quotas.quotasQuotaGET
 * */
function _quotasIdGET(args, res) {
    logger.info("New request to GET quota");
    var agreementId = args.agreement.value;
    var quotaId = args.quota.value;

    stateManager({
        id: agreementId
    }).get("quotas", {
        id: quotaId
    }, function (quota) {
        res.json(quota);
    }, function (err) {
        logger.error(err.message.toString());
        res.status(err.code).json(err);
    });
}