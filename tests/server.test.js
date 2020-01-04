const app = require('../server.js');
const request = require('supertest');

const Review = require('../models/Review');
const Impresion = require('../models/Impression');
const Auth = require('../auxiliar/authorizationResource');


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

describe("Impressions API", () => {

    describe("POST /impressions: Authenticated and Review ID found", () => {

        beforeAll(() => {

            const mockStatic = jest.fn();
            mockStatic.mockReturnValue(
                Promise.resolve({
                    mail: "agusnez@example.com",
                    login: "agusnez"
                })
            );

            Auth.getUsername = mockStatic.bind(Auth);

            dbCount = jest.spyOn(Review, "countDocuments");
            dbImpression = jest.spyOn(Impresion, "findOneAndUpdate");
            dbFindOne = jest.spyOn(Review, "findOne");
            
            dbCount.mockImplementation((query) => {
                return 1;
            });

            dbImpression.mockImplementation((query, newObj, opts) => {
                return Promise.resolve(null,null);
            });
            
            dbFindOne.mockImplementation((query) => {
                return Promise.resolve(new Review({
                    "impressions": {
                      "likes": 2,
                      "dislikes": 0,
                      "spam": 0
                    },
                    "imdbId": "tt0903747",
                    "rating": 5,
                    "user": "carcap",
                    "created": "2019-10-10T19:09:36.884Z",
                    "id": "5e01f78dfeb6a107e098b582"
                  }));
            });

        });

        it("Should return a 200 OK status", () => {
            return request(app).post('/v1/impressions').send({
                review:"5e01f78dfeb6a107e098b582",
                value: "like"
            }).set('Authorization', 'Bearer eyxxx').then((response) => {
                expect(response.status).toBe(200);
                expect(response.text).toBe("Succesfully saved.");
            })
        });

    });

    describe("POST /impressions: Not authenticated", () => {

        beforeAll(() => {
            
            const mockStatic = jest.fn();
            mockStatic.mockReturnValue(
                Promise.resolve({
                    mail: "agusnez@example.com",
                    login: "agusnez"
                })
            );

            Auth.getUsername = mockStatic.bind(Auth);

            dbCount = jest.spyOn(Review, "countDocuments");
            dbImpression = jest.spyOn(Impresion, "findOneAndUpdate");
            dbFindOne = jest.spyOn(Review, "findOne");
            
            dbCount.mockImplementation((query) => {
                return 1;
            });

            dbImpression.mockImplementation((query, newObj, opts) => {
                return Promise.resolve(null,null);
            });
            
            dbFindOne.mockImplementation((query) => {
                return Promise.resolve(new Review({
                    "impressions": {
                      "likes": 2,
                      "dislikes": 0,
                      "spam": 0
                    },
                    "imdbId": "tt0903747",
                    "rating": 5,
                    "user": "carcap",
                    "created": "2019-10-10T19:09:36.884Z",
                    "id": "5e01f78dfeb6a107e098b582"
                  }));
            });

        });

        it("Should return a 401 Unauthorized status", () => {
            return request(app).post('/v1/impressions').send({
                review:"5e01f78dfeb6a107e098b582",
                value: "like"
            }).then((response) => {
                expect(response.status).toBe(401);
                expect(response.text).toBe("You are not allowed to create an impression. Authenticate first.");
            })
        });

    });

    describe("POST /impressions: Authenticated but Review ID does not exist", () => {

        beforeAll(() => {
            
            const mockStatic = jest.fn();
            mockStatic.mockReturnValue(
                Promise.resolve({
                    mail: "agusnez@example.com",
                    login: "agusnez"
                })
            );

            Auth.getUsername = mockStatic.bind(Auth);

            dbCount = jest.spyOn(Review, "countDocuments");
            dbImpression = jest.spyOn(Impresion, "findOneAndUpdate");
            
            dbCount.mockImplementation((query) => {
                return 0;
            });

            dbImpression.mockImplementation((query, newObj, opts) => {
                return Promise.resolve(null,null);
            });

        });

        it("Should return a 400 Bad request status", () => {
            return request(app).post('/v1/impressions').send({
                review:"5e01f78dfeb6a107e098b582",
                value: "like"
            }).set('Authorization', 'Bearer eyxxx').then((response) => {
                expect(response.status).toBe(400);
                expect(response.text).toBe("Invalid impression input");
            })
        });

    });
});

describe("Rating computation", () => {

    describe("Get average imdbId not found", () => {

        let dbAggregate;

        beforeAll(() => {
            dbAggregate = jest.spyOn(Review, 'aggregate');
            dbAggregate.mockImplementation((array) => {
                return Promise.resolve([]);
            });
        });

        it("Should notify that it could not compute the average rating", () => {
            dbAggregate = jest.spyOn(Review, 'aggregate');

            return request(app).get("/v1/ratings/tt000000").then((response) => {
                expect(response.status).toBe(404);
                expect(response.text).toBe("No rating found for that IMDB resource.")
                expect(dbAggregate).toHaveBeenCalledTimes(1);
                dbAggregate.mockRestore();
            });
        });
    });

    describe("Get average imdbId found", () => {

        let dbAggregate;

        beforeAll(() => {
            dbAggregate = jest.spyOn(Review, 'aggregate');
            dbAggregate.mockImplementationOnce((array) => {
                return Promise.resolve([{
                    average: 3.9
                }]);
            });
        });

        it("Should return the average", () => {
            dbAggregate = jest.spyOn(Review, 'aggregate');
            return request(app).get("/v1/ratings/tt0903747").then((response) => {
                expect(response.status).toBe(200);
                expect(response.body.average).toBe(3.9);
                expect(dbAggregate).toHaveBeenCalledTimes(1);
                dbAggregate.mockRestore();
            });
        });
    });

});