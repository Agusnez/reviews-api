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

router.post('/', (req, res) => {
    console.log(new Date() + " - POST /reviews by " + req.ip);

    var imdbId = req.body.imdbId;
    var name = req.body.user;
    var rating = req.body.rating;

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
    });
});



router.delete('/', async (req, res) => {

    //The film's ID of the query is saved in ReviewId
    var reviewId = req.body.id;

    //The token is saved
    var authorizationToken = req.headers.authorization;
    let bearerToken = authorizationToken.split(" ")[1];
    var username = await auth.getUsername(bearerToken);


    Review.findById({ id: reviewId }).then((review) => {
        var user = review.user;
        //if the id exists, the user will be verified

        if (user == username.login) {//if the user is validated, the review will be deleted

            Review.deleteOne({id: review.id }).then(() => {

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





router.put("/", (req, res) => {


    var reviewId = req.body.id;
    var authorizationToken = req.headers.authorization;
    let bearerToken = authorizationToken.split(' ')[1];

    Review.findById(reviewId).then((review) => {

    //if the id exists, the user will be verified
            //first we get the id user who made the review
            var user = review.user;

            //that user will be compared with the user of the token who wants to modify the review

            if (user === user.login) {//if the user is validated, the review will be deleted

                //now that we know the review imdbId, we can filter it, and the option $set:req.body allows us to update 
                //all the fields that are present in the body of the request
                Review.updateOne({ id: review.id }, { $set: req.body }).then(() => {

                    console.log("The review has been updated")
                    return res.sendStatus(200);
                });

            } else { //if the user is not allowed to delete the review, an error message will appear
                console.log("Don't have access to that review");
                return res.sendStatus(401);
            }        
    }).catch((err) => {//if the id does not exist, an error message will be sent.
        return res.status(400).send("Invalid input,object invalid");

});


module.exports = router;
