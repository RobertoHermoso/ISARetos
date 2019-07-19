var Promise = require("bluebird");
const https = require('https');

//Aquí se introduce lo que hemos pasado por consola
let org = 'isa-group'

let user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36'
             + ' OPR/62.0.3331.81'


var information = new Promise(
    function(resolve,reject){


let options = {
    host: 'api.github.com',
    path: '/orgs/' + org,
    method: 'GET',
    headers: { 'user-agent': user_agent}
}

let request = https.request(options , (response) => {
    let body = '';
    response.on('data', (out) => {
        body += out;
    });

    response.on('end', (out) => {
        let json = JSON.parse(body);
        resolve(json)
    });

    
});
    request.on('error', (e)=> {
        var reason = new Error("The url " + json.url +  " is invalid") //Tratamiento de errores
        reject(reason)
});


request.end();

    }
)


var repositories = function(json){
    return   new Promise(
        function(resolve,reject){
            
            let options = {
                host: "api.github.com",
                path: '/orgs/' + org + "/" + "repos",
                method: 'GET',
                headers: { 'user-agent': user_agent}
            }

            let request = https.request(options , (response) => {
                let body = '';
                response.on('data', (out) => {
                    body += out;
                });
            
                response.on('end', (out) => {
                    var repos = JSON.parse(body);
                    json.repos = repos
                    resolve(json)
                });
            
                
            });
                request.on('error', (e)=> {
                    var reason = new Error("The url " + json.url +  " is invalid") //Tratamiento de errores
                    reject(reason)
            });
            
            
            request.end();


        }
    )
}

var execute = function(){
    information.then(repositories).then(showInf).then(function (fulfilled){ //Lo que esta debajo se seguirá ejecutando asincronamente
    }).catch(function(error){
        console.log(error.message)
    })
}

var showInf = function(json){
    var message = "Nombre: " + json.name + "\n" + "Descripción: " + json.description + "\n" + "Enlace: " + json.blog + "\n\n" +
     "Repositorios: \n\n" ;
    console.log(message)

    var repos = json.repos
    repos.forEach(repositorie => {
        console.log(" - " + repositorie.name + "\n")
        
    });
}


execute()