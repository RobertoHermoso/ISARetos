'use strict'

var varlcdController = require('./lcdControllerService');

module.exports.searchInventory = function searchInventory(req, res, next) {
  varlcdController.searchInventory(req.swagger.params, res, next);
};