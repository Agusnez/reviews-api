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
let app = express();

// Our own routes requirement
let reviews = require("./routes/reviews.js");
let impressions = require("./routes/impressions.js");
let ratings = require("./routes/ratings.js");


const BASE_URL = '/v1';

// Middleware
app.use(bodyParser.json());

// Our own routes declaration
app.use(BASE_URL + '/reviews', reviews);
app.use(BASE_URL + '/impressions', impressions);
app.use(BASE_URL + '/ratings', ratings);

app.get('/', (req, res) => {
    res.send('Hola mundo!');
})

module.exports = app;