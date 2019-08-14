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

const config = require('../../../../configurations');
const logger = require('../../../../logger');
const stateManager = require('../../../../stateManager/v1/stateManager.js');
const ErrorModel = require('../../../../errors/index.js').errorModel;
const Promise = require("bluebird");
const moment = require('moment');

module.exports.guaranteesGET = function (args, res) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * from (String)
     * to (String)
     **/
    logger.ctlState("New request to GET guarantees");
    var agreementId = args.agreement.value;

    stateManager({
        id: agreementId
    }).then(function (manager) {
        logger.ctlState("Getting state of guarantees...");

        if (config.parallelProcess.guarantees) {
            logger.ctlState("Processing guarantees in parallel mode");
            var processGuarantees = [];
            manager.agreement.terms.guarantees.forEach(function (guarantee) {
                processGuarantees.push(manager.get('guarantees', {
                    guarantee: guarantee.id
                }));
            });

            Promise.settle(processGuarantees).then(function (guaranteesValues) {
                try {
                    if (guaranteesValues.length > 0) {
                        var result = [];
                        for (var i = 0; i < guaranteesValues.length; i++) {
                            if (guaranteesValues[i].isFulfilled()) {
                                if (guaranteesValues[i].value().length > 0) {
                                    var guaranteesResults = guaranteesValues[i].value().map(function (guaranteeValue) {
                                        return manager.current(guaranteeValue);
                                    });
                                    result = result.concat(guaranteesResults);
                                }
                            }
                        }
                        res.json(result);
                    } else {
                        var err = 'Error processing guarantee: empty result';
                        logger.error(err);
                        res.status(500).json(new ErrorModel(500, err));
                    }
                } catch (err) {
                    logger.error(err);
                    res.status(500).json(new ErrorModel(500, err));
                }
            }, function (err) {
                logger.error(err);
                res.status(500).json(new ErrorModel(500, err));
            });
        } else {
            logger.ctlState("Processing guarantees in sequential mode");
            var ret = [];
            Promise.each(manager.agreement.terms.guarantees, function (guarantee) {
                logger.ctlState("- guaranteeId: " + guarantee.id);
                return manager.get('guarantees', {
                    guarantee: guarantee.id
                }).then(function (results) {
                    for (var i in results) {
                        ret.push(manager.current(results[i]));
                    }
                }, function (err) {
                    logger.error(err);
                });
            }).then(function () {
                res.json(ret);
            }, function (err) {
                logger.error("ERROR processing guarantees: ", err);
                res.status(500).json(new ErrorModel(500, err));
            });
        }
    }, function (err) {
        logger.error(err);
        res.status(500).json(new ErrorModel(500, err));
    });
};

module.exports.guaranteeIdGET = function (args, res) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * guarantee (String)
     **/
    logger.ctlState("New request to GET guarantee");
    var agreementId = args.agreement.value;
    var guaranteeId = args.guarantee.value;

    stateManager({
        id: agreementId
    }).then(function (manager) {
        manager.get('guarantees', {
            guarantee: guaranteeId
        }).then(function (success) {
            res.json(success.map(function (element) {
                return manager.current(element);
            }));
        }, function (err) {
            logger.error(err);
            res.status(500).json(new ErrorModel(500, err));
        });
    }, function (err) {
        logger.error(err);
        res.status(500).json(new ErrorModel(500, err));
    });
};

