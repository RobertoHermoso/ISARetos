var request = require('request')

var isMomHappy = true;

var willIGetNewPhone = new Promise(
    function(resolve,reject){
        if(isMomHappy){
            var phone= {
                brand: "Samsung",
                color: "blue",
                usd:    "700"
            };
            resolve(phone)
        }
        else{
            var reason = new Error("Mom is not happy, so you can't buy a new phone") //Tratamiento de errores, incumplimento de la regla
            reject(reason)
        }
    }
)

//Comprobacion de la regla o promesa

var askMom = function(){
    willIGetNewPhone.then(getEurPrice).then(showOff).then(function (fulfilled){ //Lo que esta debajo se seguirá ejecutando asincronamente
    }).catch(function(error){
        console.log(error.message)
    })
}

var showOff = function(phone){
    var message = "I will buy a new phone, brand " + phone.brand + ", color "+ phone.color + " and that it costs " + phone.usd + " $ " 
    + " or " + phone.EUR + "€";
    console.log(message)
}


//Forma de obtener datos desde fuera
var getEurPrice = function(phone){
    return new Promise(
        function(resolve,reject){
            request("https://api.exchangeratesapi.io/latest?base=USD", {json: true},
            function(err, res, body){
                if(err){
                    return console.log(err);
                }
                phone.EUR = phone.usd*body.rates.EUR
                resolve(phone)
            })
        }
    )
}

askMom()