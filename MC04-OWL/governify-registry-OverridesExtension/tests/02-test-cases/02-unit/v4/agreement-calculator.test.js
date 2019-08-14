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


/* jshint -W080 */
/* jshint expr:true */
'use strict';

var __base = "../../../..";

const rewire = require('rewire'); // for accessing to non-exported methods
const expect = require('chai').expect;
const request = require('request');

// Names
var VERSION = "v4";
var AGREEMENT_ID = "T14-L2-S12-minimal";
var FILENAME_EXTENSION = "json";
var SERVER_PATH = "http://localhost:5001/api/" + VERSION;
var AGREEMENT_PATH = SERVER_PATH + '/agreements';

// Used modules
const agreementCalculator = rewire(__base + '/src/stateManager/' + VERSION + '/agreement-calculator');
const stateManager = require(__base + '/src/stateManager/' + VERSION + '/state-manager');
const testUtils = require(__base + '/tests/utils');
const registry = require(__base + '/index');

// Non-exported methods
var _process = agreementCalculator.__get__('_process');
var processMetrics = agreementCalculator.__get__('processMetrics');
var processGuarantees = agreementCalculator.__get__('processGuarantees');

// Required files
var agreementFile = require(__base + '/tests/required/agreements/' + VERSION + '/' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);
const config = require(__base + '/tests/required/config.json');
// var query = require(__base + '/tests/required/windows/' + VERSION + '/' + 'window' + '-' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);
var agreementParameters = undefined;
var metricParameters = {};
var guaranteeParameters = {};

// Expected files
var expectedStates = require(__base + '/tests/expected/states/' + VERSION + '/' + 'states' + '-' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);
// var expectedMetrics = require(__base + '/tests/expected/states/' + VERSION + '/' + 'metricStates' + '-' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);
// var expectedGuarantees = require(__base + '/tests/expected/states/' + VERSION + '/' + 'guaranteeStates' + '-' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);


describe("agreement-calculator unit tests v4...", function () {
    this.timeout(1000000);

    before(function (done) {
        testUtils.dropDB(function () {
            registry.deploy(config, function () {
                request.post({
                    url: AGREEMENT_PATH,
                    body: agreementFile,
                    json: true
                }, function (err) {
                    if (err) {
                        done(err);
                    } else {
                        done();
                    }
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

    it('process agreement', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            _process(manager, agreementParameters).then(function (states) {
                // console.log("__________ TEST _process agreement_________");
                // console.log(JSON.stringify(states, null, 2));
                // console.log("__________ END _process agreement_________");
                // console.log("__________ TEST _process expectedStates");
                // console.log(JSON.stringify(expectedStates, null, 2));
                // console.log("__________ END _process expectedStates");
                expect(states.length).to.be.equals(expectedStates.length); // TODO: weak check that should be improved
                // expect(agreement).to.deep.equals(expectedStates);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('process metrics', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            processMetrics(manager, metricParameters).then(function (metrics) {
                // console.log("__________ TEST processMetrics _________");
                // console.log(JSON.stringify(metrics, null, 2));
                // console.log("__________ END processMetrics _________");
                expect(metrics.length > 0).to.be.true; // TODO: extreme weak check that should be improved
                // expect(metrics.length).to.be.equals(expectedMetrics.length); // TODO: weak check that should be improved
                // expect(metrics).to.deep.equals(expectedMetrics);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('process guarantees', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            processGuarantees(manager, guaranteeParameters).then(function (guarantees) {
                // console.log("__________ TEST guarantees _________");
                // console.log(JSON.stringify(guarantees, null, 2));
                // console.log("__________ END guarantees _________");
                expect(guarantees.length > 0).to.be.true; // TODO: extreme weak check that should be improved
                // expect(guarantees).to.deep.equals(expectedGuarantees);
                done();
            }, function (err) {
                done(err);
            });
        });
    });


});