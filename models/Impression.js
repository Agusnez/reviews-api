const mongoose = require('mongoose');

const ImpressionSchema = new mongoose.Schema({
    review: String,
    user: String,
    value: String
});

ImpressionSchema.methods.cleanup = function() {
    return {
        id: this._id,
        review: this.review,
        user: this.user,
        value: this.value
    };
};

const Impression = mongoose.model('Impression', ImpressionSchema);

module.exports = Impression;
