// Load environment variables 
require('dotenv').config()

const mongoose = require("mongoose");
//mongoose.set('useFindAndModify', false);
const DB_URL = `mongodb+srv://custom:${process.env.MONGO_PASS}@reviews-vngeb.gcp.mongodb.net/${process.env.MONGO_ENV}?retryWrites=true&w=majority`;

const dbConnect = function() {
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error: '));
    return mongoose.connect(DB_URL, {useUnifiedTopology: true,useNewUrlParser: true});
}

module.exports = dbConnect;