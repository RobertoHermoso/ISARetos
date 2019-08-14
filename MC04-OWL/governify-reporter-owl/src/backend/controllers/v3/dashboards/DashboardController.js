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

const moment = require("moment-timezone");
const InfluxDB = require("../../../services/influxService").InfluxDB;
const config = require("../../../configurations");
const logger = require("../../../logger");

// const logger = require('../../../logger');
var request=require('request');
/**
 * Return dashboard JSON for grafana
 **/


exports.dashboardGET = (req, res, next) => {
    var agreementId = req.swagger.params['agreementId'].value;
    var registry = config.v2.agreementURL;
    var url = registry + agreementId;

    request.get({
        url: url,
        json: true,
        headers: {'User-Agent': 'request'}
      }, (err, resp, data) => {
        if (err) {
          console.log('Error:', err);
        } else if (resp.statusCode !== 200) {
          var dashboard = createNoAgreementDashboard(agreementId, data);
          res.status(200).send(dashboard);
        } else {
          // Check if there's influx data for the agreement
          InfluxDB.getAgreementData().then(function(influxData){
          var dashboard;
          if(influxData.toString().indexOf(agreementId)>=0){
            dashboard = createDashboard(agreementId, data, false);
            res.status(200).send(dashboard);          
          }else{
            dashboard = createNoDataDashboard(agreementId, data);
            res.status(200).send(dashboard);
          }
        });
      }
    });
}

exports.dashboardEvolutionGET = (req, res, next) => {
    var agreementId = req.swagger.params['agreementId'].value;
    var registry = config.v2.agreementURL;
    var url = registry + agreementId;

    request.get({
        url: url,
        json: true,
        headers: {'User-Agent': 'request'}
      }, (err, resp, data) => {
        if (err) {
          console.log('Error:', err);
        } else if (resp.statusCode !== 200) {
          var dashboard = createNoAgreementDashboard(agreementId, data);
          res.status(200).send(dashboard);
        } else {
           // Check if there's influx data for the agreement
           InfluxDB.getAgreementData().then(function(influxData){
            var dashboard;
  
            if(influxData.toString().indexOf(agreementId)>=0){
              dashboard = createDashboard(agreementId, data, true);
              res.status(200).send(dashboard);          
            }else{
              dashboard = createNoDataDashboard(agreementId, data);
              res.status(200).send(dashboard);
            }
          });
        }
      });
}

