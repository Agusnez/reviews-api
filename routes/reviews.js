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
const Review = require('../models/Review');

router.get('/', (req,res) => {
    console.log(new Date() + " - GET " + req.originalUrl + " by " + req.ip);

    var imdbIdQuery = req.query.imdbId || false;
    var userQuery = req.query.user || false;
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
    
    Review.find(queryObject,{'__v': 0},{sort:'-created', skip: offset}, (err, retrievedReviews) => {
        if (err) {
            console.log(Date() + "-" + err);
            res.sendStatus(500);
        } else {
              
            res.send(retrievedReviews.map((review) => {
                return review.cleanup();
            }));
        }
    }).limit(limit);
    
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
    var reviewId=req.body.imdbId;
    //The token is saved
    var authorizationToken= req.headers.authorization;

    let bearerToken=authorizationToken.split(' ')[1];
    var username=await auth.getUsername(bearerToken);

    Review.findById({reviewId: reviewId}, (err,review)=>{

        var user=review.user;
        if(!err){ //if the id exists, the user will be verified
            
                if(user===username){//if the user is validated, the review will be deleted
                    
                    Review.deleteOne({imdbId: review.imdbId}, ()=>{

                            console.log("The review has been deleted")
                            return res.sendStatus(200);
                    });

                }else{ //if the user is not allowed to delete the review, an error message will appear
                        console.log("Don't have access to that review");
                        return res.sendStatus(401);
                }
                
         }else{//if the imdbId does not exist, an error message will be sent.
            console.log("Invalid input,object invalid");
            return res.sendStatus(400);
        }
    });
});
   


//creates an impression
router.post("/", (req,res) =>{

    Review.findOne({imdbId:req.params.imdbId},(review,err)=>{

        if(!err){

             review.impressions=req.params.value;
             console.log("Impression created")
             return res.sendStatus(201);

        }else{
        console.log("Invalid input, object is not valid")
        return res.sendStatus(400);
        }

 
    });
 
 
 });

 
 router.put("/", (req,res)=>{


    var reviewId=req.body.reviewId;



    Review.findById(reviewId, (err,review)=>{

        //var user=review.user;
        if(!err){ //if the id exists, the user will be verified
            //first we get the id user who made the review
            var user= review.user;

            //that user will be compared with the user of the token who wants to modify the review
            var authorizationToken= req.headers.authorization;
            let bearerToken=authorizationToken.split(' ')[1];

                if(user===username){//if the user is validated, the review will be deleted

                    //now that we know the review imdbId, we can filter it, and the option $set:req.body allows us to update 
                    //all the fields that are present in the body of the request
                    Review.updateOne({imdbId: review.imdbId},{ $set:req.body },{new:true},()=>{

                            console.log("The review has been updated")
                            return res.sendStatus(200);
                    });

                }else{ //if the user is not allowed to delete the review, an error message will appear
                        console.log("Don't have access to that review");
                        return res.sendStatus(401);
                }
                
         }else{//if the imdbId does not exist, an error message will be sent.
            console.log("Invalid input,object invalid");
            return res.sendStatus(400);
        }
    });

});




module.exports = router;