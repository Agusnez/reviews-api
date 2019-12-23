const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    imdbId: String,
    rating: Number,
    user: String,
    title: String,
    content: String,
    created: Date,
    impressions: {
       likes: Number,
       dislikes: Number,
       spam: Number
    }
});

reviewSchema.methods.cleanup = function() {
    return {
        id: this._id,
        imdbId: this.imdbId, 
        rating: this.rating,
        user: this.user,
        title: this.title,
        content: this.content,
        created: this.created,
        impressions: this.impressions
    };
};

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;