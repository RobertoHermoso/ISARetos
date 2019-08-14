'use strict'

var varv1indicatorsidController = require('./v1indicatorsidControllerService');

module.exports.computeMetric = function computeMetric(req, res, next) {
  varv1indicatorsidController.computeMetric(req, res, next);
};