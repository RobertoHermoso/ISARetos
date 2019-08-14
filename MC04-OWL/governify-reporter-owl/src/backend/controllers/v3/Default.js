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

const Default = require('./DefaultService');


module.exports.statusGET = function statusGET(req, res, next) {
  Default.statusGET(req.swagger.params, res, next);
};

module.exports.stopPOST = function stopPOST(req, res, next) {
  Default.stopPOST(req.swagger.params, res, next);
};

module.exports.resetPOST = function resetPOST(req, res, next) {
  Default.resetPOST(req.swagger.params, res, next);
};

module.exports.startPOST = function startPOST(req, res, next) {
  Default.startPOST(req.swagger.params, res, next, req);
};

module.exports.prometheusStatsGet = function prometheusStatsGet(req, res, next) {
  Default.prometheusStatsGet(req.swagger.params, res, next);
}