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

const Review = require('../models/Review');
const Impression = require('../models/Impression');

const auth = require('../auxiliar/authorizationResource');

router.get('/', async (req,res) => {
    console.log(new Date() + " - GET " + req.originalUrl + " by " + req.ip);

    var imdbIdQuery = req.query.imdbId || false;
    var userQuery = req.query.user || false;
    var skip = parseInt(req.query.skip) || 0;
    var limit = parseInt(req.query.limit) || 5;
    var authorizationToken = req.headers.authorization;
    var username = undefined;

    //We dinamically build the query object based on the query params in the request
    var queryObject = {};

    if(imdbIdQuery) {
        queryObject['imdbId'] = imdbIdQuery;
    }

    if(userQuery) {
        queryObject['user'] = userQuery;
    }

    if (authorizationToken) {
        let bearerToken = authorizationToken.split(' ')[1];
        username = await auth.getUsername(bearerToken).catch((err) => {username = undefined});
    }    

    const retrievedReviews = await Review.find(queryObject, null, {sort:'-created', skip: skip, limit: limit});

    const count = await Review.countDocuments(queryObject);
    
    let i = 1;

    const clean = await Promise.all(retrievedReviews.map(async (rawReview) => {
            const review = rawReview.cleanup();
            review['index'] = i + skip;
            review['total'] = count;

            if (username) {
                const impression = await Impression.findOne({user: username.login, review: review.id});
                if (impression) {
                    review[impression.value] = true;
                }
            }  
            i++;
            
            return review;
            
        }));

        res.send(clean);


});

router.post('/', (req, res) => {
    console.log(new Date() + " - POST /reviews by " + req.ip);

    var imdbId = req.body.imdbId;
    var name = req.body.user;
    var rating = req.body.rating || 3;

    const review = new Review({
     imdbId: imdbId,
     rating: rating,
     user: name,
     created: new Date(),
     impressions: {
        likes: 0,
        dislikes: 0,
        spam: 0
     }
    });

    review.save().then(() => {
        console.log(new Date() + " - NEW REVIEW ADDED BY " + req.ip);
        res.sendStatus(200);
    }).catch((err) => {
        if (err.name == 'ValidationError') {
            const body = {};
            body.message = err.message;
            body.json = err.errors;
            res.status(400).send(body);
        } else {
            res.sendStatus(500);
        }
    });
});



router.delete('/', (req, res) => {
   

    //The film's ID of the query is saved in ReviewId
    var reviewId=req.params.imdbId;

    //Now we execute the delete operation
    reviews.deleteOne({imdbId:reviewId}, (err)=>{
        
        if(!err){ //if the imdbId exists, the review will be deleted

            console.log("The review has been deleted")
            return res.sendStatus(201);

        }else{ //if the imdbId does not exist, an error message will be sent.

            console.log("The review doesn't exist");
            return res.sendStatus(400);
        }

     });

});

module.exports = router;
