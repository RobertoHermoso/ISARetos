const fs = require('fs');
var Promise = require("bluebird");

let rowdata = fs.readFileSync('poker.json', 'utf8')
let json = JSON.parse(rowdata)



var checkCards= new Promise(
    function(resolve,reject){
        i = 1
        json.partida.forEach(element => {
            //Para comprobar si hay una pareja
            auxPair = 0
            //Para contar el número de parejas, se usa para comprobar la Doble Pareja
            auxNumPaired = 0
            i++
            element.jugadas.forEach(jugadores => {

                pair =          false               //Par
                doublePair =    false               //Doble par
                trio =          false               //Trio
                escalera =      false               //Escalera
                color =         false               //Color

                var cartas = jugadores.cartas
                var j = 0
                var auxEscalera = 0
                var auxColor = 0
                cartas.forEach(cardPicked => {
                    auxPair = 0
                    auxTrio = 0


                    //variable auxiliares para la escalera
                    var valorSumado = cartas[j].valor
                    valorSumado++
                    if(j<4){
                        //Comprobamos si el valor de la carta actual +1 es igual al valor del siguiente
                        //TODO: Recuerda contar con las que no son numericas 
                        if(valorSumado == cartas[j+1].valor){
                            auxEscalera++
                        }
                    }
                    //Comprobamos a partir de la segunda
                    if(j>0){
                        if(cartas[j].palo==cartas[j-1].palo){
                        auxColor++
                        }
                    }

                    j++

                    //Variable auxiliar para comprobar que en esta iteración se ha encontrado una pareja
                    found = false
                    cartas.forEach(cards => {
                        //Pareja
                        if(cards!==cardPicked){ //Con esta sentencia evitamos que se compare conismo mismo en la iteración
                        if(cards.valor === cardPicked.valor){
                            auxPair++
                            auxTrio++
                        }
                        if(auxPair == 1 && !found){
                            auxNumPaired += 1
                            pair = true
                            found = true
                        }
                        //Doble pareja, escojemos 3 porque el algoritmo puede contar 2 veces la misma pareja (en distinto orden)
                        if(auxNumPaired==3 && pair){
                            doublePair = true
                        }

                        //Trio
                        if(auxTrio==2){
                            trio = true
                        }

                    }
                    })

                    //Escalera
                    if(auxEscalera == 4){
                        escalera = true
                    }
                    //Color
                    if(auxColor == 4){
                        color = true
                    }
                });
                jugadores.PUNTOS = 0

                //Pareja
                if(pair){
                    jugadores.PUNTOS = 2
                }
                //Doble pareja
                if(pair && doublePair){
                    jugadores.PUNTOS = 3
                }
                //Trio
                if(trio){
                    jugadores.PUNTOS = 4
                }
                 //Escalera
                 if(escalera){
                    jugadores.PUNTOS = 5
                }
                //Color
                if(color){
                    jugadores.PUNTOS = 6
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