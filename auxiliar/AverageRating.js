const Review = require('../models/Review');

class AverageRating {

    static getAverageRating(imdbId) {

        var sum =  0;

        Review.find({imdbId}).then((reviews)=>{
            reviews.forEach(review => {
                sum = sum + review.rating;
            });
            
            let averageRating = sum / reviews.length;

            return averageRating;
        }).catch((err)=>{

            return err;
        });
    }
}

module.exports = AverageRating;
