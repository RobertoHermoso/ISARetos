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
const db = require('../../database');
// Requiring states controllers
const states = require("./states/states.js");

module.exports = {
    // Agreement controllers

    statesAgreementGET: states.agreements.agreementIdGET,
    statesAgreementDELETE: states.agreements.agreementIdDELETE,
    statesAgreementRELOAD: states.agreements.agreementIdRELOAD,
    // Guarantees controllers

    statesAgreementGuaranteesGET: states.guarantees.guaranteesGET,
    statesAgreementGuaranteesGuaranteeGET: states.guarantees.guaranteeIdGET,
    statesAgreementGuaranteesGuaranteePenaltiyPOST: states.guarantees.guaranteeIdPenaltyPOST,
    // Quotas controllers

    statesAgreementQuotasGET: states.quotas.quotasGET,
    statesAgreementQuotasQuotaGET: states.quotas.quotasQuotaGET,
    // Rates controllers

    statesAgreementRatesGET: states.rates.ratesGET,
    statesAgreementRatesRateGET: states.rates.ratesRateGET,
    // Metrics controllers

    statesAgreementMetricsPOST: states.metrics.metricsPOST,
    statesAgreementMetricsMetricPOST: states.metrics.metricsIdPOST,
    statesAgreementMetricsMetricPUT: states.metrics.metricsIdPUT,
    statesAgreementMetricsMetricIncreasePOST: states.metrics.metricsIdIncrease,
    // Pricing
    statesAgreementPricingBillingPenaltiesPOST: states.pricing.PricingBillingPenaltiesPOST,
    // Delete
    statesDELETE: _statesDELETE,
};

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