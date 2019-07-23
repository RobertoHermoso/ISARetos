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


var repositories = function rep(json){
    return   new Promise(
        function(resolve,reject){
            console.log(json)
            var resp = []
            var page = json.page

            console.log(page)
            //Para la primera iteración definimos la inicial
            if(page==undefined){
                page = 0
            }

            let options = {
                host: host,
                path: '/orgs/' + org + "/" + "repos?page:"+ page,
                method: 'GET',
                per_page: limit,
                headers: { 'user-agent': user_agent,
                'client_id' : 'RobertoHermoso',
                'Authorization' : "Bearer " + token}
            }

            //Si no es la primera iteración vamos decreciendo
            if(json.page!=undefined){
                json.page = json.page - 1;
            }

            let request = https.request(options , (response) => {
                let body = '';
                response.on('data', (out) => {
                    body += out;
                    resp.push(out);
                    var links = response.headers.link.split(',');
                    var pages = links[links.length-1].match(/page=(\d+).*$/)[1];

                    //Para la primera iteacion cogemos el número máximo de páginas
                    if(json.page == undefined){
                    json.page = pages
                        }                
                    });
            
                response.on('end', (out) => {
                    var repos = JSON.parse(body);
                    var list = []
                    list.push(json.repos)
                    list.push(repos);
                    json.repos = list;
                    resolve(json)
                });
            
                
            });
                request.on('error', (e)=> {
                    var reason = new Error("The url " + json.url +  " is invalid") //Tratamiento de errores
                    reject(reason)
            });
            
            
            request.end();
            if(json.page != 0 ){
                console.log('pataa')
                rep()
            }

        }

    )

}

function getRepoInfo(repository){
        
    var i = 0;

    console.log("Debug: " +  repository)
    let options = {
        host: host,
        path: '/repos/' + org + "/" + repository.name + "/commits",
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
            console.log(body.length)
            json = JSON.parse(body);
            console.log(json.length)
            var i = json.length
            console.log("-"  +repository.name )
            console.log("   Numero de Issues abiertas : " + repository.open_issues_count)
            if(i == undefined){
                i = 0
            }
            console.log("   Número de Commits: " + i + "\n")
        });
    
        
    });
        request.on('error', (e)=> {
            var message = new Error("Error getting the issues from " +repository) //Tratamiento de errores
            console.log(message)
    });
    request.end();   
}

var showInf = function(json){
    var message = "Nombre: " + json.name + "\n" + "Descripción: " + json.description + "\n" + "Enlace: " + json.blog + "\n\n" +
    "Repositorios: \n" ;
    console.log(message)

    var repos = json.repos
    console.log(repos.length)
    //repos.forEach(element => {
    //    getRepoInfo(element)
    //});

        
}


var inicial = function (json){
    return   new Promise(
        function(resolve){
            json.repos  = []
            json.page = 0
            resolve(json)

        }
    )
}




var execute = function(){
    information.then(inicial).then(repositories).then(showInf).then(function (fulfilled){ //Lo que esta debajo se seguirá ejecutando asincronamente
    }).catch(function(error){
        console.log(error.message)
    })
}

execute()