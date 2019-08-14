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



// governify-registry is an Open-source software available under the 
// GNU General Public License (GPL) version 2 (GPL v2) for non-profit 
// applications; for commercial licensing terms, please see README.md 
// for any inquiry.

// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
// */

/*jshint expr:true */
// 'use strict';

// var __base = "../../../..";

// const rewire = require('rewire'); // for accessing to non-exported methods
// const expect = require('chai').expect;
// const request = require('request');

// // Names
// var VERSION = "v4";
// var AGREEMENT_ID = "T14-L2-S12-minimal";
// var FILENAME_EXTENSION = "json";
// var METRIC_ID = "SPU_IO_K01";
// var SERVER_PATH = "http://localhost:5001/api/" + VERSION;
// var AGREEMENT_PATH = SERVER_PATH + '/agreements';

// // Used modules
// const quotasCalculator = rewire(__base + '/src/stateManager/' + VERSION + '/quotas-calculator');
// const stateManager = require(__base + '/src/stateManager/' + VERSION + '/state-manager');
// const testUtils = require(__base  + '/tests/utils');
// const registry = require(__base + '/index');

// // Non-exported methods
// var processQuotas = quotasCalculator.__get__('processQuotas');

// // Required files
// var agreementFile = require(__base + '/tests/required/agreements/' + VERSION + '/' + AGREEMENT_ID + '.' + FILENAME_EXTENSION);
// const config = require(__base + '/tests/required/config.json');
// var query = {
//     quota: METRIC_ID //TODO revisar todo esto. El cálculo del quotas-calculator no me parece muy certero. @agamez
// };


// // Expected files
// // var expectedAlgo = require(__base + '/tests/expected/metrics/' + VERSION + '/' + 'metricParameters.json');


// describe("quota-calculator unit tests v4...", function () {
//     this.timeout(1000000);

//     before(function (done) {
//         testUtils.dropDB(function () {
//             registry.deploy(config, function () {
//                 request.post({
//                     url: AGREEMENT_PATH,
//                     body: agreementFile,
//                     json: true
//                 }, function (err) {
//                     if (err) {
//                         done(err);
//                     } else {
//                         done();
//                     }
//                 });
//             });
//         });
//     });

//     after(function (done) {
//         registry.undeploy(function () {
//             testUtils.dropDB(function (err) {
//                 if (err) {
//                     done(err);
//                 } else {
//                     done();
//                 }
//             });
//         });
//     });

//     it('process quotas', function (done) {
//         stateManager({
//             id: AGREEMENT_ID
//         }).then(function (manager) {
//             processQuotas(manager, query).then(function (something) {
//                 // expect(something).to.deep.equals(expectedSomething);
//                 // fs.writeFileSync(__dirname + '/quotas.results.v3.json', JSON.stringify(results.sort(orderByCenterAndId))
//                 console.log(something);
//                 expect(1 == 1).to.be.true;
//                 done();
//             }, function (err) {
//                 done(err);
//             });
//         });
//     });


// });