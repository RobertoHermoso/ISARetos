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

var __base = "../../../..";

const rewire = require('rewire'); // for accessing to non-exported methods
const expect = require('chai').expect;
const request = require('request');

// Names
var VERSION = "v4";
var AGREEMENT_ID = "T14-L2-S12-minimal";
var FILENAME_EXTENSION = "json";
var METRIC_ID = "SPU_IO_K01";
var OPERATOR = ">=";
var SLO_VALUE = "90";
var SERVER_PATH = "http://localhost:5001/api/" + VERSION;
var AGREEMENT_PATH = SERVER_PATH + '/agreements';

// Used modules
const guaranteeCalculator = rewire(__base + '/src/stateManager/' + VERSION + '/guarantee-calculator');
const stateManager = require(__base + '/src/stateManager/' + VERSION + '/state-manager');
const testUtils = require(__base + '/tests/utils');
const registry = require(__base + '/index');

// Non-exported methods
var processGuarantees = guaranteeCalculator.__get__('processGuarantees');
var processGuarantee = guaranteeCalculator.__get__('processGuarantee');
var processScopedGuarantee = guaranteeCalculator.__get__('processScopedGuarantee');
var calculatePenalty = guaranteeCalculator.__get__('calculatePenalty');

// Required files
var agreementFile = require(__base + '/tests/required/agreements/' + VERSION + '/' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);
const config = require(__base + '/tests/required/config.json');
var ofElement = require(__base + '/tests/required/ofElements/' + VERSION + '/' + 'ofElement' + '-' + AGREEMENT_ID + '-' + METRIC_ID + '.' + FILENAME_EXTENSION);
var guarantee = require(__base + '/tests/required/guarantees/' + VERSION + '/' + 'guarantee' + '-' + AGREEMENT_ID + '-' + METRIC_ID + '.' + FILENAME_EXTENSION);
var timedScope = require(__base + '/tests/required/timedScopes/' + VERSION + '/' + 'timedScope' + '-' + AGREEMENT_ID + '-' + METRIC_ID + '.' + FILENAME_EXTENSION);
var metricsValues = require(__base + '/tests/required/metricValues/' + VERSION + '/' + 'metricValue' + '-' + AGREEMENT_ID + '-' + METRIC_ID + '.' + FILENAME_EXTENSION);
var penalties = require(__base + '/tests/required/penalties/' + VERSION + '/' + 'penalty' + '-' + AGREEMENT_ID + '-' + METRIC_ID + '.' + FILENAME_EXTENSION);
var slo = METRIC_ID + OPERATOR + SLO_VALUE;
var query = {
    guarantee: METRIC_ID
};


// Expected files
var expectedCalculatePenalty = require(__base + '/tests/expected/penalties/' + VERSION + '/' + 'calculatePenalty' + '-' + AGREEMENT_ID + '-' + METRIC_ID + '.' + FILENAME_EXTENSION);
var expectedScopedGuarantee = require(__base + '/tests/expected/scopedGuarantees/' + VERSION + '/' + 'scopedGuarantee' + '-' + AGREEMENT_ID + '-' + METRIC_ID + '.' + FILENAME_EXTENSION);
var expectedGuarantee = require(__base + '/tests/expected/guarantees/' + VERSION + '/' + 'processGuarantee' + '-' + AGREEMENT_ID + '-' + METRIC_ID + '.' + FILENAME_EXTENSION);
var expectedGuarantees = require(__base + '/tests/expected/guarantees/' + VERSION + '/' + 'processGuarantees' + '-' + AGREEMENT_ID + '-' + METRIC_ID + '.' + FILENAME_EXTENSION);

describe("guarantee-calculator unit tests v4...", function () {
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

    it('process all guarantees', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            processGuarantees(manager.agreement).then(function (guarantees) {
                expect(guarantees).to.deep.equals(expectedGuarantees);
                done();
            }, function (err) {
                done(err);
            });

        });
    });


    it('process a guarantee', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            processGuarantee(manager, query).then(function (guarantee) {
                expect(guarantee).to.deep.equals(expectedGuarantee);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('process a scopedGuarantee', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            processScopedGuarantee(manager, query, guarantee, ofElement).then(function (scopedGuarantee) {
                expect(scopedGuarantee).to.deep.equals(expectedScopedGuarantee);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('process a calculatePenalty', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            var penalty = calculatePenalty(manager, guarantee, ofElement, timedScope, metricsValues, slo, penalties);
            expect(penalty).to.deep.equals(expectedCalculatePenalty);
            done();
        });
    });

});