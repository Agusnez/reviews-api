const Review = require('../models/Review');

class AverageRating{

    static getAverageRating(imdbId) {

        var imdbIdAverage=imdbId;
        var sum=0;

        Review.find({imdbId:imdbIdAverage}).then((reviews)=>{
            reviews.forEach(review =>{sum=sum+review.rating});
            //averageRating
            averageRating=sum/reviews.length;

            return res.status(200).send(averageRating);

            }).catch((err)=>{//if the imdbId is not valid, an error message will be sent
            
            return  res.status(400).send("Invalid input, object invalid");

            });
    
    }

}

//export default AverageRating;
module.exports=AverageRating;
