const fs = require('fs');

let rowdata = fs.readFileSync('poker.json')
let jugadas = JSON.parse(rowdata)
console.log(jugadas)