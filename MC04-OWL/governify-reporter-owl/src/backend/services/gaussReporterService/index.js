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

const Reporter = require('../../services/reporterService').Reporter;
const logger = require("../../logger");

/////////////////////////////////////////////////////////////// BEGIN CLASS ///////////////////////////////////////////////////////////////
class GaussReporter extends Reporter {
    /////////////////////////// BEGIN CONSTRUCTOR ///////////////////////////
    constructor(){
        super();
    }
    /////////////////////////// END CONSTRUCTOR ///////////////////////////

    /////////////////////////// BUSINESS COUPLED FUNCTIONS ///////////////////////////
    _generateResponse(kpi, evidence) {
        return new Promise((resolve, reject) => {
            let guarantee = this._agreement.terms.guarantees.find((guarantee) => {
                return guarantee.id === kpi.id;
            });

            if (!guarantee) {
                logger.error("Guarantee not found for KPI %s", JSON.stringify(kpi.id, null, 2));
                return reject("Guarantee not found for KPI %s", JSON.stringify(kpi.id, null, 2));
            }

            let ofElement = guarantee.of.find((ofElement) => {
                return checkScope(kpi, ofElement);
            });

            let metric = this._agreement.terms.metrics[kpi.id];
            if (!metric) {
                logger.error("Metric not found: %s", JSON.stringify(kpi.id, null, 2));
                return reject("Metric not found: %s", JSON.stringify(kpi.id, null, 2));
            }

            let name, description, mClass, kind, reportable;
            if (metric.metadata) {
                name = metric.metadata.name ? metric.metadata.name : '';
                description = metric.metadata.description ? metric.metadata.description : '';
                mClass = metric.metadata.class ? (metric.metadata.class == 'Negocio' ? 'N' : (metric.metadata.class == 'Totalizador' ? 'T' : '')) : '';
                kind = metric.metadata.kind ? (metric.metadata.kind == 'Penalizador' ? 'P' : (metric.metadata.kind == 'Bonificador' ? 'B' : (metric.metadata.kind == 'Facturador' ? 'F' : ''))) : '';
                reportable = metric.metadata.reportable !== undefined ? (metric.metadata.reportable ? 'SI' : 'NO') : '';
            }

            let frequency;
            if (ofElement.window.period === 'monthly') {
                frequency = 1;
            } else if (ofElement.window.period === 'quarterly') {
                frequency = 3;
            }

            let scopes = [];
            let scope;
            for (let scopeId in guarantee.scope) {
                scope = guarantee.scope[scopeId];
                if (scope && scope.metadata && scope.metadata.reported && kpi.scope[scopeId] !== undefined) {
                    scopes.push({
                        name: scope.name,
                        value: kpi.scope[scopeId]
                    });
                }
            }

            let matches;
            let params = ofElement.with[kpi.id];
            let schedule, deadlineSign, deadlineThreshold, deadlineUnit;
            if (params && params.schedule) {
                schedule = (params.schedule === 'L-DT00:00-23:59') ? '24X7' :
                    params.schedule.split('T')[0] + ' de ' + params.schedule.split('T')[1].replace('-', ' a ');
            }
            if (params && params.deadline) {
                matches = params.deadline.match(/(\b\d+(\.\d+)?\b)/g);
                if (matches.length > 0) {
                    deadlineThreshold = parseFloat(matches[0]).toFixed(2);
                }
                matches = params.deadline.match(/(<[=>]?|==|>=?)/g);
                if (matches.length > 0) {
                    deadlineSign = matches[0];
                }

                if (metric.parameters && metric.parameters.deadline) {
                    deadlineUnit = metric.parameters.deadline.schema.unit === 'hours' ? 'HORAS' : (metric.parameters.deadline.schema.unit === 'days' ? 'DIAS' : metric.parameters.deadline.schema.unit);
                }
            }

            let regexThresholdSign = /[a-zA-Z_$][a-zA-Z_$0-9]*\s*(>=|<=|<|>|==|!=)\s*(\d*\.?\d*)|(\d*\.?\d*)\s*(>=|<=|<|>|==|!=)\s*[a-zA-Z_$][a-zA-Z_$0-9]*/g;
            let regexThresholdSignArray = regexThresholdSign.exec(ofElement.objective);
            let objectiveThreshold = regexThresholdSignArray[2] ? regexThresholdSignArray[2] : regexThresholdSignArray[3];
            let objectiveSign = regexThresholdSignArray[1] ? regexThresholdSignArray[1] : regexThresholdSignArray[4];

            if (objectiveThreshold) {
                objectiveThreshold = parseFloat(objectiveThreshold).toFixed(2);
            } else {
                logger.info("objectiveThreshold is undefined. Expression: " + ofElement.objective);
                objectiveThreshold = "";
            }

            if (!objectiveSign) {
                logger.info("objectiveSign is undefined. Expression: " + ofElement.objective);
                objectiveSign = "";
            }

            let response = {
                CONTRATO: this._agreementId,
                MES: moment.tz(kpi.period.to, this._agreement.context.validity.timeZone).format('YYYYMM'),
                PERIODO: moment.tz(kpi.period.from, this._agreement.context.validity.timeZone).format('YYYY-MM-DD') + '/' + moment.tz(kpi.period.to, this._agreement.context.validity.timeZone).format('YYYY-MM-DD'),
                FECHAFAC: moment.tz(contractDate, this._agreement.context.validity.timeZone).toISOString(),
                LINEA: kpi.scope.serviceLine,
                ACTIVIDAD: kpi.scope.activity,
                KPI: kpi.id,
                NOMBRE: name,
                DESCRIPCION: description,
                CLASE: mClass,
                TIPO: kind,
                INFORMATIVO: reportable,
                UNIDADKPI: metric.schema.unit,
                FRECUENCIA: frequency,
                DIAINICIO: ofElement.window.initial ? moment.tz(ofElement.window.initial, this._agreement.context.validity.timeZone).date() : '',
                FECHAALTA: ofElement.window.initial ? moment.tz(ofElement.window.initial, this._agreement.context.validity.timeZone).format('YYYY-MM-DD') : '',
                FECHABAJA: ofElement.window.end ? moment.tz(ofElement.window.end, this._agreement.context.validity.timeZone).format('YYYY-MM-DD') : '',
                NOMBRE1: scopes[0] ? 'Por ' + scopes[0].name : "",
                NOMBRE2: scopes[1] ? 'Por ' + scopes[1].name : "",
                // NOMBRE3: scopes[2] ? 'Por ' + scopes[2].name : "",
                VALOR1: scopes[0] ? scopes[0].value : "",
                VALOR2: scopes[1] ? scopes[1].value : "",
                // VALOR3: scopes[2] ? scopes[2].value : "",
                HORARIO: schedule ? schedule : '',
                PLAZOSIG: deadlineSign ? deadlineSign : '',
                PLAZOUMB: deadlineThreshold ? deadlineThreshold : '',
                PLAZOUND: deadlineUnit ? deadlineUnit : '',
                OBJETIVOSIG: objectiveSign,
                OBJETIVOUMB: objectiveThreshold
            };

            if (evidence) {
                let CUMPLE = 'SI';
                response.CUMPLE = CUMPLE;
                response.ID = evidence.id;
                response.DURACION_TRS = evidence.issue_trs_duration;
                response.DURACION_TRL = evidence.issue_trl_duration;
                response.DURACION_PU = evidence.issue_pu_duration;
            } else {
                let trueEvidences = [];
                let population = [];
                if (kpi.evidences) {
                    trueEvidences = kpi.evidences.filter((ev) => {
                        return ev[kpi.id + '_evidence'] ? JSON.parse(ev[kpi.id + '_evidence']) : false;
                    });
                    population = kpi.evidences.length;
                }

                let compensationValue = "";
                let compensationUnit = "";

                if (!JSON.parse(kpi.value)) {
                    ofElement.penalties.forEach((penalty) => {
                        for (let complet in penalty.over) {
                            compensationValue = Number(kpi.penalties[compVar]).toFixed(2);
                            compensationUnit = penalty.over[compVar].unit;
                            break;
                        }
                    });
                }

                let value;
                let oc = trueEvidences.length;
                value = Number(kpi.metrics[kpi.id]).toFixed(2);

                response.OCURRENCIA = oc;
                response.POBLACION = population;
                response.VALOR = value;
                response.COMPENSACION = compensationValue;
                response.COMPENSACIONUND = compensationUnit;
            }
            let year2 = Number(String(response.MES).substr(0, 4));
            let month2 = Number(String(response.MES).substr(4, 6)) - 1;
            let day = Number(String(moment.tz(kpi.period.to, this._agreement.context.validity.timeZone).format('YYYY-MM-DD')).substr(8, 10));


            let dateaux = moment.tz([year2, month2, day, 23, 59, 59, 999], this._agreement.context.validity.timeZone).format();
            let date = moment(dateaux).valueOf();
            let properties = {};

            for (let i = 0; i < 3; i++) {
                if (scopes[i]) {
                    properties[scopes[i].name] = scopes[i].value;
                }
            }

            Object.keys(kpi.metrics).forEach(k => {
                let id = k;
                let priority = (properties.Priority != undefined) ? properties.Priority : "NA";
                let value = Number(kpi.metrics[k]);
                let timestamp = Number(date) * 1000000;

                this._persistence.writeIdPriority(id, scopes, value, timestamp);

            });
            return resolve(response);
        });
    }

    _checkScope(scopeObj1, scopeObj2) {
        var checkPriority = true;
        checkServiceLine = true;
        checkActivity = true;

        if (scopeObj1.scope.priority && scopeObj2.scope.priority && scopeObj2.scope.priority.toString() !== "*") {
            checkPriority = scopeObj2.scope.priority.toString() === scopeObj1.scope.priority.toString();
        }
        if (scopeObj1.scope.serviceLine && scopeObj2.scope.serviceLine && scopeObj2.scope.serviceLine.toString() !== "*") {
            checkServiceLine = scopeObj2.scope.serviceLine.toString() === scopeObj1.scope.serviceLine.toString();
        };
        if (scopeObj1.scope.activity && scopeObj2.scope.activity && scopeObj2.scope.activity.toString() !== "*") {
            checkActivity = scopeObj2.scope.activity.toString() === scopeObj1.scope.activity.toString();
        };

        return checkPriority && checkServiceLine && checkActivity;
    }


    /////////////////////////// END BUSINESS COUPLED FUNCTIONS ///////////////////////////

}
/////////////////////////////////////////////////////////////// END CLASS ///////////////////////////////////////////////////////////////

module.exports = {
    GaussReporter: GaussReporter,
};