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


/*jshint expr:true */
'use strict';

var __base = "../../../..";

const expect = require('chai').expect;
const request = require('request');
const Promise = require('bluebird');

// Used modules
const registry = require(__base + '/index');
const testUtils = require(__base + '/tests/utils');
const utils = require(__base + '/src/utils');
const config = require(__base + '/tests/required/config.json');

// Names
var VERSION = "v4";
var AGREEMENT_ID = "T14-L2-S12-minimal";
var MOCK_FILENAME = "agreementMock";

var FILENAME_EXTENSION = "json";
var SERVER_PATH = "http://localhost:5001/api/" + VERSION;

// Required files
var agreementFile = require(__base + '/tests/required/agreements/' + VERSION + '/' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);
var agreementMock = require(__base + '/tests/required/agreements/' + VERSION + '/' + MOCK_FILENAME + '.' + FILENAME_EXTENSION);
var window = require(__base + '/tests/required/windows/' + VERSION + '/' + 'window' + '-' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);


// Expected files
var expectedAgreementState = require(__base + '/tests/expected/states/' + VERSION + '/' + 'metricStates' + '-' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);
var expectedGuarantees = require(__base + '/tests/expected/states/' + VERSION + '/' + 'metricStates' + '-' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);

// Endpoints
var AGREEMENT_PATH = SERVER_PATH + '/agreements';
var AGREEMENT_STATES_PATH = SERVER_PATH + '/states';


var periods = utils.time.getPeriods(agreementMock, window);

describe("Integration TEST V4", function () {
    this.timeout(1000000);

    before(function (done) {
        testUtils.dropDB(function () {
            registry.deploy(config, function () {
                request.post({
                    url: AGREEMENT_PATH,
                    body: agreementFile,
                    json: true
                }, function (err, res, body) {
                    if (err) {
                        console.log(err + res + body);
                    }
                    done();
                });
            });
        });
    });

    after(function (done) {
        registry.undeploy(function () {
            testUtils.dropDB(function (err) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        });
    });


    it('Get guarantees all periods', function (done) {
        request.get({
            url: AGREEMENT_STATES_PATH + '/' + AGREEMENT_ID + '/guarantees',
            json: true
        }, function (err, res, body) {
            var results = body;
            // fs.writeFileSync(__dirname + '/guarantees.results.v4.json', JSON.stringify(results.sort(orderByCenterAndId)));
            try {
                expect(testUtils.arrayEqual(results, expectedGuarantees)).to.be.true;
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('Get guarantees period by period', function (done) {
        var results = [];
        Promise.each(periods, function (period) {
            return new Promise(function (resolve, reject) {
                var url = AGREEMENT_STATES_PATH + '/' + AGREEMENT_ID + '/guarantees?from=' + period.from.toISOString() + '&to=' + period.to.toISOString();

                request.get({
                    url: url,
                    json: true
                }, function (err, res, body) {
                    if (err) {
                        return reject();
                    }
                    if (res && res.statusCode !== 200) {
                        return reject();
                    }
                    return resolve(body);
                });
            }).then(function (body) {
                body.forEach(function (element) {
                    results.push(element);
                });
            }, function (err) {
                done(err);
            });
        }).then(function () {
            //fs.writeFileSync(__dirname + '/guarantees.results.v4.month.json', JSON.stringify(results.sort(testUtils.orderByCenterAndId), null, 2));
            try {
                expect(testUtils.arrayEqual(results, expectedGuarantees)).to.be.true;
                done();
            } catch (e) {
                done(e);
            }
        }, function (error) {
            done(error);
        });
    });

    it('Get agreement all periods', function (done) {
        request.get({
            url: AGREEMENT_STATES_PATH + '/' + AGREEMENT_ID,
            json: true
        }, function (err, res, body) {
            var results = body;
            // fs.writeFileSync(__dirname + '/agreement.results.v4.json', JSON.stringify(results.sort(testUtils.orderByCenterAndId), null, 2));
            try {
                expect(testUtils.arrayEqual(results, expectedAgreementState)).to.be.true;
                done();
            } catch (e) {
                done(e);
            }
        });
    });

});