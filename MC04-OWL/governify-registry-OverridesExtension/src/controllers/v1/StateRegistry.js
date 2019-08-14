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

const StateRegistry = require('./StateRegistryService');


module.exports.statesAgreementGET = function statesAgreementGET(req, res, next) {
    StateRegistry.statesAgreementGET(req.swagger.params, res, next);
};

module.exports.statesAgreementDELETE = function statesAgreementDELETE(req, res, next) {
    StateRegistry.statesAgreementDELETE(req.swagger.params, res, next);
};

module.exports.statesAgreementRELOAD = function statesAgreementRELOAD(req, res, next) {
    StateRegistry.statesAgreementRELOAD(req.swagger.params, res, next);
};

module.exports.statesAgreementGuaranteesGET = function statesAgreementGuaranteesGET(req, res, next) {
    StateRegistry.statesAgreementGuaranteesGET(req.swagger.params, res, next);
};

module.exports.statesAgreementGuaranteesGuaranteeGET = function statesAgreementGuaranteesGuaranteeGET(req, res, next) {
    StateRegistry.statesAgreementGuaranteesGuaranteeGET(req.swagger.params, res, next);
};

module.exports.statesAgreementGuaranteesGuaranteePenaltiyPOST = function statesAgreementGuaranteesGuaranteePenaltiyPOST(req, res, next) {
    StateRegistry.statesAgreementGuaranteesGuaranteePenaltiyPOST(req.swagger.params, res, next);
};

module.exports.statesAgreementMetricsPOST = function statesAgreementMetricsPOST(req, res, next) {
    StateRegistry.statesAgreementMetricsPOST(req, res, next);
};

module.exports.statesAgreementMetricsMetricPOST = function statesAgreementMetricsMetricPOST(req, res, next) {
    StateRegistry.statesAgreementMetricsMetricPOST(req.swagger.params, res, next);
};

module.exports.statesAgreementMetricsMetricHistoryPOST = function statesAgreementMetricsMetricHistoryPOST(req, res, next) {
    StateRegistry.statesAgreementMetricsMetricHistoryPOST(req.swagger.params, res, next);
};

module.exports.statesAgreementMetricsMetricIncreasePOST = function statesAgreementMetricsMetricIncreasePOST(req, res, next) {
    StateRegistry.statesAgreementMetricsMetricIncreasePOST(req.swagger.params, res, next);
};

module.exports.statesAgreementMetricsMetricPUT = function statesAgreementMetricsMetricPUT(req, res, next) {
    StateRegistry.statesAgreementMetricsMetricPUT(req.swagger.params, res, next);
};

module.exports.statesAgreementPricingGET = function statesAgreementPricingGET(req, res, next) {
    StateRegistry.statesAgreementPricingGET(req.swagger.params, res, next);
};

module.exports.statesAgreementPricingBillingPenaltiesPOST = function statesAgreementPricingBillingPenaltiesPOST(req, res, next) {
    StateRegistry.statesAgreementPricingBillingPenaltiesPOST(req, res, next);
};

module.exports.statesAgreementQuotasGET = function statesAgreementQuotasGET(req, res, next) {
    StateRegistry.statesAgreementQuotasGET(req.swagger.params, res, next);
};

module.exports.statesAgreementQuotasQuotaGET = function statesAgreementQuotasQuotaGET(req, res, next) {
    StateRegistry.statesAgreementQuotasQuotaGET(req.swagger.params, res, next);
};

module.exports.statesAgreementQuotasQuotaPUT = function statesAgreementQuotasQuotaPUT(req, res, next) {
    StateRegistry.statesAgreementQuotasQuotaPUT(req.swagger.params, res, next);
};

module.exports.statesAgreementRatesGET = function statesAgreementRatesGET(req, res, next) {
    StateRegistry.statesAgreementRatesGET(req.swagger.params, res, next);
};

module.exports.statesAgreementRatesRateGET = function statesAgreementRatesRateGET(req, res, next) {
    StateRegistry.statesAgreementRatesRateGET(req.swagger.params, res, next);
};

module.exports.statesAgreementRatesRatePUT = function statesAgreementRatesRatePUT(req, res, next) {
    StateRegistry.statesAgreementRatesRatePUT(req.swagger.params, res, next);
};

module.exports.statesGET = function statesGET(req, res, next) {
    StateRegistry.statesGET(req.swagger.params, res, next);
};

module.exports.statesDELETE = function statesDELETE(req, res, next) {
    StateRegistry.statesDELETE(req.swagger.params, res, next);
};