function createDashboard(agreementId, agreement, evolution){

// Initialise dashbard
var dashboard;

// Setup basic dashboard configuration
dashboard = {
        "__inputs": [
          {
            "name": "DS_INFLUXDB",
            "label": "influxDB",
            "description": "",
            "type": "datasource",
            "pluginId": "influxdb",
            "pluginName": "InfluxDB"
          }
        ],
        "__requires": [
          {
            "type": "grafana",
            "id": "grafana",
            "name": "Grafana",
            "version": "4.6.3"
          },
          {
            "type": "panel",
            "id": "graph",
            "name": "Graph",
            "version": ""
          },
          {
            "type": "datasource",
            "id": "influxdb",
            "name": "InfluxDB",
            "version": "1.0.0"
          },
          {
            "type": "panel",
            "id": "table",
            "name": "Table",
            "version": ""
          }
        ],
        "annotations": {
          "list": [
            {
              "builtIn": 1,
              "datasource": "-- Grafana --",
              "enable": true,
              "hide": true,
              "iconColor": "rgba(0, 211, 255, 1)",
              "name": "Annotations & Alerts",
              "type": "dashboard"
            }
          ]
        },
        "editable": true,
        "gnetId": null,
        "graphTooltip": 0,
        "hideControls": false,
        "id": null,
        "links": [],
        "refresh": "5s",
        "rows": [],
        "schemaVersion": 14,
        "style": "dark",
        "time": {
          "from": "now-5y",
          "to": "now"
        },
        "timepicker": {
          "refresh_intervals": [
            "5s",
            "10s",
            "30s",
            "1m",
            "5m",
            "15m",
            "30m",
            "1h",
            "2h",
            "1d"
          ],
          "time_options": [
            "5m",
            "15m",
            "1h",
            "6h",
            "12h",
            "24h",
            "2d",
            "7d",
            "30d"
          ]
        },
        "timezone": "",
        "title": "GAUSS " + agreementId + (evolution ? " evolución" : ""),
        "uid": null,
        "version": 12
}

// Set non-static fiels from agreement into variables
var timezone = agreement.context.validity.timeZone;

var metrics = [];
var guaranteesData = {};
for(var i = 0; i < agreement.terms.guarantees.length; i++){

    var guarantee = agreement.terms.guarantees[i];

    // Save metrics
    metrics.push(guarantee.id);

    // Set guarantees for every metric
    guaranteesData[guarantee.id] = guarantee;
}

// Set dashboard rows
// There are so many rows as metrics

for(var i = 0; i < metrics.length; i++){

  // Initialise row
  var row;

  // Set basic row information
  row = {
     "collapse": false,
      "height": "300",
      "panels" : [],
      "repeat": null,
      "repeatIteration": null,
      "repeatRowId": null,
      "showTitle": false,
      "title": "Gráficas",
      "titleSize": "h6"
  }


  // Set row panels
  // By default we're setting two panels per row: a table and a graph

  // First we set table panel
  var table;

  table = {
          "columns": [],
          "datasource": "InfluxDB",
          "fontSize": "100%",
          "height": "",
          "hideTimeOverride": false,
          "id": i,
          "links": [
            {
              "dashUri": "db/gauss-sco-evolucion",
              "dashboard": "GAUSS SCO evolución",
              "includeVars": true,
              "keepTime": true,
              "targetBlank": true,
              "title": "GAUSS SCO evolución",
              "type": "dashboard"
            }
          ],
          "pageSize": null,
          "scroll": true,
          "showHeader": true,
          "sort": {
            "col": 0,
            "desc": evolution ? false : true
          },
          "span": 6,
          "styles": [
            {
              "alias": "Fecha",
              "dateFormat": "MMMM D, YYYY LT",
              "pattern": "Time",
              "preserveFormat": false,
              "sanitize": false,
              "type": "date",
              "unit": "dateTimeAsUS"
            }
          ],
          "targets": [],
          "timeFrom": null,
          "timeShift": null,
          "title": metrics[i],
          "transform": "timeseries_to_columns",
          "transparent": evolution ? false : true,
          "type": "table"
  }

  // Next we set graph panel
  var graph;

  graph = {
    "alert": {
      "conditions": []
    },
    "aliasColors": {
      "P1": "#bf1b00",
      "P4": "#d683ce"
    },
    "bars": false,
    "dashLength": 10,
    "dashes": false,
    "datasource": "InfluxDB",
    "fill": 1,
    "height": "",
    "id": i+4,
    "legend": {
      "avg": false,
      "current": false,
      "max": false,
      "min": false,
      "show": true,
      "total": false,
      "values": false
    },
    "lines": true,
    "linewidth": 1,
    "links": [
      {
        "dashUri": "db/gauss-sco-evolucion",
        "dashboard": "GAUSS SCO evolución",
        "includeVars": true,
        "keepTime": true,
        "targetBlank": true,
        "title": "GAUSS SCO evolución",
        "type": "dashboard"
      }
    ],
    "nullPointMode": "null",
    "percentage": false,
    "pointradius": 5,
    "points": false,
    "renderer": "flot",
    "seriesOverrides": [],
    "spaceLength": 10,
    "span": 6,
    "stack": false,
    "steppedLine": false,
    "targets": [],
    "thresholds": [
      {
        "colorMode": "critical",
        "fill": true,
        "line": true,
        "op": getConditionType(guaranteesData[metrics[i]].of[0].objective),
        "value": parseInt(guaranteesData[metrics[i]].of[0].objective.split("=")[1].trim())
      }
    ],
    "timeFrom": null,
    "timeShift": null,
    "title": metrics[i],
    "tooltip": {
      "shared": true,
      "sort": 0,
      "value_type": "individual"
    },
    "transparent": evolution ? false : true,
    "type": "graph",
    "xaxis": {
      "buckets": null,
      "mode": "time",
      "name": null,
      "show": true,
      "values": []
    },
    "yaxes": [
      {
        "format": "short",
        "label": null,
        "logBase": 1,
        "max": null,
        "min": null,
        "show": true
      },
      {
        "format": "short",
        "label": null,
        "logBase": 1,
        "max": null,
        "min": null,
        "show": true
      }
    ]
  }

  var selectEv = [{
    "params": [
      "value"
    ],
    "type": "field"
  },{
    "params": [
    ],
    "type": "last"
  }]

  var select = [{
    "params": [
      "value"
    ],
    "type": "field"
  }]

  for(var j = 0; j < guaranteesData[metrics[i]].of.length; j++){
      var style = {
        "alias": "",
        "colorMode": "cell",
        "colors": [
          "#e24d42",
          "#508642",
          "rgba(63, 104, 51, 0)"
        ],
        "dateFormat": "YYYY-MM-DD HH:mm:ss",
        "decimals": 2,
        "link": true,
        "linkTargetBlank": true,
        "linkTooltip": "Ver evidencias",
        "linkUrl": agreement.context.infrastructure.reporter.slice(0, -2)  + "/evidences/#!/?agreement=" + agreementId + "&guarantee=" + metrics[i] + "&priority=" + guaranteesData[metrics[i]].of[j].scope.priority  + "&period=$__cell_0&value=$__cell&tz=" + timezone,
        "pattern": guaranteesData[metrics[i]].of[j].scope.priority,
        "thresholds": evolution ? [90] : [guaranteesData[metrics[i]].of[j].objective.split("=")[1].trim()],
        "type": "number",
        "unit": "short"
      }

      var tableTarget =  {
        "alias": guaranteesData[metrics[i]].of[j].scope.priority,
        "dsType": "influxdb",
        "groupBy": [],
        "measurement": evolution ? "metrics_values_historical" : "metrics_values",
        "orderByTime": "ASC",
        "policy": "default",
        "refId": guaranteesData[metrics[i]].of[j].scope.priority,
        "resultFormat": "time_series",
        "select": [
          evolution ? selectEv : select
        ],
        "tags": [
          {
            "key": "id",
            "operator": "=",
            "value": metrics[i]
          },
          {
            "condition": "AND",
            "key": "priority",
            "operator": "=",
            "value": guaranteesData[metrics[i]].of[j].scope.priority
          },
          {
            "condition": "AND",
            "key": "agreement",
            "operator": "=",
            "value": agreementId
          }
        ]
      }

      var graphTarget =  {
        "alias": guaranteesData[metrics[i]].of[j].scope.priority,
        "dsType": "influxdb",
        "groupBy": [],
        "measurement": evolution ? "metrics_values_historical" : "metrics_values",
        "orderByTime": "ASC",
        "policy": "default",
        "refId": guaranteesData[metrics[i]].of[j].scope.priority,
        "resultFormat": "time_series",
        "select": [
          select
        ],
        "tags": [
          {
            "key": "id",
            "operator": "=",
            "value": metrics[i]
          },
          {
            "condition": "AND",
            "key": "priority",
            "operator": "=",
            "value": guaranteesData[metrics[i]].of[j].scope.priority
          },
          {
            "condition": "AND",
            "key": "agreement",
            "operator": "=",
            "value": agreementId
          }
        ]
      }

    var condition = {
      "evaluator": {
        "params": [
          guaranteesData[metrics[i]].of[j].objective.split("=")[1].trim()
        ],
        "type": getConditionType(guaranteesData[metrics[i]].of[0].objective)
      },
      "operator": {
        "type": "and"
      },
      "query": {
        "params": [
          "A",
          "740h",
          "now"
        ]
      },
      "reducer": {
        "params": [],
        "type": "avg"
      },
      "type": "query"
    }

      table.styles.push(style);
      table.targets.push(tableTarget);
      graph.alert.conditions.push(condition)
      graph.targets.push(graphTarget);
  }

  row.panels.push(table);
  row.panels.push(graph);
  dashboard.rows.push(row)
}

return dashboard;
}

