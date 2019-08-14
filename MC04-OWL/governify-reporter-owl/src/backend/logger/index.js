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
    agreement: 9,
    ctl: 9,
    ctlState: 9,
    pricing: 9,
    quotas: 9,
    rates: 9,
    guarantees: 9,
    metrics: 9,
    sm: 9,
    looper: 9,
    info: 10,
    debug: 11
  },
  colors: {
    error: 'red',
    warning: 'yellow',
    agreement: 'magenta',
    ctl: 'blue',
    ctlState: 'blue',
    kpisProcessor: 'green',
    quotas: 'green',
    rates: 'green',
    guarantees: 'green',
    metrics: 'cyan',
    sm: 'grey',
    looper: 'grey',
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
