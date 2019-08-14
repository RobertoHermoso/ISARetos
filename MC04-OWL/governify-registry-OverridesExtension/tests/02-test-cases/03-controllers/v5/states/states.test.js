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

var __base = "../../../../..";

const expect = require("chai").expect;
const request = require("request");

// Names
var VERSION = "v3";
var AGREEMENT_ID = "T14-L2-S12-minimal";
var FILENAME_EXTENSION = "json";
var SERVER_PATH = "http://localhost:5001/api/" + VERSION;

// Used modules
const registry = require(__base + '/index');
const testUtils = require(__base + '/tests/utils');
const config = require(__base + '/tests/required/config.json');

// Required files
var schema = require(__base + '/src/schemas/agreementSchema.json');

// Expected files
var expectedAgreementStates = require(__base + '/tests/expected/states/' + VERSION + '/' + 'metricStates' + '-' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);
// Endpoints
var AGREEMENT_STATES_PATH = SERVER_PATH + '/agreements';


describe("Agreement states unit tests v3 ...", function () {

    // Deploy registry before all tests
    before(function (done) {
        testUtils.dropDB(function (err) {
            if (!err) {
                registry.deploy(config, function () {
                    done();
                });
            }
        });
    });

    // Remove all data and undeploy registry after all tests
    after(function (done) {
        registry.undeploy(function () {
            testUtils.dropDB(function (err) {
                done(err);
            });
        });
    });


    // Get all the agreement states (there should not be any)
    describe("GET /states", function () {
        describe("Get all the agreement states (there should not be any)", function () {

            var _body;
            var options = {
                uri: AGREEMENT_STATES_PATH,
                method: 'GET'
            };

            it("returns status 200", function (done) {
                request(options, function (error, response, body) {
                    _body = body;
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });

            it("returns empty array", function (done) {
                expect(JSON.parse(_body).length === 0).to.be.true;
                done();
            });

        });
    });

    // Expect an error when there is any agreement state with this agreement ID
    describe("GET /states/:id", function () {
        describe("Expect an error when there is any agreement state with this agreement ID", function () {

            var _json;
            var options = {
                uri: AGREEMENT_STATES_PATH + "/" + AGREEMENT_ID,
                method: 'GET'
            };

            it("returns status 404 with error message", function (done) {
                request(options, function (error, response, body) {
                    _json = JSON.parse(body);
                    expect(response.statusCode).to.equal(404);
                    done();
                });
            });
        });
    });

    describe("State model validation", function () {

        it("the stored agreement state is valid according to the schema", function (done) {

            expect(testUtils.validateModel(expectedAgreementStates, schema)).to.be.true;
            done();
        });
    });

    //// Insert an agreement state in database manually
    //describe("POST /agreements", function () {
    //    describe("Create an agreement", function () {
    //
    //        var postResponse;
    //        var options = {
    //            uri: AGREEMENT_STATES_PATH,
    //            method: 'POST',
    //            json: agreementStateFile
    //        };
    //
    //        it("returns status 200", function (done) {
    //            request(options, function (error, response, body) {
    //                expect(response.statusCode).to.equal(200);
    //                postResponse = body;
    //                done();
    //            });
    //        });
    //
    //        it("returns OK message", function (done) {
    //            expect(postResponse === "OK").to.be.true;
    //            done();
    //        });
    //    });
    //});
    //
    //// Get an existent agreement state by agreement ID
    //    describe("GET /states/:id", function () {
    //        describe("Get an existent agreement state by agreement ID", function () {
    //
    //            var agreementJson;
    //            var _body;
    //            var _json;
    //            var options = {
    //                uri: AGREEMENT_STATES_PATH + "/" + AGREEMENT_ID,
    //                method: 'GET'
    //            };
    //
    //            it("returns status 200", function (done) {
    //                request(options, function (error, response, body) {
    //                    _body = body;
    //                    expect(response.statusCode).to.equal(200);
    //                    done();
    //                });
    //            });
    //
    //            it("returns JSON with values", function (done) {
    //                agreementJson = JSON.parse(_body);
    //                expect(!!agreementJson).to.be.true;
    //                done();
    //            });
    //
    //            it("returns expected agreement", function (done) {
    //                json = agreementJson;
    //                delete _json['_id'];
    //                expect(JSON.stringify(_json)).to.be.equal(JSON.stringify(expectedAgreementStates));
    //                done();
    //            });
    //
    //            it("returns valid agreement", function (done) {
    //                expect(testUtils.validateModel(agreementJson, schema)).to.be.true;
    //                done();
    //            });
    //        });
    //    });
    //
    //// Get all agreement states
    //    describe("GET /states", function () {
    //        describe("Get all agreement states", function () {
    //
    //            var agreementsJson;
    //            var _json;
    //            var options = {
    //                uri: AGREEMENT_STATES_PATH,
    //                method: 'GET'
    //            };
    //
    //            it("returns status 200", function (done) {
    //                request(options, function (error, response, body) {
    //                    agreementsJson = JSON.parse(body);
    //                    expect(response.statusCode).to.equal(200);
    //                    done();
    //                });
    //            });
    //
    //            // Expecting 1 agreement state
    //            it("returns 1 agreement state", function (done) {
    //                expect(agreementsJson.length === 1).to.be.true;
    //                done();
    //            });
    //
    //            it("returns expected agreement state", function (done) {
    //                _json = agreementsJson[0];
    //                delete _json['_id'];
    //                expect(JSON.stringify(_json)).to.be.equal(JSON.stringify(expectedAgreementStates));
    //                done();
    //            });
    //
    //            it("returns valid agreement state", function (done) {
    //                expect(testUtils.validateModel(agreementsJson[0], schema)).to.be.true;
    //                done();
    //            });
    //
    //        });
    //    });

    // Remove all the agreement states
    describe("DELETE /states", function () {
        describe("Remove all the agreement states", function () {

            var _body;
            var options = {
                uri: AGREEMENT_STATES_PATH,
                method: 'DELETE'
            };

            it("returns status 200", function (done) {
                request(options, function (error, response, body) {
                    _body = body;
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });

        });
    });

    // Get all agreement states after removing them
    describe("GET /states", function () {
        describe("Get all agreement states after removing them", function () {

            var _body;
            var options = {
                uri: AGREEMENT_STATES_PATH,
                method: 'GET'
            };
            it("returns status 200", function (done) {
                request(options, function (error, response, body) {
                    _body = body;
                    expect(response.statusCode).to.equal(200);
                    done();
                });
            });
            it("returns empty array", function (done) {
                expect(JSON.parse(_body).length === 0).to.be.true;
                done();
            });
        });
    });
});