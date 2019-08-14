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

const bills = require('./bills/bills.js');


/**
 * Registry override module.
 * @module BillRegistry
 * @see module:BillRegistryService
 * @see module:overrides
 * @requires BillRegistryService
 * */
module.exports = {

    billsGET: _billsGET,
    billsPUT: _billsPUT,
    billsDELETE: _billsDELETE

};

/** 
 * billsGET.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:BillRegistry.billsGET
 * */
function _billsGET(req, res, next) {
    bills.billsGET(req, res, next);
}


/** 
 * billsDELETE.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:BillRegistry.billsDELETE
 * */
function _billsDELETE(req, res, next) {
    bills.billsDELETE(req, res, next);
}

/** 
 * billsPUT.
 * @param {Object} req request
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:BillRegistry.billsPUT
 * */
function _billsPUT(req, res, next) {
   bills.billsPUT(req.swagger.params, res, next);
}

