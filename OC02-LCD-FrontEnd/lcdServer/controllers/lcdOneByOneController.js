'use strict'

var varlcdOneByOneController = require('./lcdOneByOneControllerService');

module.exports.funclcdOneByOneGET = function funclcdOneByOneGET(req, res, next) {
  varlcdOneByOneController.funclcdOneByOneGET(req.swagger.params, res, next);
};