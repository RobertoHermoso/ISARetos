const fs = require('fs');
var Promise = require("bluebird");

let rowdata = fs.readFileSync('poker.json', 'utf8')
let json = JSON.parse(rowdata)



var checkCards= new Promise(
    function(resolve,reject){
        i = 1
        json.partida.forEach(element => {
            i++
            pair = false
            element.jugadas.forEach(jugadores => {
                jugadores.PUNTOS = 0
                var cartas = jugadores.cartas
                cartas.forEach(cardPicked => {
                    auxPair = 0
                    cartas.forEach(cards => {
                        //Pareja
                        if(cards.valor == cardPicked.valor){
                            auxPair += 1
                        }
                        if(auxPair == 2){
                            pair = true
                        }
                    })
                });
                j=0
                //Pareja
                if(pair){
                    jugadores.PUNTOS += 2
                }
                if(cartas.length != 5){
                    var reason = new Error("El jugador " + jugadores.jugador + " está haciendo trampas, tiene " + cartas.length + " cartas "
                    + " en la ronda " + i)
                    reject(reason)
                }
                resolve(jugadores)
            });
        
        });

    }
)


var showOff = function(json, winner){
    console.log("Partidas: ")
    i = 1
    json.partida.forEach(element => {
        console.log("Jugada número: " + i +  "\n")
        i++
        element.jugadas.forEach(jugadores => {
            console.log(" - El jugador " + jugadores.jugador + " apuesta " + jugadores.apuesta + "\n")
            console.log("Con las cartas: ")
            console.log(jugadores.cartas)
            console.log("Lleva : " + jugadores.PUNTOS + " puntos ")
        });

            if(winner != null){
            var message = "El jugador " + winner.jugador + " ha ganado " + winner.puntos + " puntos ";
            console.log(message)
            }
    });
}


var playGame = function(){
    checkCards.then(showOff(json)).then(function (fulflilled){   
    }).catch(function(error){
        console.log(error.message)
    })
}

playGame()