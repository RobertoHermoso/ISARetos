'use strict'

module.exports.getJugadas = function getJugadas(req, res, next) {
  const fs = require('fs');
  let rowdata = fs.readFileSync('jsonFiles/poker.json', 'utf8')
  let json = JSON.parse(rowdata)
  res.send(
    json
  );
};

module.exports.addJugadas = function addJugadas(req, res, next) {
  const fs = require('fs');
  var rowdata = fs.readFileSync('jsonFiles/poker.json', 'utf8')
  var json = JSON.parse(rowdata)
  var a =  req.undefined.originalValue;
  var aux = json['partida']
  aux.push(a)

  json['partida'] = aux


  var results = JSON.stringify(json)
  fs.writeFileSync('jsonFiles/poker.json', results, 'utf8')

  rowdata = fs.readFileSync('jsonFiles/poker.json', 'utf8')
  json = JSON.parse(rowdata)

  res.send({
    json
  });
};