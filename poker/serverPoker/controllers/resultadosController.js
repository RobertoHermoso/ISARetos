'use strict'

var varresultadosController = require('./resultadosControllerService');

module.exports.getResultados = function getResultados(req, res, next) {
  varresultadosController.getResultados(req.swagger.params, res, next);
};