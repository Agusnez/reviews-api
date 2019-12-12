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
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
var app = express();

// Global utility constants
const PORT = process.env.PORT || 3000;
const BASE_URL = '/v1';

// Configuration 
mongoose.connect(`mongodb+srv://custom:${process.env.MONGO_PASS}@reviews-vngeb.gcp.mongodb.net/${process.env.MONGO_ENV}?retryWrites=true&w=majority`
, { useUnifiedTopology: true });
app.use(bodyParser.json());

const Review = mongoose.model('Review', {
     imdbId: String,
     rating: Number,
     user: String,
     content: String,
     created: Date,
     impressions: {
        likes: Number,
        dislike: Number,
        spam: Number
     }
    });

app.get('/', (req, res) => {
    res.send('Hola mundo!');
})

app.post(BASE_URL + '/reviews', (req, res) => {
    console.log(new Date() + " - POST /reviews by " + req.ip);

    var imdbId = req.body.imdbId;
    var name= req.body.user;
    var rating = req.body.rating;

    const review = new Review({
     imdbId: imdbId,
     rating: rating,
     user: name,
     created: new Date(),
     impressions: {
        likes: 0,
        dislike: 0,
        spam: 0
     }
    });
    review.save().then(() => {
        console.log(new Date() + " - NEW REVIEW ADDED BY " + req.ip);
        res.sendStatus(200);
    });
});


app.get(BASE_URL+'/reviews',(req,res)=>{
    // Sin tener en cuenta los parametro de entrada (Las 5 reviews más actuales)
    Review.find({},{'_id': 0},{ sort:'-created'}, (err,reviews)=>{
        return res.send(reviews);
    }).limit(5);
})



app.listen(PORT, () => {
    console.log('Listening on port ' + PORT);
})


