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
var VERSION = "v5";
var AGREEMENT_ID = "T14-L2-S12-minimal";
var FILENAME_EXTENSION = "json";
var SERVER_PATH = "http://localhost:5001/api/" + VERSION;
var AGREEMENT_PATH = SERVER_PATH + '/agreements';

// Used modules
const stateManager = rewire(__base + '/src/stateManager/' + VERSION + '/state-manager');
const testUtils = require(__base + '/tests/utils');
const registry = require(__base + '/index');

// Non-exported methods
var initialize = stateManager.__get__('initialize');
var _get = stateManager.__get__('_get');
var _put = stateManager.__get__('_put');
var _update = stateManager.__get__('_update');
var State = stateManager.__get__('State');
var Record = stateManager.__get__('Record');
var isUpdated = stateManager.__get__('isUpdated');
var getCurrent = stateManager.__get__('getCurrent');
var _current = stateManager.__get__('_current');
var refineQuery = stateManager.__get__('refineQuery');
var projectionBuilder = stateManager.__get__('projectionBuilder');

// Required files
var agreementFile = require(__base + '/tests/required/agreements/' + VERSION + '/' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);
const config = require(__base + '/tests/required/config.json');
// var query = require(__base + '/tests/required/windows/' + VERSION + '/' + 'window' + '-' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);
var queryGuarantees = require(__base + "/tests/expected/query/v5/queryGuarantees.json");
var queryMetrics = require(__base + "/tests/expected/query/v5/queryMetrics.json");
var metadata = require(__base + "/tests/expected/metadata/v5/metadata.json");
var agreement = require(__base + "/tests/expected/states/v5/T14-L2-S12-minimal-initialize.json");
var expectedState = require(__base + "/tests/expected/states/v5/T14-L2-S12-minimal-expected-state.json");


// Expected files
// var expectedPricing = require(__base + '/tests/expected/agreement/' + VERSION + '/' + 'agreement' + '-' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);


