const app = require('../server.js');
const request = require('supertest');

const Review = require('../models/Review');
const Impresion = require('../models/Impression');
const Auth = require('../auxiliar/authorizationResource');



describe("Hello world test", () => {
    it("Should return 200 OK", () => {
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

describe("Reviews Api Carlos", ()=>{

    describe(" DELETE / reviews: Authenticated and Review ID found", () =>{

        beforeAll(() => {

            const mockStatic = jest.fn();
            mockStatic.mockReturnValue(
                Promise.resolve({
                    mail: "agusnez@example.com",
                    login: "agusnez"
                })
            );

        Auth.getUsername = mockStatic.bind(Auth);

        dbfindById=jest.spyOn(Review,"findById");
        dbdeleteOne=jest.spyOn(Review,"deleteOne");

        dbfindById.mockImplementation((id)=>{
            return Promise.resolve(null, new Review ({
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

        dbdeleteOne.mockImplementation((imdbId)=>{
            return Promise.resolve(null,{ n: 1, ok: 1, deleteCount: 1});
        });
    });


        it("Should delete the review if the id exists", ()  => {

            return request(app).del("/v1/reviews").send({id:"5e01f78dfeb6a107e098b582"}).set("Authorization", " Bearer eyxxx").then((response) =>{
                    expect(response.statusCode).toBe(200);
                    expect(dbdeleteOne).resolves.toHaveBeenCalled();
                });
             
           
           
        });
    })
  //borrar aquí
})
/*
    describe(" DELETE / reviews: Review ID is an invalid object", () =>{

        beforeAll(() => {

            const mockStatic = jest.fn();
            mockStatic.mockReturnValue(
                Promise.resolve({
                    mail: "agusnez@example.com",
                    login: "agusnez"
                })
            );
       

        Auth.getUsername = mockStatic.bind(Auth);

        dbfindById=jest.spyOn(Review,"findById");
        dbdeleteOne=jest.spyOn(Review,"deleteOne");

        dbfindById.mockImplementation((id)=>{
            return Promise.resolve(,null);

            });
       

        dbdeleteOne.mockImplementation((imdbId)=>{
            return Promise.resolve(null,null);
            });
    
        });

        //.delete(nombre de la review que quieres borrar a través del api path)
        it("Should the id be an invalid object, an error message appears", () =>{

            return request(app).del("/v1/reviews").send({id:"xdg9844 nn"}).set("Authorization", " Bearer eyxxx").then((response)=>{
                expect(response.statusCode).toBe(400);

            });

        });
    })


    describe(" DELETE / reviews: Review ID exists but the user is not authorised", () =>{

            beforeAll(() => {
    
                const mockStatic = jest.fn();
                mockStatic.mockReturnValue(
                    Promise.resolve({
                        mail: "agusnez@example.com",
                        login: "agusnez"
                    })
                );
            
    
            Auth.getUsername = mockStatic.bind(Auth);
    
            dbfindById=jest.spyOn(Review,"findById");
            dbdeleteOne=jest.spyOn(Review,"deleteOne");
    
            dbfindById.mockImplementation((id)=>{
                return Promise.resolve(null, new Review ({
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
        
    
            dbdeleteOne.mockImplementation((imdbId)=>{
                return Promise.resolve(null,null);
            });
        });
    
            //.delete(nombre de la review que quieres borrar a través del api path)
            it("Should the user not to be authorised, an error message appears", () =>{
    
                return request(app).del("/v1/reviews").send({id:"5e01f78dfeb6a107e098b582"}).set("Authorization", " Bearer eyxxx").then((response)=>{
                    expect(response.statusCode).toBe(401);
    
                });
    
            });
        })


/*
describe(" PUT /", () =>{

    beforeAll(() => {

            const mockStatic = jest.fn();
            mockStatic.mockReturnValue(
                Promise.resolve({
                    mail: "agusnez@example.com",
                    login: "agusnez"
                })
            );

        Auth.getUsername = mockStatic.bind(Auth);

        dbfindById=jest.spyOn(Review,"findById");
        dbupdateOne=jest.spyOn(Review,"updateOne");

        dbfindById.mockImplementation((id)=>{
            return Promise.resolve(new Review ({
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
        

        dbupdateOne.mockImplementation((imdbId)=>{
            return Promise.resolve(new Review ({
                "impressions": {
                    "likes": 2,
                    "dislikes": 0,
                    "spam": 0
                  },
                  "imdbId": "tt0903747",
                  "rating": 4.5,
                  "user": "carcap",
                  "created": "2019-10-10T19:09:36.884Z",
                  "id": "5e01f78dfeb6a107e098b582"
                }));
        });
    });

    it("Should the review be modified, if the id is valid and the user is authenticated)", () =>{


        return request(app).put("/v1/reviews").send({id:"5e01f78dfeb6a107e098b582", rating:4.5}).set("Authorization", " Bearer eyxxx").then((response)=>{

            expect(response.statusCode).toBe(201);

        });

    });
    */



    