function getConditionType(objective){
var num = objective.split(">").length;

if(num > 1){
  return "lt"
}else{
  return "gt"
}
}

function createNoDataDashboard(agreementId, agreement){

  // Set url parameters
  // var agreement = agreementId.toLowerCase().replace(new RegExp("_", 'g'),"-");
  // var type = agreement.split("-")[2];
  // var url = "http://localhost:8070/render?model=/renders/SCO/"+type+"/"+agreement+".json&view=/renders/SCO/"+type+"/"+agreement+".html&ctrl=/renders/SCO/"+type+"/"+agreement+".js"
  var url = agreement.context.infrastructure.render;
  // Basic dashboard with one text panel
  var dashboard = {
        title: "Error",
        rows: [
          {
            title: 'Chart',
            height: '150px',
            panels: [
              {
                title: "Error" ,
                type: 'text',
                span: 12,
                fill: 1,
                linewidth: 2,
                content: "El cuadro para el acuerdo " + agreementId + " no tiene información."
                + "<br/> Verifique que está activo <a href='" + url + "'>aquí</a>"
                + "<style>body{font-size:20px;text-align:'center'}</style>",
                mode: "html"
              }
        ]
      }
    ]
  };

  return dashboard;
}

function createNoAgreementDashboard(agreementId){

  // Basic dashboard with one text panel
  var dashboard = {
        title: "Error",
        rows: [
          {
            title: 'Chart',
            height: '150px',
            panels: [
              {
                title: "Error" ,
                type: 'text',
                span: 12,
                fill: 1,
                linewidth: 2,
                content: "El acuerdo con identificador " + agreementId + " no existe."
                + "<style>body{font-size:20px;text-align:'center'}</style>",
                mode: "html"
              }
        ]
      }
    ]
  };

  return dashboard;
}
