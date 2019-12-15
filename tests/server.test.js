const app = require('../server.js');
const request = require('supertest');
const reviews = require('../routes/reviews.js');
const Review = require('../models/Review');

let server, agent;

beforeEach((done) => {
    server = app.listen(4000, (err) => {
      if (err) return done(err);
       agent = request.agent(server); // since the application is already listening, it should use the allocated port
       done();
    });
});

afterEach((done) => {
  return  server && server.close(done);
});

describe("Hello world test", () => {
    it("Sould return 200 OK", () => {
        return request(server).get("/").then((response) => {
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
                  })
            ];

            dbFind = jest.spyOn(Review, "find");
            dbFind.mockImplementation((query, f) => {
                f(null, reviews);
            });
        });

        it("Should return an array", () => {
            return request(server).get('/v1/reviews').then((response) => {
                console.log(response);
                expect(response.status).toBe(200);

            })
        });
    });
});