describe("state-manager unit tests v5...", function () {
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

    it("Initialize a state manager from an agreement", function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            expect(manager.agreement.id).to.be.equals(AGREEMENT_ID);
            expect(manager).to.include.keys("agreement", "get", "put", "update", "current");
            expect(manager.agreement.context).to.deep.equals(agreement.context);
            expect(manager.agreement.terms).to.deep.equals(agreement.terms);
            done();
        }, function (err) {
            done(err);
        });
    });

    //TODO: Dummy test in order to remember that tests over these methods should be done.
    it('Functions extistence', function () {
        expect(initialize).to.exist;
        expect(_get).to.exist;
        expect(_put).to.exist;
        expect(_update).to.exist;
    });

    // describe("Put states", function () {
    it('Put agreement guarantee state on StateManager', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            const stateType = "guarantees";
            const value = "72.72727272727273";
            manager.put(stateType, queryGuarantees, value, metadata).then(function (result) {
                expect(result).to.be.an("array");
                const model = result[0];
                expect(model.agreementId).to.be.equals(AGREEMENT_ID);
                expect(model.id).to.be.equals(queryGuarantees.guarantee);
                expect(model.records).to.be.an("array");
                expect(model.records[0]).to.include.all.keys("evidences", "logsState", "parameters");
                //TODO: deeply check record data
                // expect(model.records[0]).to.deep.include(metadata);
                expect(model.records[0].value).to.be.equals(value);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('Put agreement metric state on StateManager', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            const stateType = "metrics";
            const value = "72.72727272727273";
            manager.put(stateType, queryMetrics, value, metadata).then(function (result) {
                expect(result).to.be.an("array");
                const model = result[0];
                expect(model.agreementId).to.be.equals(AGREEMENT_ID);
                expect(model.id).to.be.equals(queryMetrics.metric);
                expect(model.records).to.be.an("array");
                expect(model.records[0]).to.include.all.keys("evidences", "logsState", "parameters");
                //TODO: deeply check record data
                // expect(model.records[0]).to.deep.include(metadata);
                expect(model.records[0].value).to.be.equals(value);
                done();
            }, function (err) {
                done(err);
            });
        });
    });
    // });

    // describe("Get states", function () {

    it("Get guarantees state from a specific query", function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            const stateType = "guarantees";
            const expectedValue = "72.72727272727273";
            manager.get(stateType, queryGuarantees).then(function (states) {
                expect(states).to.be.an("array");
                const model = states[0];
                expect(model.agreementId).to.be.equals(AGREEMENT_ID);
                expect(model.id).to.be.equals(queryGuarantees.guarantee);
                expect(model.records).to.be.an("array");
                expect(model.records[0]).to.include.all.keys("evidences", "logsState", "parameters");
                //TODO: deeply check record data
                // expect(model.records[0]).to.deep.include(metadata);
                expect(model.records[0].value).to.be.equals(expectedValue);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it("Get metrics state from a specific query", function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            const stateType = "metrics";
            const expectedValue = "72.72727272727273";
            manager.get(stateType, queryMetrics).then(function (states) {
                expect(states).to.be.an("array");
                const model = states[0];
                expect(model.agreementId).to.be.equals(AGREEMENT_ID);
                expect(model.id).to.be.equals(queryMetrics.metric);
                expect(model.records).to.be.an("array");
                expect(model.records[0]).to.include.all.keys("evidences", "logsState", "parameters");
                //TODO: deeply check record data
                // expect(model.records[0]).to.deep.include(metadata);
                expect(model.records[0].value).to.be.equals(expectedValue);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    // it("Get agreement state from a specific query", function (done) {
    //     stateManager({
    //         id: AGREEMENT_ID
    //     }).then(function (manager) {
    //         const expectedValue = "72.72727272727273";
    //         manager.get("agreement", undefined).then(function (states) {
    //             // expect(agreement).to.deep.equals(expectedPricing);
    //             expect(states[0].agreementId).to.be.equals(AGREEMENT_ID);
    //             expect(states[0].records[0].value).to.be.equals(expectedValue);
    //             done();
    //         }, function (err) {
    //             done(err);
    //         });
    //     });
    // });
    // });

    it('Update states with a specific query', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            const stateType = "guarantees";
            const queryGuarantees = {
                "guarantee": "SPU_IO_K01"
            };
            const penalty = {
                "porcentajePTOT": -5
            };
            const logsState = 14;
            manager.update(stateType, queryGuarantees, logsState).then(function (states) {
                expect(states).to.be.an("array");
                const model = states[0];
                expect(model.agreementId).to.be.equals(AGREEMENT_ID);
                expect(model.id).to.be.equals(queryGuarantees.guarantee);
                expect(model.records).to.be.an("array");
                expect(model.records[0]).to.include.all.keys("evidences", "logsState", "metrics", "penalties");
                //TODO: deeply check record data
                // expect(model.records[0]).to.deep.include(metadata);
                expect(model.records[0].logsState).to.be.equals(14);
                expect(model.records[0].penalties.porcentajePTOT).to.be.equals(penalty.porcentajePTOT);
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('State', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            const value = "100.0";
            const state = new State(value, queryMetrics, metadata);

            expect(manager).to.exist;

            expect(state).to.include.keys("evidences", "metric", "period", "scope", "window", "records");
            expect(state).to.include.keys("metric");
            expect(state.evidences).to.deep.equal(expectedState.evidences);
            expect(state.metric).to.deep.equal(expectedState.metric);
            expect(state.period).to.deep.equal(expectedState.period);
            expect(state.scope).to.deep.equal(expectedState.scope);
            expect(state.window).to.deep.equal(expectedState.window);

            expect(state.records).to.be.an("array");
            expect(state.records[0].evidences.length).to.be.equal(expectedState.records[0].evidences.length);
            expect(state.records[0].logsState).to.be.equal(expectedState.records[0].logsState);
            expect(state.records[0].value).to.be.equal(expectedState.records[0].value);
            expect(state.records[0].parameters).to.include(expectedState.records[0].parameters);

            done();
        }, function (err) {
            done(err);
        });
    });

    it('Record to build record object', function (done) {
        const value = "72.72727272727273";
        const record = new Record(value, metadata);
        expect(record).to.include.keys("evidences", "logsState", "parameters", "time", "value");
        expect(record.value).to.be.equals(value);
        done();
    });

    it('isUpdated', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            const agreement = manager.agreement;
            const states = undefined;
            isUpdated(agreement, states).then(function (state) {
                expect(state).to.include.keys("logsState", "isUpdated");
                expect(state.isUpdated).to.be.false;
                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('getCurrent', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            const stateType = "guarantees";
            manager.get(stateType, queryGuarantees).then(function (states) {
                expect(states).to.be.an("array");
                expect(states[0].records).to.be.an("array");

                var record = getCurrent(states[0]);
                expect(states[0].records[0]).to.be.equals(record);
                expect(states[0].records[0].evidences.length).to.be.equal(record.evidences.length);
                expect(states[0].records[0].logsState).to.be.equal(record.logsState);
                expect(states[0].records[0].value).to.be.equal(record.value);
                expect(states[0].records[0].parameters).to.include(record.parameters);

                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('_current', function (done) {
        stateManager({
            id: AGREEMENT_ID
        }).then(function (manager) {
            const stateType = "guarantees";
            manager.get(stateType, queryGuarantees).then(function (states) {
                expect(states).to.be.an("array");
                expect(states[0].records).to.be.an("array");

                var record = _current(states[0]);
                expect(record).to.include.keys("stateType", "agreementId", "id", "scope", "period", "window", "value", "evidences");

                done();
            }, function (err) {
                done(err);
            });
        });
    });

    it('refineQuery', function (done) {
        const agreementId = "T14-L2-S12-minimal";
        const stateType = "guarantees";
        const query = {
            "guarantee": "SPU_IO_K01"
        };
        const expectedRefinedQuery = {
            "stateType": "guarantees",
            "agreementId": "T14-L2-S12-minimal",
            "id": "SPU_IO_K01"
        };
        var refinedQuery = refineQuery(agreementId, stateType, query);
        expect(refinedQuery).to.deep.equals(expectedRefinedQuery);
        done();
    });

    it('projectionBuilder', function (done) {
        const stateType = "guarantees";
        const query = {
            "stateType": "guarantees",
            "agreementId": "T14-L2-S12-minimal",
            "id": "SPU_IO_K01"
        };
        const expectedProjection = {
            "stateType": "guarantees",
            "agreementId": "T14-L2-S12-minimal",
            "id": "SPU_IO_K01"
        };
        var projection = projectionBuilder(stateType, query);
        expect(projection).to.deep.equals(expectedProjection);
        done();
    });

});