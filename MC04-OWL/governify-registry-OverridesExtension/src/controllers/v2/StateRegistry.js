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


/**
 * Registry states module.
 * @module StateRegistry
 * @see module:StateRegistryService
 * @see module:states
 * @requires StateRegistryService
 * */
module.exports = {
    statesAgreementGET: _statesAgreementGET,
    statesAgreementDELETE: _statesAgreementDELETE,
    statesAgreementRELOAD: _statesAgreementRELOAD,
    statesAgreementGuaranteesGET: _statesAgreementGuaranteesGET,
    statesAgreementGuaranteesGuaranteeGET: _statesAgreementGuaranteesGuaranteeGET,
    statesAgreementGuaranteesGuaranteePenaltiyPOST: _statesAgreementGuaranteesGuaranteePenaltiyPOST,
    statesAgreementMetricsPOST: _statesAgreementMetricsPOST,
    statesAgreementMetricsMetricPOST: _statesAgreementMetricsMetricPOST,
    statesAgreementMetricsMetricHistoryPOST: _statesAgreementMetricsMetricHistoryPOST,
    statesAgreementMetricsMetricIncreasePOST: _statesAgreementMetricsMetricIncreasePOST,
    statesAgreementMetricsMetricPUT: _statesAgreementMetricsMetricPUT,
    statesAgreementPricingGET: _statesAgreementPricingGET,
    statesAgreementPricingBillingPenaltiesPOST: _statesAgreementPricingBillingPenaltiesPOST,
    statesAgreementQuotasGET: _statesAgreementQuotasGET,
    statesAgreementQuotasQuotaGET: _statesAgreementQuotasQuotaGET,
    statesAgreementQuotasQuotaPUT: _statesAgreementQuotasQuotaPUT,
    statesAgreementRatesGET: _statesAgreementRatesGET,
    statesAgreementRatesRateGET: _statesAgreementRatesRateGET,
    statesAgreementRatesRatePUT: _statesAgreementRatesRatePUT,
    statesGET: _statesGET,
    statesDELETE: _statesDELETE
};


/** 
 * statesAgreementGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementGET
 * */
function _statesAgreementGET(req, res, next) {
    StateRegistry.statesAgreementGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementDELETE.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementDELETE
 * */
function _statesAgreementDELETE(req, res, next) {
    StateRegistry.statesAgreementDELETE(req.swagger.params, res, next);
}


/** 
 * statesAgreementRELOAD.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementRELOAD
 * */
function _statesAgreementRELOAD(req, res, next) {
    StateRegistry.statesAgreementRELOAD(req.swagger.params, res, next);
}


/** 
 * statesAgreementGuaranteesGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementGuaranteesGET
 * */
function _statesAgreementGuaranteesGET(req, res, next) {
    StateRegistry.statesAgreementGuaranteesGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementGuaranteesGuaranteeGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementGuaranteesGuaranteeGET
 * */
function _statesAgreementGuaranteesGuaranteeGET(req, res, next) {
    StateRegistry.statesAgreementGuaranteesGuaranteeGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementGuaranteesGuaranteePenaltiyPOST.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementGuaranteesGuaranteePenaltiyPOST
 * */
function _statesAgreementGuaranteesGuaranteePenaltiyPOST(req, res, next) {
    StateRegistry.statesAgreementGuaranteesGuaranteePenaltiyPOST(req.swagger.params, res, next);
}


/** 
 * statesAgreementMetricsPOST.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementMetricsPOST
 * */
function _statesAgreementMetricsPOST(req, res, next) {
    StateRegistry.statesAgreementMetricsPOST(req, res, next);
}


/** 
 * statesAgreementMetricsMetricPOST.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementMetricsMetricPOST
 * */
function _statesAgreementMetricsMetricPOST(req, res, next) {
    StateRegistry.statesAgreementMetricsMetricPOST(req.swagger.params, res, next);
}


/** 
 * statesAgreementMetricsMetricHistoryPOST.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementMetricsMetricHistoryPOST
 * */
function _statesAgreementMetricsMetricHistoryPOST(req, res, next) {
    StateRegistry.statesAgreementMetricsMetricHistoryPOST(req.swagger.params, res, next);
}


/** 
 * statesAgreementMetricsMetricIncreasePOST.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementMetricsMetricIncreasePOST
 * */
function _statesAgreementMetricsMetricIncreasePOST(req, res, next) {
    StateRegistry.statesAgreementMetricsMetricIncreasePOST(req.swagger.params, res, next);
}


/** 
 * statesAgreementMetricsMetricPUT.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementMetricsMetricPUT
 * */
function _statesAgreementMetricsMetricPUT(req, res, next) {
    StateRegistry.statesAgreementMetricsMetricPUT(req.swagger.params, res, next);
}


/** 
 * statesAgreementPricingGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementPricingGET
 * */
function _statesAgreementPricingGET(req, res, next) {
    StateRegistry.statesAgreementPricingGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementPricingBillingPenaltiesPOST.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementPricingBillingPenaltiesPOST
 * */
function _statesAgreementPricingBillingPenaltiesPOST(req, res, next) {
    StateRegistry.statesAgreementPricingBillingPenaltiesPOST(req, res, next);
}


/** 
 * statesAgreementQuotasGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementQuotasGET
 * */
function _statesAgreementQuotasGET(req, res, next) {
    StateRegistry.statesAgreementQuotasGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementQuotasQuotaGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementQuotasQuotaGET
 * */
function _statesAgreementQuotasQuotaGET(req, res, next) {
    StateRegistry.statesAgreementQuotasQuotaGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementQuotasQuotaPUT.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementQuotasQuotaPUT
 * */
function _statesAgreementQuotasQuotaPUT(req, res, next) {
    StateRegistry.statesAgreementQuotasQuotaPUT(req.swagger.params, res, next);
}


/** 
 * statesAgreementRatesGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementRatesGET
 * */
function _statesAgreementRatesGET(req, res, next) {
    StateRegistry.statesAgreementRatesGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementRatesRateGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementRatesRateGET
 * */
function _statesAgreementRatesRateGET(req, res, next) {
    StateRegistry.statesAgreementRatesRateGET(req.swagger.params, res, next);
}


/** 
 * statesAgreementRatesRatePUT.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesAgreementRatesRatePUT
 * */
function _statesAgreementRatesRatePUT(req, res, next) {
    StateRegistry.statesAgreementRatesRatePUT(req.swagger.params, res, next);
}


/** 
 * statesGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesGET
 * */
function _statesGET(req, res, next) {
    StateRegistry.statesGET(req.swagger.params, res, next);
}


/** 
 * statesDELETE.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:StateRegistry.statesDELETE
 * */
function _statesDELETE(req, res, next) {
    StateRegistry.statesDELETE(req.swagger.params, res, next);
}
