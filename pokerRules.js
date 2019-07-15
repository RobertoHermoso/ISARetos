const fs = require('fs');
var Promise = require("bluebird");

let rowdata = fs.readFileSync('poker.json', 'utf8')
let json = JSON.parse(rowdata)



var checkCards= new Promise(
    function(resolve,reject){
        partida = 1
        var results = []
        json.partida.forEach(element => {
            //Para comprobar si hay una pareja
            auxPair = 0
            //Para contar el número de parejas, se usa para comprobar la Doble Pareja
            auxNumPaired = 0
            partida++
            rigged = false
            var cards = []
            element.jugadas.forEach(jugadores => {

                pair =          false               //Par
                doublePair =    false               //Doble par
                trio =          false               //Trio
                escalera =      false               //Escalera
                color =         false               //Color
                full  =         false               //Full
                poker =         false               //Poker

                var cartas = jugadores.cartas
                var j = 0
                var auxEscalera = 0
                var auxColor = 0
                var auxPoker = 0

                cartas.forEach(cardPicked => {
                    auxPair = 0
                    auxTrio = 0
                    if(!checkIfCardsExistsIn(cardPicked, cards)){
                        cards.push(cardPicked)
                    } else{
                        rigged = true
                    }

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
                        if(cartas[j].valor==cartas[j-1].valor)
                        auxPoker++
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
                            var pairValue = cardPicked.valor
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
                            var trioValue = cardPicked.valor
                        }
                        //Full
                        if(trio && pair){
                            //Comrpobamos que no ha contado como par las cartas que compone el trio
                            if(trioValue=!pairValue){
                                full = true
                            }
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
                    //Poker
                    if(auxPoker == 3){
                        poker = true
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
                //Full
                if(full){
                    jugadores.PUNTOS = 7
                }
                //Poker
                if(poker){
                    jugadores.PUNTOS = 8
                }
                //Escalera de Color
                if(color && escalera){
                    jugadores.PUNTOS = 9
                }


                resolve(jugadores)
            });


            //Comprobamos si la partida esta amañada
            if(rigged){
                x = partida-1
                var res = "La partida " + x  + " está amañada"
            }else{
                var res = pickWinner(element)
            }

            results.push(res)
        
        });
        json.results = results;
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
    console.log(json.results)
}


function pickWinner(partida){
    var res = ""
    var winner = null
    var boteFinal = 0
    var aux = null
    partida.jugadas.forEach(element => {
        if(aux===null){
            aux = element.PUNTOS
            winner = element
        }
        else if(element.PUNTOS>aux){
            aux = element.PUNTOS
            winner = element
        }
        else if (element.PUNTOS===aux){
            winner = tiePlayers(winner, element)
        }
        boteFinal += element.apuesta
    });
    boteFinal += partida.bote

    res = winner.jugador + " ha ganado " + boteFinal
    if(winner ==="empate"){
        res = "Iguales"
    }
    return res
}

function tiePlayers(player1, player2){
    var highest1 = 0;
    var highest2 = 0;
    console.log(player1.cartas[1])
    for(i=0; i<5; i++){
        console.log(cardValue(player1.cartas[i]))
        console.log(cardValue(player2.cartas[i]))
        if(highest1<cardValue(player1.cartas[i])){
            highest1= cardValue(player1.cartas[i])
        }
        if(highest2<cardValue(player2.cartas[i])){

            highest2= cardValue(player2.cartas[i])
        }

    }
    if(highest1>highest2){
        var res = player1
    }else if (highest1<highest2){
        var res= player2
    }else{
        var res = "empate"
    }
    return res;
}

function cardValue(card){
    var map = {1 : 1, 2: 2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 9:9, 10:10, 'J':11, 'Q':12, 'K':13, 'A': 14}
    return map[card.valor]
}

function checkIfCardsExistsIn(card, cards){
    var res = false
    cards.forEach(element => {
        if(element.palo === card.palo && element.valor === card.valor){
            res = true
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