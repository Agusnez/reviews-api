/*
 *  reviews.js
 *  
 *  Impressions Creation
 *
 *  Universidad de Sevilla 
 *  2019-20
 */

var express = require('express');
var router = express.Router();

const Review = require('../models/Review');
const Impression = require('../models/Impression');

const auth = require('../auxiliar/authorizationResource');

router.post("/", async (req,res) =>{

    console.log(new Date() + " - POST " + req.originalUrl + " by " + req.ip);

    // First things first. The user must be authenticated
    let authorizationToken = req.headers.authorization;
    let userObject = {};

    if (authorizationToken) {
        let bearerToken = authorizationToken.split(' ')[1];
        userObject = await auth.getUsername(bearerToken).catch((err) => {
            if (err.statusCode == '401' && err.error)
                res.status(err.statusCode).send(err.error);
            else 
                res.status(500).send("Something wrong happend during authentication");
        });

        if (userObject) {
            // Then we validate the body object
            let review = req.body.review;
            let user = userObject.login;
            let value = req.body.value;

            let object = {
                review,
                user
            }

            let isValidReview = await reviewExists(review);

            if (isValueValid(value) && isValidReview) {

                // Check if the impression needs to be updated.
                Impression.findOneAndUpdate(object, {review, user, value}, {upsert: true, useFindAndModify: false},  (err, impression) => {

                    if (err) {
                        res.send(500, {error: err});
                    } else {
                        Review.findOne({_id:review}).then((reviewDB) => {

                            // If a impression is found: Remove the impression from the total count in the review.
                            if (impression) {
                                reviewDB.impressions[translateValue(impression.value)] -= 1;
                            } 
                            
                            // And now add it to the actual value.
                            reviewDB.impressions[translateValue(value)] += 1;
                    
                            reviewDB.save();
                            res.send('Succesfully saved.');

                        }).catch((err) => {
                            res.status(500).send('Internal Server Error.');
                        });
                        
                    }
                });
            } else {
                res.status(400).send("Invalid impression input");
            }

        }

    } else {
        res.status(401).send("You are not allowed to create an impression. Authenticate first.");
    }
 
})

// Auxiliary functions

function isValueValid(value) {
    const possibleValues = ['like', 'dislike', 'spam'];
    return possibleValues.indexOf(value) > -1;
}

async function reviewExists(review) {
    let count = 0;
    try {
        count = await Review.countDocuments({_id: review});
    } catch (err) {
        return false;
    }
    
    return count > 0;     
}

function translateValue(value){
    if (value == 'like') {
        return 'likes'
    } else if (value == 'dislike') {
        return 'dislikes'
    } else {
        return value
    }
}

module.exports = router;