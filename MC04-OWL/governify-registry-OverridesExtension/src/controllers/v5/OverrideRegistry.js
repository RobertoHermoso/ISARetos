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

const overrides = require('./overrides/overrides.js');


/**
 * Registry override module.
 * @module OverrideRegistry
 * @see module:OverrideRegistryService
 * @see module:overrides
 * @requires OverrideRegistryService
 * */
module.exports = {

    statesAgreementGuaranteesGuaranteeOverridesGET: _statesAgreementGuaranteesGuaranteeOverridesGET,
    statesAgreementGuaranteesGuaranteeOverridesPOST: _statesAgreementGuaranteesGuaranteeOverridesPOST,
    statesAgreementGuaranteesGuaranteeOverridesDELETE: _statesAgreementGuaranteesGuaranteeOverridesDELETE,
    statesAgreementOverridesDELETE: _statesAgreementOverridesDELETE

};

/** 
 * statesAgreementGuaranteesGuaranteeOverridesGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:OverrideRegistry.statesAgreementGuaranteesGuaranteeOverridesGET
 * */
function _statesAgreementGuaranteesGuaranteeOverridesGET(req, res, next) {
    overrides.statesAgreementGuaranteesGuaranteeOverridesGET(req.swagger.params, res, next);
}

/** 
 * statesAgreementGuaranteesGuaranteeOverridesPOST.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:OverrideRegistry.statesAgreementGuaranteesGuaranteeOverridesPOST
 * */
function _statesAgreementGuaranteesGuaranteeOverridesPOST(req, res, next) {
    overrides.statesAgreementGuaranteesGuaranteeOverridesPOST(req.swagger.params, res, next);
}

/** 
 * statesAgreementGuaranteesGuaranteeOverridesDELETE.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:OverrideRegistry.statesAgreementGuaranteesGuaranteeOverridesDELETE
 * */
function _statesAgreementGuaranteesGuaranteeOverridesDELETE(req, res, next) {
    overrides.statesAgreementGuaranteesGuaranteeOverridesDELETE(req.swagger.params, res, next);
}


/** 
 * statesAgreementOverridesDELETE.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:OverrideRegistry.statesAgreementOverridesDELETE
 * */
function _statesAgreementOverridesDELETE(req, res, next) {
    overrides.statesAgreementOverridesDELETE(req.swagger.params, res, next);
}
