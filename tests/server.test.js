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

    describe("POST /reviews", () => {

        describe("Creating a review without filling fields that are required", () => {
            let dbSave;
            let authMock;

            beforeAll(() => {
                dbSave = jest.spyOn(Review.prototype, "save");
                dbSave.mockImplementation(() => {
                    const errorObj = {
                        name: 'ValidationError',
                        errors: {},
                        message: 'Mock error'
                    }
                    return Promise.reject(errorObj);
                });

                const dbCount = jest.spyOn(Review, "countDocuments");
                dbCount.mockImplementation(() => {
                    return Promise.resolve(0);
                });

                authMock = jest.fn();
                authMock.mockReturnValue(
                    Promise.resolve({
                        mail: "user@example.com",
                        login: "user"
                    })
                );
                Auth.getUsername = authMock.bind(Auth);
            });

            it("Should return 400 code: missing field/s", () => {
                return request(app).post('/v1/reviews').send({

                }).then((response) => {
                    expect(response.status).toBe(400);
                    expect(response.body.message).toBe('Mock error');
                    expect(dbSave).toHaveBeenCalledTimes(1);
                    expect(authMock).toHaveBeenCalledTimes(0);
                    dbSave.mockRestore();
                });
            });
        });

        describe("Creating a review with required input", () => {
            let dbSave;
            let authMock;

            beforeAll(() => {
                dbSave = jest.spyOn(Review.prototype, "save");
                dbSave.mockImplementation(() => {
                    return Promise.resolve();
                });

                const dbCount = jest.spyOn(Review, "countDocuments");
                dbCount.mockImplementation(() => {
                    return Promise.resolve(0);
                });

                authMock = jest.fn();
                authMock.mockReturnValue(
                    Promise.resolve({
                        mail: "user@example.com",
                        login: "user"
                    })
                );
                Auth.getUsername = authMock.bind(Auth);
            });

            it("Should save that review and return 200 code", () => {

                return request(app).post('/v1/reviews').send({
                    title: 'Buena película',
                    rating: 4,
                    content: 'Me ha gustado el actor principal',
                    imdbId: 'tt2527338'
                }).then((response) => {
                    expect(response.status).toBe(200);
                    expect(dbSave).toHaveBeenCalledTimes(1);
                    expect(authMock).toHaveBeenCalledTimes(0);
                    authMock.mockRestore();
                    dbSave.mockRestore();
                });
            });
        });

        describe("Creating a duplicated review", () => {
            let dbSave;
            let authMock;

            beforeAll(() => {
                dbSave = jest.spyOn(Review.prototype, "save");
                dbSave.mockImplementation(() => {
                    return Promise.resolve();
                });

                const dbCount = jest.spyOn(Review, "countDocuments");
                dbCount.mockImplementation(() => {
                    return Promise.resolve(1);
                });

                authMock = jest.fn();
                authMock.mockReturnValue(
                    Promise.resolve({
                        mail: "user@example.com",
                        login: "user"
                    })
                );
                Auth.getUsername = authMock.bind(Auth);
            });

            it("Should should return 400 and not save the review", () => {

                return request(app).post('/v1/reviews').send({
                    title: 'Buena película',
                    rating: 4,
                    content: 'Me ha gustado el actor principal',
                    imdbId: 'tt2527338'
                }).then((response) => {
                    expect(response.status).toBe(400);
                    expect(dbSave).toHaveBeenCalledTimes(0);
                    expect(authMock).toHaveBeenCalledTimes(0);
                    authMock.mockRestore();
                    dbSave.mockRestore();
                });
            });
        });

        describe("Creating a review with auth token", () => {
            let dbSave;
            let authMock;

            beforeAll(() => {
                dbSave = jest.spyOn(Review.prototype, "save");
                dbSave.mockImplementation(() => {
                    return Promise.resolve();
                });

                const dbCount = jest.spyOn(Review, "countDocuments");
                dbCount.mockImplementation(() => {
                    return Promise.resolve(0);
                });

                authMock = jest.fn();
                authMock.mockReturnValue(
                    Promise.resolve({
                        mail: "user@example.com",
                        login: "user"
                    })
                );
                Auth.getUsername = authMock.bind(Auth);

            });

            it("Should autocomplete user field", () => {
                const spy = jest.spyOn(Review.prototype, 'save');

                return request(app).post('/v1/reviews').send({
                    title: 'Buena película',
                    rating: 4,
                    content: 'Me ha gustado el actor principal',
                    imdbId: 'tt2527338'
                }).set('Authorization', 'Bearer eyxxxx').then((response) => {
                    expect(response.status).toBe(200);
                    expect(spy).toHaveBeenCalledTimes(1);
                    expect(authMock).toHaveBeenCalledTimes(1);
                    authMock.mockRestore();
                    spy.mockRestore();
                });
            });
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
            dbSave = jest.spyOn(Review.prototype, "save");

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

            dbSave.mockImplementation(()=>{
                return Promise.resolve();
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
            dbSave = jest.spyOn(Review.prototype, "save");
            
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
