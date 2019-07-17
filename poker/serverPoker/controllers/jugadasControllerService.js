'use strict'

module.exports.getJugadas = function getJugadas(req, res, next) {
  const fs = require('fs');
  let rowdata = fs.readFileSync('controllers/poker.json', 'utf8')
  let json = JSON.parse(rowdata)
  res.send(
    json
  );
};

module.exports.addJugadas = function addJugadas(req, res, next) {
  res.send({
    message: 'This is the mockup controller for addJugadas'
  });
};