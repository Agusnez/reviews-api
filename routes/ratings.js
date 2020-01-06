/*
 *  ratings.js
 *  
 *  Ratings computation of IMDB resources
 *
 *  Universidad de Sevilla 
 *  2019-20
 */

const express = require('express');
const router = express.Router();

const Review = require('../models/Review');

router.get('/:imdbId', async (req, res) => {
    console.log(new Date() + " - GET " + req.originalUrl + " by " + req.ip);
    
    let imdbId = req.params.imdbId;

    Review.aggregate([
        { $match: {imdbId}},
        { $group: {_id: null, average: {$avg: '$rating'}}},
        { $project: { _id: 0, average: 1 }}
    ]).then((doc) => {
        if (doc[0]) {
            res.send(doc[0]);
        } else {
            res.status(404).send('No rating found for that IMDB resource.')
        }
    });
});

module.exports = router;
