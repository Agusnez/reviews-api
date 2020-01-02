const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    imdbId: {
        type: String,
        required: [true, 'Field imdbId is required']
    },
    rating: {
        type: Number,
        required: [true, 'Field rating is required'],
        min: [1, 'You cannot rate below 1'],
        max: [5, 'You cannot rate over 5']
    },
    user: String,
    title: {
        type: String,
        required: [true, 'Field title is required']
    },
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