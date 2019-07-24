var Promise = require("bluebird");
const https = require('https');


//Aquí se introduce lo que hemos pasado por consola
let org = 'isa-group'

let user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36 OPR/62.0.3331.81'

let token = "cd6b55ad950a81fcb255caa034158cf9a3154fa6"

let host = "api.github.com"

let limit = 100

var mapRepositories = new Map()

var information = new Promise(
    function(resolve,reject){


let options = {
    host: host,
    path: '/orgs/' + org,
    method: 'GET',
    headers: {  'user-agent': user_agent,
                'client_id' : 'RobertoHermoso',
                'Authorization' : "Bearer " + token}
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


var firstRepositories = function(json){
    return   new Promise(
        function(resolve,reject){

            let options = {
                host: host,
                path: '/orgs/' + org + "/" + "repos?page=1",
                method: 'GET',
                headers: { 'user-agent': user_agent,
                'client_id' : 'RobertoHermoso',
                'Authorization' : "Bearer " + token}
            }


            let request = https.request(options , (response) => {
                let body = '';
                response.on('data', (out) => {
                    body += out;
                    var links = response.headers.link.split(',');
                    json.pagesMax = links[links.length-1].match(/page=(\d+).*$/)[1];

            
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

var repositories = function(json){
    return   new Promise(
        function(resolve,reject){

            var limit = json.pagesMax

            for (let index = 2; index <= limit; index++) {

            let options = {
                host: host,
                path: '/orgs/' + org + "/" + "repos?page="+index,
                method: 'GET',
                headers: { 'user-agent': user_agent,
                'client_id' : 'RobertoHermoso',
                'Authorization' : "Bearer " + token}
            }


            let request = https.request(options , (response) => {
                let body = '';
                response.on('data', (out) => {
                    body += out;
                    });
            
                response.on('end', (out) => {
                    var repos = JSON.parse(body);
                    var currentRepos = json.repos
                    //Agregamos los repositorios a los que ya había 
                    var res = currentRepos.concat(repos)
                    json.repos = res
                    resolve(json)
                });
            
                
            });
                request.on('error', (e)=> {
                    var reason = new Error("The url " + json.url +  " is invalid") //Tratamiento de errores
                    reject(reason)
            });
            
            
            request.end();

            }      
        }
    )

}


var getFirstRepoInfo = function(json ,repository, repoInf, repoPagesMax){
    return   new Promise(
        function(resolve,reject){
    

    var i = 0;

    let options = {
        host: host,
        path: '/repos/' + org + "/" + repository.name + "/commits?page=1",
        method: 'GET',
        headers: { 'user-agent': user_agent,
        'client_id' : 'RobertoHermoso',
        'Authorization' : "Bearer " + token}
    }

    let request = https.request(options , (response) => {
        let body = '';
        response.on('data', (out) => {
            body += out;

            if(response.headers.link != undefined){

            var links = response.headers.link.split(',')

            var pagesMax = links[links.length-1].match(/page=(\d+).*$/)[1];
            repoPagesMax.set(repository.name, pagesMax)

            }else
                {
            repoPagesMax.set(repository.name, 1)
            }
            json.repoPagesMax = repoPagesMax
        });


    
        response.on('end', (out) => {
            json = JSON.parse(body);
            var i = json.length
            repoInf.set(repository.name, i);
            json.repoInf = repoInf
            resolve(json)
        });
    
        
    });
        request.on('error', (e)=> {
            var message = new Error("Error getting the issues from " +repository) //Tratamiento de errores
            console.log(message)
    });
    request.end();   

    });

}

var showInf =  function(json){
    return   new Promise(
        function(resolve,reject){
    var message = "Nombre: " + json.name + "\n" + "Descripción: " + json.description + "\n" + "Enlace: " + json.blog + "\n\n" +
    "Repositorios: \n" ;
    console.log(message)

    var repos = json.repos
    console.log(repos.length)

    var repoInf = new Map();
    var repoPagesMax = new Map();   

    repos.forEach(element => {
        json.then(getFirstRepoInfo(element, repoInf, repoPagesMax)).then(
            console.log(json.repoPagesMax)

        )
    });

    console.log(repoInf)
        });
        
}





var execute = function(){

    //El delay es para que de tiempo a calcular todo 

    information.then(firstRepositories).then(repositories).then().delay(2000).then(showInf).then(function (fulfilled){ //Lo que esta debajo se seguirá ejecutando asincronamente
    }).catch(function(error){
        console.log(error.message)
    })

}

execute()

