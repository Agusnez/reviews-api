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



router.delete('/', (req, res) => {
   

    //The film's ID of the query is saved in ReviewId
    var reviewId=req.params.imdbId;

    console.log("the method start");
    //Now we execute the delete operation
    Review.findOne({imdbId:reviewId}, (err,review)=>{
        
        if(!err){ //if the imdbId exists, the review will be deleted

            review.remove();
            console.log("The review has been deleted")
            return res.sendStatus(200);

        }else{ //if the imdbId does not exist, an error message will be sent.

            console.log("The review doesn't exist");
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


    var reviewId=req.params.imdbId;
    var contentQuery = req.params.content;
    var ratingQuery = req.params.rating;
    var titleQuery = req.params.title;

    //We dinamically build the query object based on the query params in the request
    var queryObject = {};

    queryObject['imdbId'] = reviewId;


    if(typeof contentQuery ==='string') {
        queryObject['content'] = contentQuery;
    }

    if(typeof ratingQuery ==='number') {
        queryObject['rating'] = ratingQuery;
    }

    if(typeof titleQuery === 'string'){
        queryObject['title'] = titleQuery;
    }

    console.log("ok");

    Review.findOneAndUpdate({imdbId:queryObject.imdbId},{$set:{content:queryObject.content},$set:{rating:queryObject.rating},$set:{title:queryObject.title}},{
        new: true// we give back the new review as a result of the modifications
     }, (err)=>{

         if(err){
             console.log("Review not found");
            res.sendStatus(404);
         }else{
             console.log("Review updated");
             res.sendStatus(201);
         }
     });


});




module.exports = router;