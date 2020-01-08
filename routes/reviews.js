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

router.get('/', async (req, res) => {
    console.log(new Date() + " - GET " + req.originalUrl + " by " + req.ip);

    var imdbIdQuery = req.query.imdbId || false;
    var userQuery = req.query.user || false;
    var skip = parseInt(req.query.skip) || 0;
    var limit = parseInt(req.query.limit) || 5;
    var authorizationToken = req.headers.authorization;
    var username = undefined;

    //We dinamically build the query object based on the query params in the request
    var queryObject = {};

    if (imdbIdQuery) {
        queryObject['imdbId'] = imdbIdQuery;
    }

    if (userQuery) {
        queryObject['user'] = userQuery;
    }

    if (authorizationToken) {
        let bearerToken = authorizationToken.split(' ')[1];
        username = await auth.getUsername(bearerToken).catch((err) => { username = undefined });
    }

    const retrievedReviews = await Review.find(queryObject, null, { sort: '-created', skip: skip, limit: limit });

    const count = await Review.countDocuments(queryObject);

    let i = 1;

    const clean = await Promise.all(retrievedReviews.map(async (rawReview) => {
        const review = rawReview.cleanup();
        review['index'] = i + skip;
        review['total'] = count;

        if (username) {
            const impression = await Impression.findOne({ user: username.login, review: review.id });
            if (impression) {
                review[impression.value] = true;
            }
        }
        i++;

        return review;

    }));

    res.send(clean);


});

router.post('/', async (req, res) => {
    console.log(new Date() + " - POST /reviews by " + req.ip);
  
    let imdbId = req.body.imdbId;
    
    let rating = req.body.rating;
    let title = req.body.title;
    let content = req.body.content;

    let authorizationToken = req.headers.authorization;
    let user;

    if (authorizationToken) {
        let bearerToken = authorizationToken.split(' ')[1];
        let userData = await auth.getUsername(bearerToken).catch((err) => {user = undefined});
        if(userData) {
            user = userData.login;
        }
    }

    const review = new Review({
     imdbId,
     rating,
     title,
     content,
     user,
     created: new Date(),
     impressions: {
        likes: 0,
        dislikes: 0,
        spam: 0
     }

    });

    if (await Review.countDocuments({user, imdbId}) == 0) {
        review.save().then(() => {
            console.log(new Date() + " - NEW REVIEW ADDED BY " + req.ip);
            res.status(200).send('Review sucessfully saved!');
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
    } else {
        res.status(400).send('You cannot write a review for the same imdbID.')
    }
});

router.delete('/', async (req, res) => {

    //The film's ID of the query is saved in ReviewId
    var reviewId = req.body.id;

    var authorizationToken = req.headers.authorization;

    let username = '';

    //The token is saved
    if (authorizationToken) {
        let bearerToken = authorizationToken.split(" ")[1];
        let userData = await auth.getUsername(bearerToken).catch((err) => {username = undefined});
        if(userData) {
            username = userData.login;
        }
    }


    Review.findById(reviewId).then((review) => {
        var user = review.user;
        //if the id exists, the user will be verified
      
        if (user == username) {//if the user is validated, the review will be deleted

            Review.deleteOne({_id: review.id }).then(() => {

                console.log("The review has been deleted")
                return res.sendStatus(200);
            });

        } else { //if the user is not allowed to delete the review, an error message will appear
            console.log("Don't have access to that review");
            return res.sendStatus(401);
        }
    }).catch((err) => {//if the id does not exist, an error message will be sent.
        return res.status(400).send("Invalid input,object invalid");
    });
});

router.put("/", async (req, res) => {

    var reviewId = req.body.id;
    var authorizationToken = req.headers.authorization;
    let bearerToken = authorizationToken.split(' ')[1];
    let username = await auth.getUsername(bearerToken);

    Review.findById(reviewId).then((review) => {

      //if the id exists, the user will be verified
      //first we get the id user who made the review
      var user = review.user;

      //that user will be compared with the user of the token who wants to modify the review

       if (user == username.login) {//if the user is validated, the review will be deleted

            //now that we know the review imdbId, we can filter it, and the option $set:req.body allows us to update 
            //all the fields that are present in the body of the request
            Review.updateOne({_id: review.id }, { $set: req.body }).then(() => {
                return res.status(200).send("The review has been updated");
            });

        } else { //if the user is not allowed to delete the review, an error message will appear
            return res.status(401).send("Don't have access to that review");
        }        
    }).catch((err) => {//if the id does not exist, an error message will be sent.
        return res.status(400).send("Invalid input,object invalid");
    });

});


module.exports = router;
