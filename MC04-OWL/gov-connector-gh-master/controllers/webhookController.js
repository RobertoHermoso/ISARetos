'use strict'

var varwebhookController = require('./webhookControllerService');

module.exports.getActivity = function getActivity(req, res, next) {
  varwebhookController.getActivity(req, res, next);
};