'use strict'

var varjugadasController = require('./jugadasControllerService');

module.exports.getJugadas = function getJugadas(req, res, next) {
  varjugadasController.getJugadas(req.swagger.params, res, next);
};

module.exports.addJugadas = function addJugadas(req, res, next) {
  varjugadasController.addJugadas(req.swagger.params, res, next);
};