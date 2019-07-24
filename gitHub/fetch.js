const fs = require('fs');

var mapa = new Map();

mapa.set('primero', 1)
mapa.set('segundo',2)

console.log(mapa)

var results = JSON.stringify(mapa)
fs.writeFileSync('pruebaDeMapa.json', results, 'utf8');


fs.rmdirSync('prueba')