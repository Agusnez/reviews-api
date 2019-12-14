// Load environment variables 
require('dotenv').config()

const mongoose = require("mongoose");
mongoose.connect(`mongodb+srv://custom:${process.env.MONGO_PASS}@reviews-vngeb.gcp.mongodb.net/${process.env.MONGO_ENV}?retryWrites=true&w=majority`, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

module.exports = mongoose;