module.exports.guaranteeIdPenaltyPOST = function (args, res) {
    var guaranteeId = args.guarantee.value;
    var agreementId = args.agreement.value;
    var query = args.query.value;

    logger.ctlState("New request to GET penalty of " + guaranteeId);

    var offset = query.parameters.offset;

    stateManager({
        id: agreementId
    }).then(function (manager) {

        var periods = getPeriods(manager.agreement, query.window);

        var result = [];
        Promise.each(periods, function (element) {
            var p = {
                from: moment.utc(moment.tz(element.from, manager.agreement.context.validity.timeZone).subtract(Math.abs(offset), "months")).toISOString(),
                to: moment.utc(moment.tz(element.to, manager.agreement.context.validity.timeZone).subtract(Math.abs(offset), "months")).toISOString()
            };
            //  logger.ctlState("Query before parse: " + JSON.stringify(query, null, 2));
            var logId = Object.keys(query.logs)[0];
            var log = manager.agreement.context.definitions.logs[logId];
            var scope = {};
            var scopeId = Object.keys(log.scopes)[0];
            var logScopes = Object.keys(log.scopes[scopeId]).map(function (key) {
                return log.scopes[scopeId][key];
            });
            for (var queryScope in query.scope) {
                if (logScopes.indexOf(queryScope) > -1) {
                    for (var logScope in log.scopes[scopeId]) {
                        if (log.scopes[scopeId][logScope] === queryScope) {
                            scope[logScope] = query.scope[queryScope];
                        }
                    }
                } else {
                    scope[queryScope] = query.scope[queryScope];
                }
            }
            query.scope = scope ? scope : query.scope;

            //  logger.ctlState("Query after parse: " + JSON.stringify(query, null, 2));
            return manager.get('guarantees', {
                guarantee: guaranteeId,
                scope: query.scope
                //  period: p //,
                //  window: query.window
            }).then(function (success) {
                var ret = [];
                for (var ie in success) {
                    var e = success[ie];
                    //logger.ctlState("Comparing period:  " + e.period.from + ">=" + p.from + " && " + e.period.to + "<=" + p.to);
                    if (moment(e.period.from).isSameOrAfter(p.from) && moment(e.period.to).isSameOrBefore(p.to) && checkQuery(e, query)) {
                        ret.push(e);
                    }
                }
                //logger.ctlState("Result for the period : " + JSON.stringify(element) + "=>\n" + JSON.stringify(ret, null, 2));

                for (var i in ret) {
                    if (manager.current(ret[i]).penalties) {
                        var penalties = manager.current(ret[i]).penalties;
                        for (var penaltyI in penalties) {
                            result.push(new PenaltyMetric(ret[i].scope, query.parameters, element, query.logs, penaltyI, penalties[penaltyI]));
                        }
                    }
                }

            }, function (err) {
                logger.error(err);
                //res.status(500).json(new ErrorModel(500, err));
            });

        }).then(function () {
            res.json(result);
        }, function (err) {
            logger.error(err);
            res.status(500).json(new ErrorModel(500, err));
        });

    }, function (err) {
        logger.error(err);
        res.status(500).json(new ErrorModel(500, err));
    });
};

function getPeriods(agreement, window) {
    var periods = [];
    var Wfrom = moment.utc(moment.tz(window.initial, agreement.context.validity.timeZone));
    var current = moment.utc();
    var from = moment.utc(Wfrom),
        to = moment.utc(Wfrom).add(1, "months").subtract(1, "milliseconds");
    while (!to || to.isSameOrBefore(current)) {
        periods.push({
            from: from,
            to: to
        });
        from = moment.utc(moment.tz(from, agreement.context.validity.timeZone).add(1, "months"));
        to = moment.utc(moment.tz(from, agreement.context.validity.timeZone).add(1, "months").subtract(1, "milliseconds"));
    }

    return periods;
}

//function
function PenaltyMetric(scope, parameters, period, logs, penaltyName, penaltyValue) {
    this.scope = scope;
    this.parameters = parameters;
    this.period = period;
    this.penalty = penaltyName;
    this.value = penaltyValue;
    this.logs = logs;
}

function checkQuery(element, query) {
    var ret = true;
    for (var v in query) {
        if (v !== "parameters" && v !== "evidences" && v !== "logs" && v !== "window") {
            if (query[v] instanceof Object) {
                ret = ret && checkQuery(element[v], query[v]);
            } else {
                if ((element[v] !== query[v] && query[v] !== "*") || !element[v]) {
                    ret = ret && false;
                }
            }
        }
    }
    return ret;
}