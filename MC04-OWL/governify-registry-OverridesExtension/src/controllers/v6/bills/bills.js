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

const logger = require('../../../logger');
const $RefParser = require('json-schema-ref-parser');
const db = require('../../../database');
const request = require('request');
const utils = require('../../../utils');

const states = require('../states/states');
const ErrorModel = require('../../../errors/index.js').errorModel;
const agreementManager = require('governify-agreement-manager').operations.states;
const moment = require('moment-timezone');

/**
 * Registry bill module.
 * @module bills
 * @see module:AgreementRegistry
 * @see module:AgreementRegistryService
 * @requires config
 * @requires database
 * @requires states
 * @requires StateRegistryService
 * @requires errors
 * @requires json-schema-ref-parser
 * @requires governify-agreement-manager
 * */
module.exports = {
    billsPUT: _billsPUT,
    billsGET: _billsGET,
    billsDELETE: _billsDELETE,
    getBill: _getBill
};

/**
 * Post an bill
 * @param {Object} args {bill: Object}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:bills.bills
 * PUT
 * */
function _billsPUT(args, res) {
    logger.info("New request to CREATE bill");
    $RefParser.dereference(args.bill.value, function (err, schema) {
        if (err) {
            logger.error(err.toString());
            res.status(500).json(new ErrorModel(500, err));
        } else {
            var BillsModel = db.models.BillsModel;
            var bills = new db.models.BillsModel(schema);
            BillsModel.findOne({ 'agreementId': args.bill.value.agreementId, 'billId': args.bill.value.billId }, function (err, result) {
                if (err) {
                    logger.error(err.toString());
                    res.status(500).json(new ErrorModel(500, err));
                }
                else{
                    if (result && result.state == "closed"){
                        res.status(403).send("Is not allowed to edit when state is closed.")
                    }
                    else
                    {
                        BillsModel.update({ 'agreementId': args.bill.value.agreementId, 'billId': args.bill.value.billId }, args.bill.value, { upsert: true }, function (err, result) {
                            if (err) {
                                logger.error(err.toString());
                                res.status(500).json(new ErrorModel(500, err));
                            }
                            logger.info('New bill saved successfully!');
                            res.status(200).send(result);

                        });

                    }
                }
            });
          
           
        }
    });
}



/**
 * Get all bills.
 * @param {Object} req {}
 * @param {Object} res response
 * @param {Object} next next function
 * @alias module:bills.billsGET
 * */
function _billsGET(req, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     **/
  
    var args = req.swagger.params;
    var from = args.from.value;
    var to = args.to.value;
    logger.info("New request to GET bills bills/bills.js");
    var BillsModel = db.models.BillsModel;
    var AgreementModel = db.models.AgreementModel;
  
    AgreementModel.findOne({ 'id': args.agreementId.value }, function (err, agreement) {
        if (err) {
            logger.error(err.toString());
            res.status(500).json(new ErrorModel(500, err));
        }
    else{
        if (agreement) {
            BillsModel.find({ 'agreementId': args.agreementId.value }, function (err, bills) {
                if (err) {
                    logger.error(err.toString());
                    res.status(500).json(new ErrorModel(500, err));
                } else {
                        var periods;
                        if (from && to){
                            var window = {
                                initial: from,
                                end: to
                            };
                            periods = utils.time.getPeriods(agreement, window);
                       
                        }
                        else
                        {
                            periods = utils.time.getPeriods(agreement);
                        }
                        var billsComplete = [];
                        var billsDates = [];
                        var orderedBills = [];
                        for (var x in bills){
                            var bill = bills[x];
                            billsDates.push(moment(bill.period.from).unix());
                        }
                    for (var i in periods){
                        var period = periods[i];
                        if (!billsDates.includes(moment(period.from).unix())){
                            var standardBill = {
                            agreementId: args.agreementId.value,
                            billId: moment(period.from).unix() + "",
                            state: 'open',
                            period: period,
                            };
                            orderedBills.push(standardBill);
                        }
                        else{
                            orderedBills.push(bills[billsDates.indexOf(moment(period.from).unix())])
                        }
                     }
                    logger.info("Bills returned returned");
                    res.status(200).json(orderedBills);
                    
                }
            });
       
        }
        else
        {
            res.status(404).send('Agreement not found');
        }
    }
    });
}


/**
 * Get bill for one agreement and period
 * @param {String} agreementId AgreementId
 * @alias module:bills.getBill
 * */
function _getBill(agreementId, from){
    var BillsModel = db.models.BillsModel;
   return BillsModel.findOne({ 'agreementId': agreementId, 'period.from': from }, function (err, bill) {
        if (err) {
            logger.error(err.toString());
        } 
    });
}


/**
 * Get bill for one agreement and period
 * @param {String} agreementId AgreementId
 * @alias module:bills.getBill
 * */
function _billsDELETE(req, res){
    var args = req.swagger.params;
    var BillsModel = db.models.BillsModel;
   return BillsModel.deleteMany({ 'agreementId': args.agreementId.value }, function (err, bill) {
        if (err) {
            res.status(404).send('Agreement not found');
        } 
        else{
            res.status(200).send("OK")
        }
    });
}


