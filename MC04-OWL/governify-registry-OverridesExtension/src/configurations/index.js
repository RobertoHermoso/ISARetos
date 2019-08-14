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

const jsyaml = require('js-yaml');
const fs = require('fs');
const winston = require('winston');
const path = require('path');


/**
 * Configuration module.
 * @module config
 * @requires js-yaml
 * @requires fs
 * @requires winston
 * */

/*
 * Export functions and Objects
 */
const config = {
    addConfiguration: _addConfiguration,
    setProperty: _setProperty,
};

module.exports = config;

/*
 * Setup default config location
 */
config.addConfiguration('config.yaml', 'utf8');

// Override some properties if present in process.env
config.parallelProcess.guarantees = process.env.GUARANTEES_PARALLEL_PROCESS ? process.env.GUARANTEES_PARALLEL_PROCESS : config.parallelProcess.guarantees;
config.parallelProcess.metrics = process.env.METRICS_PARALLEL_PROCESS ? process.env.METRICS_PARALLEL_PROCESS : config.parallelProcess.metrics;

config.state = {
    agreementsInProgress: []
};

/** Write info messages on logger.*/
module.exports.stream = {
    /** Print an info message on logger.
     * @param {String} message message to print
     * @param {String} encoding message enconding
     * @alias module:config.stream.write
     * */
    write: function (message) {
        module.exports.logger.info(message);
    }
};

/*
 * Implement the functions
 */
function _addConfiguration(uri, encoding) {
    var configString = null;

    if (!uri) {
        throw new Error("Parameter URI is required");
    } else {
        configString = fs.readFileSync(path.join(__dirname, uri), encoding);
    }

    var newConfigurations = jsyaml.safeLoad(configString)[process.env.NODE_ENV ? process.env.NODE_ENV : 'development'];

    for (var c in newConfigurations) {
        this[c] = newConfigurations[c];
    }
}

function _setProperty(propertyName, newValue) {
    this[propertyName] = newValue;
}