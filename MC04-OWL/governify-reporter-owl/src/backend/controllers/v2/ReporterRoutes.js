/*!
governify-project-gauss-reporter 1.0.0, built on: 2018-04-19
Copyright (C) 2018 ISA group
http://www.isa.us.es/
https://github.com/isa-group/governify-project-gauss-reporter

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

'use strict';

const writer = require('../../utils/writer');
const ReporterController = require('./ReporterController');
const config = require("../../configurations");

module.exports.contractsContractIdStartGET = function contractsContractIdStartGET(req, res, next) {
  var contractId = req.swagger.params['contractId'].value;
  var timer = req.swagger.params['timer'].value || config.defaults.timer;
  var loop = req.swagger.params['loop'].value || config.defaults.loop;

  var from = req.headers.from;
  var to = req.headers.to;

  if (from && to){
    var periods = [];
    var period = {};
    period.from = from;
    period.to = to;
    periods.push(period);
  }


  ReporterController.contractsContractIdStartGET(contractId, timer, loop, periods)
    .then((response) => {
      writer.writeJson(res, response);
    })
    .catch((response) => {
      writer.writeJson(res, response);
    });
};

module.exports.contractsContractIdStopGET = function contractsContractIdStopGET(req, res, next) {
  var contractId = req.swagger.params['contractId'].value;
  ReporterController.contractsContractIdStopGET(contractId)
    .then((response) => {
      writer.writeJson(res, response);
    })
    .catch((response) => {
      writer.writeJson(res, response);
    });
};
