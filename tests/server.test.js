const app = require('../server.js');
const request = require('supertest');
const reviews = require('../routes/reviews.js');
const Review = require('../models/Review');
const Impresion = require('../models/Impression');


describe("Hello world test", () => {
    it("Sould return 200 OK", () => {
        return request(app).get("/").then((response) => {
            expect(response.status).toBe(200);
        })
    });
});

describe("Reviews API", () => {

    describe("GET /reviews", () => {

        beforeAll(() => {
            const reviews = [
                new Review({
                    "impressions": {
                      "likes": 0,
                      "dislikes": 0,
                      "spam": 0
                    },
                    "imdbId": "tt0903747",
                    "rating": 4,
                    "user": "agusnez",
                    "created": "2019-12-10T19:09:36.884Z"
                  }),
                new Review({
                      "impressions": {
                        "likes": 2,
                        "dislikes": 0,
                        "spam": 0
                      },
                      "imdbId": "tt0903747",
                      "rating": 5,
                      "user": "carcap",
                      "created": "2019-10-10T19:09:36.884Z"
                    })
            ];

            dbFind = jest.spyOn(Review, "find");
            dbCount = jest.spyOn(Review, "countDocuments");
            dbFindOne = jest.spyOn(Impresion, "findOne");


            dbFind.mockImplementation((query, x, y) => {
                return reviews;
            });

            dbCount.mockImplementation((query) => {
                return reviews;
            })

            dbFindOne.mockImplementation((query) => {
                return undefined;
            })
        });

        it("Should return an array containing two reviews", () => {
            return request(app).get('/v1/reviews').then((response) => {
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body)).toBeTruthy();
                expect(response.body.length).toBe(2);
            })
        });
          
    });
});
