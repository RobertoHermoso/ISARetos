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

/**
 * Module dependencies.
 * */

const winston = require('winston');
const config = require('../configurations');

/**
 * Configure here your custom levels.
 * */
var customLevels = {
  levels: {
    error: 7,
    warning: 8,
    ctlAgreement: 9,
    ctlState: 9,
    agreement: 10,
    pricing: 10,
    quotas: 10,
    rates: 10,
    guarantees: 10,
    metrics: 10,
    sm: 11,
    streaming: 13,
    info: 12,
    debug: 13
  },
  colors: {
    error: 'red',
    warning: 'yellow',
    ctlAgreement: 'blue',
    ctlState: 'blue',
    agreement: 'magenta',
    pricing: 'green',
    quotas: 'green',
    rates: 'green',
    guarantees: 'green',
    metrics: 'cyan',
    sm: 'grey',
    streaming: 'green',
    info: 'white',
    debug: 'black'
  }
};

winston.emitErrs = true;
const logger = new winston.Logger({
  levels: customLevels.levels,
  colors: customLevels.colors,
  transports: [
    new winston.transports.File({
      createTree: false,
      level: config.log.level,
      filename: config.log.file,
      handleExceptions: true,
      json: false,
      tailable: true,
      maxsize: config.log.maxSize,
      maxFiles: config.log.maxFiles,
    }),
    new winston.transports.Console({
      level: config.loglevel,
      handleExceptions: true,
      json: false,
      colorize: true,
      timestamp: true
    })
  ],
  exitOnError: false
});

/*
 * Export functions and Objects
 */
module.exports = logger;
