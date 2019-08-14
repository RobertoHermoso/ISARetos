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

/////////////////////////// EXT DEPENDENCIES ///////////////////////////
const Influx = require('influx');

/////////////////////////// INT DEPENDENCIES ///////////////////////////
const config = require("../../configurations");
const logger = require("../../logger");
const influxConfig = config.influx;

/////////////////////////// PRIVATE ATTRIBUTES ///////////////////////////
const _host = Symbol();
const _database = Symbol();
const _measurement = Symbol();
const _fields = Symbol();
const _tags = Symbol();

/////////////////////////////////////////////////////////////// BEGIN CLASS ///////////////////////////////////////////////////////////////
class InfluxDB {

    /////////////////////////// BEGIN CONSTRUCTOR ///////////////////////////
    constructor(host, database, measurement, fields, tags) {
        for (var [key, value] of Object.entries(fields)) {
            if (key === "Influx.FieldType.INTEGER") {
                fields[key] = Influx.FieldType.INTEGER;
            }
            if (key === "Influx.FieldType.STRING") {
                fields[key] = Influx.FieldType.STRING;
            }
        }
        this._host = host;
        this._database = database;
        this._measurement = measurement;
        this._fields = fields;
        this._tags = tags;

        logger.ctl("Creating InfluxDB connection to '%s' in database '%s' and params %s", host, database, JSON.stringify(influxConfig, 2, null));
        this._influx = new Influx.InfluxDB(influxConfig);
        this._createDb();
    }
    /////////////////////////// END CONSTRUCTOR ///////////////////////////

    /////////////////////////// GETTERS ///////////////////////////
    get host() {
        return this._influx;
    }
    get database() {
        return this._database;
    }
    get measurement() {
        return this._measurement;
    }
    get fields() {
        return this._fields;
    }
    get tags() {
        return this._tags;
    }

    get influx() {
        return this._influx;
    }
    /////////////////////////// END GETTERS ///////////////////////////

    /////////////////////////// SETTERS ///////////////////////////
    set host(new_host) {
        this._host = new_host;
    }
    set database(new_database) {
        this._database = new_database;
    }
    set measurement(new_measurement) {
        this._measurement = new_measurement;
    }
    set fields(new_fields) {
        this._fields = new_fields;
    }
    set tags(new_tags) {
        this.tags = new_tags;
    }
    set influx(new_influx) {
        this._influx = new_influx;
    }
    /////////////////////////// END SETTERS ///////////////////////////

    /////////////////////////// CORE FUNCTIONS ///////////////////////////
    _createDb() {
        this._influx.getDatabaseNames().then(names => {
            logger.ctl("Retrieving existing databases in InfluxDB", names);
            if (!names.includes(this.database)) {
                logger.ctl("Creating database '%s' in InfluxDB", this.database);
                return this.influx.createDatabase(this.database);
            } else {
                logger.ctl("Database '%s' already exists in InfluxDB", this.database);
            }
        }).then(() => {
            logger.ctl("Database '%s' is ready to be used in InfluxDB", this.database);
        }).catch(error => {
            logger.error("Error creating database '%s' in InfluxDB: %s", this.database, error);
        });
    }

    writeIdPriority(id, scopes, value, timestamp) {
        var tags = {}
        tags["id"]= id;
        for (sc in scopes){
            tags[sc] = scopes[sc];
        }
        this._influx.writePoints([{
            measurement: this.measurement,
            tags: scopes,
            fields: {
                value: value
            },
            timestamp: timestamp
        }], {
                maxRetries: 50,
                requestTimeout: 600000
            }).catch(error => {
                logger.error("Error writing in DB ", error);
            });
    }

    static getAgreementData(agreementId){
        this._influx = new Influx.InfluxDB(influxConfig);
        return this._influx.getSeries({
            measurement: agreementId,
            database: this._database
          }).then(names => {
             return names;
          }).catch(error => {
             logger.error("Error selecting data in DB ", error);
        });
        // return this._influx.query('select * from metrics_values').then(results => {
        //     console.log(results)
        //     return results;
        //   })
    }
    /////////////////////////// END CORE FUNCTIONS ///////////////////////////

}
/////////////////////////////////////////////////////////////// END CLASS ///////////////////////////////////////////////////////////////

module.exports = {
    InfluxDB: InfluxDB,
};
