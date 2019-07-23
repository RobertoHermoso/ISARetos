const fetch = require('node-fetch');


fetch('https://api.github.com/users/RobertoHermoso')
    .then(res => res.json())
    .then(json => console.log(json));


