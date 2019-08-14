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

const logger = require('../../logger');
const ErrorModel = require('../../errors/index.js').errorModel;

const Promise = require('bluebird');


/**
 * Quotas calculator module.
 * @module quotasCalculator
 * @requires config
 * @requires errors
 * @requires bluebird
 * @see module:calculators
 * */
module.exports = {
    process: processQuotas
};

/**
 * Process all quotas for a given query.
 * @param {Object} stateManager stateManager
 * @param {String} query query
 * @alias module:quotasCalculator.process
 * */
function processQuotas(stateManager, query) {
    return new Promise(function (resolve, reject) {
        logger.quotas("Calculating quotas for query = " + JSON.stringify(query, null, 2));

        var agreement = stateManager.agreement;

        var quotaDef = null;
        for (var q in agreement.term.quotas) {
            var indexQuota = agreement.term.quotas[q];
            if (indexQuota.id === query.quota) {
                quotaDef = indexQuota;
            }
        }
        if (!quotaDef) {
            logger.error("Not found quota for id = %s", query.quotas);
            return reject(new ErrorModel(404, "Not found quota for id = %s", query.quotas));
        }
    });

}
