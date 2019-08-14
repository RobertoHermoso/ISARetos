/*!
governify-registry 3.0.1, built on: 2018-04-18
Copyright (C) 2017 ISA Group
http://www.isa.us.es/
http://registry.governify.io/

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

'use strict';

const registry = require('./server.js');
const logger = require('./src/logger');

logger.info('Deploy request received');
registry.deploy(null, function () {
    logger.info('Deploy successfully done');
});

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint() {
    logger.info('Got SIGINT (aka ctrl-c in docker). Graceful shutdown ', new Date().toISOString());
    shutdown();
});

// quit properly on docker stop
process.on('SIGTERM', function onSigterm() {
    logger.info('Got SIGTERM (docker container stop). Graceful shutdown ', new Date().toISOString());
    shutdown();
});

// shut down server
function shutdown() {
    process.exit();
    registry.undeploy(function (err) {
        if (err) {
            logger.error(err);
            process.exitCode = 1;
        }
        process.exit();
    });
}