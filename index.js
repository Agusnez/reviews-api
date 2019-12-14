/*
 * index.js 
 * 
 * Reviews API Microservice
 * 
 * Authors: 
 * Carlos Capitán
 * Agustín Núñez
 * 
 * Universidad de Sevilla 
 * 2019-20
 * 
 */

// Load environment variables 
require('dotenv').config()

// App requirements
const express = require("express");
const bodyParser = require("body-parser");
var app = express();

// Our own routes
var reviews = require("./routes/reviews.js");

// Global utility constants
const PORT = process.env.PORT || 3000;
const BASE_URL = '/v1';

// Configuration 
app.use(bodyParser.json());

app.use(BASE_URL + '/reviews', reviews);

app.get('/', (req, res) => {
    res.send('Hola mundo!');
})

app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
})
