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
require('dotenv').config();

const dbConnect = require('./db');
const server = require('./server.js');

// Global utility constants
const PORT = process.env.PORT || 3000;

dbConnect().then(
    () => {
        server.listen(PORT, () => {
            console.log('Listening on port ' + PORT);
        })
    },
    err => {
        console.log("Connection error: " + err);
    }
)
