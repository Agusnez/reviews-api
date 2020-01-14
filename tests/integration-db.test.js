// ENV Variable
process.env.MONGO_ENV = 'test';

const Review = require('../models/Review');
const mongoose = require('mongoose');
const db = require('../db');

describe("Reviews DB connection", () => {
    beforeAll(() => {
        return db();
    });

    it ("Writes a Review in the DB", (done) => {
        const review = new Review({
            "impressions": {
              "likes": 10,
              "dislikes": 0,
              "spam": 0
            },
            "imdbId": "tt0903747",
            "rating": 4,
            "title": "Buena película",
            "user": "example",
            "created": "2019-12-10T19:09:36.884Z"
          });

          review.save((err) => {
              expect(err).toBeNull();
              Review.find({}, (err, reviews) => {
                expect(reviews).toBeArrayOfSize(1);
                done();
              });
          });
    });

    
    it ("Updates that Review in the DB", (done) => {
          Review.updateOne({imdbId: 'tt0903747'},{imdbId:'tt090374'},(err) => {
              expect(err).toBeNull();
              Review.find({}, (err, reviews) => {
                expect(reviews[0].imdbId).toBe('tt090374');
                done();
              });
          });
    });

    afterAll((done) => {
        Review.deleteMany({}, (err) => {
            mongoose.connection.db.dropDatabase(() => {
                mongoose.connection.close(done);
            });
        });
    });




});

/*describe("The DB updates the reviews",()=>{

        
        beforeEach((done) => {
            Review.deleteMany({}, (err) => {
                done();
            })
        });

        it ("Updates a Review in the DB",async (done) => {

            const review = new Review({
                "impressions": {
                "likes": 10,
                "dislikes": 0,
                "spam": 0
                },
                "imdbId": "tt0903747",
                "rating": 4,
                "title": "Buena película",
                "user": "example",
                "created": "2019-12-10T19:09:36.884Z"
            });

            review.updateOne((err, review) => {
                    expect(err).toBeNull();
                    expect(reviews).toBeArrayOfSize(1);
                    done();
                });
            });


        afterAll((done) => {
            mongoose.connection.db.dropDatabase(() => {
                mongoose.connection.close(done);
            })
        });

});*/