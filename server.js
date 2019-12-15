/* server.js 
* 
* Reviews API Microservice
* Server configuration
* 
* Authors: 
* Carlos Capitán
* Agustín Núñez
* 
* Universidad de Sevilla 
* 2019-20
* 
*/

const express = require("express");
const bodyParser = require("body-parser");
var app = express();

// Our own routes requirement
var reviews = require("./routes/reviews.js");

const BASE_URL = '/v1';

// Middleware
app.use(bodyParser.json());

// Our own routes declaration
app.use(BASE_URL + '/reviews', reviews);


app.get('/', (req, res) => {
    res.send('Hola mundo!');
})

module.exports = app;