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

const states = require('./states/states.js');


/**
 * Registry states service module.
 * @module StateRegistryService
 * @see module:states
 * @see module:StateRegistry
 * @requires states
 * */
module.exports = {
    /** agreementIdGET. */
    statesAgreementGET: states.agreements.agreementIdGET,
    /** agreementIdDELETE. */
    statesAgreementDELETE: states.agreements.agreementIdDELETE,
    /** agreementIdRELOAD. */
    statesAgreementRELOAD: states.agreements.agreementIdRELOAD,
    /** guaranteesGET. */
    statesAgreementGuaranteesGET: states.guarantees.guaranteesGET,
    /** guaranteeIdGET. */
    statesAgreementGuaranteesGuaranteeGET: states.guarantees.guaranteeIdGET,
    /** guaranteeIdPenaltyPOST. */
    statesAgreementGuaranteesGuaranteePenaltiyPOST: states.guarantees.guaranteeIdPenaltyPOST,
    /** quotasGET. */
    statesAgreementQuotasGET: states.quotas.quotasGET,
    /** quotasQuotaGET. */
    statesAgreementQuotasQuotaGET: states.quotas.quotasQuotaGET,
    /** ratesGET. */
    statesAgreementRatesGET: states.rates.ratesGET,
    /** ratesRateGET. */
    statesAgreementRatesRateGET: states.rates.ratesRateGET,
    /** metricsPOST. */
    statesAgreementMetricsPOST: states.metrics.metricsPOST,
    /** metricsIdPOST. */
    statesAgreementMetricsMetricPOST: states.metrics.metricsIdPOST,
    /** metricsIdPUT. */
    statesAgreementMetricsMetricPUT: states.metrics.metricsIdPUT,
    /** metricsIdIncrease. */
    statesAgreementMetricsMetricIncreasePOST: states.metrics.metricsIdIncrease,
    /** PricingBillingPenaltiesPOST. */
    statesAgreementPricingBillingPenaltiesPOST: states.pricing.PricingBillingPenaltiesPOST,
    /** statesDELETE. */
    statesDELETE: states.agreements.statesDELETE
};