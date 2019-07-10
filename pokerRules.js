const fs = require('fs');
var Promise = require("bluebird");

let rowdata = fs.readFileSync('poker.json', 'utf8')
let json = JSON.parse(rowdata)



var checkCards= new Promise(
    function(resolve,reject){
        i = 1
        json.partida.forEach(element => {
            auxPair = 0
            auxNumPaired = 0
            i++
            element.jugadas.forEach(jugadores => {
                pair = false
                doublePair = false
                var cartas = jugadores.cartas
                cartas.forEach(cardPicked => {
                    auxPair = 0
                    found = false
                    cartas.forEach(cards => {
                        //Pareja
                        if(cards!==cardPicked){
                        if(cards.valor === cardPicked.valor){
                            auxPair++
                        }
                        if(auxPair == 1 && !found){
                            auxNumPaired += 1
                            pair = true
                            found = true
                        }
    
                        //Doble pareja
                        if(auxNumPaired==3 && pair){
                            doublePair = true
                        }
                    }
                    })
                });
                jugadores.PUNTOS = 0

                //Pareja
                if(pair){
                    jugadores.PUNTOS = 2
                }
                //Doble pareja
                if(pair && doublePair){
                    jugadores.PUNTOS = 4
                }

                //Para comprobar que nadie tiene mas de 5 cartas
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


var pickAllCardsExcept = function(card, cards){
    var res = []
    i =0
        cards.array.forEach(element => {
            if(element!=card){
                res[i]=element
                i++
            }
        });
        return res
}

var playGame = function(){
    checkCards.then(showOff(json)).then(function (fulflilled){   
    }).catch(function(error){
        console.log(error.message)
    })
}

playGame()