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
const moment = require('moment-timezone');

/**
 * Utils module.
 * @module utils.promises
 * @requires config
 * */

module.exports = {
    getPeriods: _getPeriods,
    periods: periods,
    convertPeriod: _convertPeriod
};

/**
 * Check if an array contains a given object
 * @param {AgreementModel} agreement object to search for
 * @param {WindowModel} window array to search into
 * @alias module:utils.getPeriodsFrom
 * */
function _getPeriods(agreement, window) {
    var periods = [];
    if (!window){
        window = {};
    }
    var slot = slots[window.period || "monthly"];
    var Wfrom = moment.utc(moment.tz(window.initial ? window.initial : agreement.context.validity.initial, agreement.context.validity.timeZone));
    var Wto = window.end ? moment.utc(moment.tz(window.end, agreement.context.validity.timeZone)) : moment.utc();

    var from = moment.utc(moment.tz(Wfrom, agreement.context.validity.timeZone)),
        to = moment.utc(moment.tz(Wfrom, agreement.context.validity.timeZone).add(slot.count, slot.unit).subtract(1, "milliseconds"));

    while (!to || to.isSameOrBefore(Wto)) {
        periods.push({
            from: from,
            to: to
        });
        from = moment.utc(moment.tz(from, agreement.context.validity.timeZone).add(slot.count, slot.unit));
        to = moment.utc(moment.tz(from, agreement.context.validity.timeZone).add(slot.count, slot.unit).subtract(1, "milliseconds"));
    }

    return periods;
}


var slots = {
    "quarterly": {
        count: 3,
        unit: "months"
    },
    "monthly": {
        count: 1,
        unit: "months"
    },
    "daily": {
        count: 1,
        unit: "day"
    },
    "hourly": {
        count: 1,
        unit: "hour"
    },
    "minutely": {
        count: 1,
        unit: "minute"
    },
    "secondly": {
        count: 1,
        unit: "second"
    },
    "weekly": {
        count: 1,
        unit: "week"
    },
    "biweekly": {
        count: 2,
        unit: "week"
    },
    "yearly": {
        count: 1,
        unit: "years"
    }
};

/**
 * Periods in milliseconds
 * @alias module:utils.periods
 * */
var periods = {
    "secondly": 1000,
    "minutely": 60000,
    "hourly": 3600000,
    "daily": 86400000,
    "weekly": 604800000,
    "monthly": 2628000000,
    "quarterly": 7884000000,
    "yearly": 31540000000
};


/**
 * Convert a given billing cycle into a period string
 * @param {Object} billingCycle object billing cycle to convert
 * @alias module:utils.convertPeriod
 * */
function _convertPeriod(billingCycle) {
    switch (billingCycle) {
        case "yearly":
            return "years";
        case "monthly":
            return "months";
        case "daily":
            return "days";
    }
}
