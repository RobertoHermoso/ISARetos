var Promise = require("bluebird");
const https = require('https');
const fs = require('fs');

//Aquí se introduce lo que hemos pasado por consola
let org = 'isa-group'

let user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.100 Safari/537.36 OPR/62.0.3331.81'

let token = "cd6b55ad950a81fcb255caa034158cf9a3154fa6"

let host = "api.github.com"


var mapRepositories = new Map()

//GENERAL INFORMATION

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

//REPOSITORIES INFORMATION

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

//REPOSITORY's COMMIT NUMBER 

var getFirstRepoInfo = function(repository){
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
            repository.pagesMax = pagesMax

            }else
                {
            repository.pagesMax = 1
            }
        });


    
        response.on('end', (out) => {
            json = JSON.parse(body);
            var i = json.length
            repository.commitsNumber = i
            resolve(repository)
        });
    
        
    });
        request.on('error', (e)=> {
            var message = new Error("Error getting the issues from " +repository) //Tratamiento de errores
            console.log(message)
    });
    request.end();   

    });

}

var getRepoInfo = function(repository){
    return   new Promise(
        function(resolve,reject){
    

    var i = 0;

    let options = {
        host: host,
        path: '/repos/' + org + "/" + repository.name + "/commits?page=" + repository.pagesMax,
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
            json = JSON.parse(body);
            var i = json.length
            //Obtenemos los datos de la última página
            var res = i + repository.commitsNumber

            //Si tiene mas de dos paginas, sumamos el resto de paginas multiplicadas por 30 (El número de elementos por paginas)
            if(repository.pagesMax>2){
                res+= (repository.pagesMax - 2) * 30
            }
            repository.commitsNumber = res
            resolve(repository)
        });
    
        
    });
        request.on('error', (e)=> {
            var message = new Error("Error getting the issues from " +repository) //Tratamiento de errores
            console.log(message)
    });
    request.end();   

    });

}

var showReposInfo = function(repository, ){
        return new Promise(
            function(resolve, reject){

    
    console.log( " • " + repository.name )
    console.log( "  ◦ Numero de Issues Abiertas:    " + repository.open_issues_count)
    console.log( "  ◦ Número de Commits:            " + repository.commitsNumber)
    console.log("\n")
    });
} 


var showInf =  function(json){
    return   new Promise(
        function(resolve,reject){
    //Mostramos la información general
    var message = "Nombre: " + json.name + "\n" + "Descripción: " + json.description + "\n" + "Enlace: " + json.blog + "\n\n" +
    "Repositorios: \n" ;
    console.log(message)

    var repos = json.repos

    

    //Llamamos a estas promesas para obtener el número de commits principalmente
    repos.forEach(element => {
        //Ponemos delay para que de tiempo a calcular el resto de datos
        getFirstRepoInfo(element).then(getRepoInfo).delay(2000).then(showReposInfo)
    });

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

