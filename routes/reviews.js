/*
 *  reviews.js
 *  
 *  Reviews CRUD
 *
 *  Universidad de Sevilla 
 *  2019-20
 */

var express = require('express');
var router = express.Router();

var db = require('../db.js');

const Review = db.model('Review', {
    imdbId: String,
    rating: Number,
    user: String,
    title: String,
    content: String,
    created: Date,
    impressions: {
       likes: Number,
       dislike: Number,
       spam: Number
    }
   });

router.get('/', async (req,res) => {
    console.log(new Date() + " - GET " + req.originalUrl + " by " + req.ip);

    var imdbIdQuery = req.query.imdbId;
    var userQuery = req.query.user;
    var offset = parseInt(req.query.skip) || 0;
    var limit = parseInt(req.query.limit) || 5;

    //We dinamically build the query object based on the query params in the request
    var queryObject = {};

    if(imdbIdQuery) {
        queryObject['imdbId'] = imdbIdQuery;
    }

    if(userQuery) {
        queryObject['user'] = userQuery;
    }

    var retrievedReviews = [];
    retrievedReviews = await Review.find(queryObject,{'__v': 0},{sort:'-created', skip: offset}).limit(limit);
    
    // We will be manipulating the retrieved reviews to add interesting fields to each review
    var manipulatedReviews = [];
    retrievedReviews.forEach(review => {
        var newReview = review.toObject();

        //TODO: Change header("User") to proper token validation
        if(review.user == req.header("User")) {
            newReview['yours'] = true;
        }

        //TODO: Check if the user has given any impression on this review (Like Twitter)

        manipulatedReviews.push(newReview);
    });
    
    const totalReviews = await Review.countDocuments(queryObject);

    manipulatedReviews[manipulatedReviews.length] = {
        "totalObjects":totalReviews
    };

    return res.send(manipulatedReviews);
});

router.post('/', (req, res) => {
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

module.exports = router;