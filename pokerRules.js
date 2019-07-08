const fs = require('fs');

let rowdata = fs.readFileSync('poker.json', 'utf8')
let json = JSON.parse(rowdata)
console.log("Partidas: ")
i = 1
json.partida.forEach(element => {
    console.log("Jugada número: " + i +  "\n")
    i++
    element.jugadas.forEach(jugadores => {
        console.log(" - El jugador " + jugadores.jugador + " apuesta " + jugadores.apuesta + "\n")
        console.log("Con las cartas: ")
        console.log(jugadores.cartas)
    });
 
});
