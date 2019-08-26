'use strict'

var varresultadoController = require('./resultadoControllerService');

module.exports.getResultado = function getResultado(req, res, next) {
  varresultadoController.getResultado(req.swagger.params, res, next);
};