const Review = require('../models/Review');
const mongoose = require('mongoose');
const db = require('../db');

describe("Reviews DB connection", () => {
    beforeAll(() => {
        process.env.MONGO_ENV= 'test';
        return db();
    });

    beforeEach((done) => {
        Review.deleteMany({}, (err) => {
            done();
        })
    });

    it ("Writes a Review in the DB", (done) => {
        const review = new Review({
            "impressions": {
              "likes": 0,
              "dislikes": 0,
              "spam": 0
            },
            "imdbId": "tt0903747",
            "rating": 4,
            "user": "agusnez",
            "created": "2019-12-10T19:09:36.884Z"
          });

          review.save((err, review) => {
              expect(err).toBeNull();
              Review.find({}, (err, reviews) => {
                expect(reviews).toBeArrayOfSize(1);
                done();
              });
          });
    });

    afterAll((done) => {
        mongoose.connection.db.dropDatabase(() => {
            mongoose.connection.close(done);
        })
    });


});
