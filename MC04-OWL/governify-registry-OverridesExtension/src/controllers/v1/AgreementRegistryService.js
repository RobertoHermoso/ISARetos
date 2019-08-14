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
const db = require('../../database');

const agreements = require('./agreements/agreements.js');

exports.agreementsGET = agreements.agreementsGET;

exports.agreementsDELETE = agreements.agreementsDELETE;

exports.agreementsPOST = agreements.agreementsPOST;

exports.agreementsAgreementGET = agreements.agreementIdGET;

exports.agreementsAgreementDELETE = agreements.agreementIdDELETE;


exports.agreementsAgreementTermsGuaranteesGET = function (args, res) {
    /**
     * parameters expected in the args:
     * agreement (String)
     **/
    var AgreementModel = db.models.AgreementModel;
    AgreementModel.find({
        'id': args.agreement.value
    }, function (err, agreement) {
        if (err) {
            console.error(err);
            res.end();
        }
        if (agreement.length === 1) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(agreement[0].terms.guarantees));
        }
    });

};

exports.agreementsAgreementTermsGuaranteesGuaranteeGET = function (args, res) {
    /**
     * parameters expected in the args:
     * agreement (String)
     * guarantee (String)
     **/
    var AgreementModel = db.models.AgreementModel;
    AgreementModel.find({
        'id': args.agreement.value
    }, function (err, agreement) {
        if (err) {
            console.error(err);
            res.end();
        }
        if (agreement.length === 1) {
            var guarantee = agreement[0].terms.guarantees.filter(function (guarantee) {
                return guarantee.id === args.guarantee.value;
            });

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(guarantee));
        }
    });

};

exports.agreementsAgreementContextDefinitionsGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = {
        "provider": "aeiou",
        "infrastructure": {},
        "validity": {
            "init": "aeiou",
            "end": "aeiou"
        },
        "definitions": {
            "schemas": {},
            "scopes": {},
            "logs": {}
        },
        "consumer": "aeiou"
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementContextDefinitionsLogsGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = {};
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementContextDefinitionsSchemasGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = {};
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementContextDefinitionsScopesGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = {};
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementContextGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = {
        "provider": "aeiou",
        "infrastructure": {},
        "validity": {
            "init": "aeiou",
            "end": "aeiou"
        },
        "definitions": {
            "schemas": {},
            "scopes": {},
            "logs": {}
        },
        "consumer": "aeiou"
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementContextInfrastructureGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = {};
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementContextValidityGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = {
        "init": "aeiou",
        "end": "aeiou"
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementTermsGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = {
        "quotas": {},
        "rates": {},
        "metrics": {},
        "guarantees": {},
        "pricing": {
            "cost": 1.3579000000000001069366817318950779736042022705078125,
            "currency": "aeiou",
            "billing": {
                "init": "aeiou",
                "period": "aeiou",
                "penalties": "",
                "rewards": ""
            }
        }
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementTermsMetricsGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = {};
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementTermsMetricsMetricGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     * metric (String)
     **/
    var examples = {};
    examples['application/json'] = {};
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementTermsPricingBillingGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = {
        "init": "aeiou",
        "period": "aeiou",
        "penalties": "",
        "rewards": ""
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementTermsPricingBillingPenaltiesGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = "";
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementTermsPricingBillingPenaltiesPenaltyGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     * penalty (String)
     **/
    var examples = {};
    examples['application/json'] = {
        "over": {},
        "upTo": 1.3579000000000001069366817318950779736042022705078125,
        "aggregatedBy": "aeiou",
        "of": "",
        "id": "aeiou",
        "groupBy": [{}]
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementTermsPricingBillingRewardsGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = "";
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementTermsPricingBillingRewardsRewardGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     * reward (String)
     **/
    var examples = {};
    examples['application/json'] = {
        "over": {},
        "upTo": 1.3579000000000001069366817318950779736042022705078125,
        "aggregatedBy": "aeiou",
        "of": "",
        "id": "aeiou",
        "groupBy": [{}]
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementTermsPricingGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = {
        "cost": 1.3579000000000001069366817318950779736042022705078125,
        "currency": "aeiou",
        "billing": {
            "init": "aeiou",
            "period": "aeiou",
            "penalties": "",
            "rewards": ""
        }
    };
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementTermsQuotasGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = {};
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }

};

exports.agreementsAgreementTermsRatesGET = function (args, res) {
    /**
     * parameters expected in the args:
     * namespace (String)
     * agreement (String)
     **/
    var examples = {};
    examples['application/json'] = {};
    if (Object.keys(examples).length > 0) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
    } else {
        res.end();
    }


};