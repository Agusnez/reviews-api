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
const cors = require('cors');

const app = express();

// Our own routes requirement
const reviews = require("./routes/reviews.js");
const impressions = require("./routes/impressions.js");
const ratings = require("./routes/ratings.js");


const BASE_URL = '/v1';

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Our own routes declaration
app.use(BASE_URL + '/reviews', reviews);
app.use(BASE_URL + '/impressions', impressions);
app.use(BASE_URL + '/ratings', ratings);

app.get('/', (req, res) => {
    res.send('Hola mundo!');
})

module.exports = app;