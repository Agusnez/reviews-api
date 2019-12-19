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
    it("Should return 200 OK", () => {
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
            return request(server).get('/').then((response) => {
                //console.log(response);
                expect(response.status).toBe(200);

            })
        });
    });
});

describe("Reviews Api", ()=>{

    describe(" DELETE /", () =>{
        let dbDeleteOne;

        beforeAll(()=> {
            const reviews=[

                new Review({"imdbId":'313','rating':'3','name':'Carlos','created':'15-dec-2019','impressions':'0'}),
                new Review({"imdbId":'312','rating':'2','name':'Agustin','created':'15-dec-2019','impressions':'3'})

            ];

            dbDeleteOne = jest.spyOn(Review,"deleteOne");
            dbDeleteOne.mockImplementation((query, callback)=>{
                callback(null,reviews);
            });


        });

        //.delete(nombre de la review que quieres borrar a través del api path)
        it("Should delete the review if the id exists", () =>{
            return request(server).del("/").then((response)=>{
                expect(response.statusCode).toBe(201);
                expect(response.files).toBeLessThan(2);//prueba fragil
                

            })

        });

        it("Should return 400 code if the review's Id doesn't exist",() =>{

            return request(server).delete("/").delete.then((response)=>{
                expect(response.statusCode).toBe(400)

            })

        })

        });

    describe("Post impression method/",()=>{
        let dbFindOne;

        const reviews=[
            new Review({"imdbId":'313','rating':'3','name':'Carlos','created':'15-dec-2019','impressions':'0'}),
            new Review({"imdbId":'312','rating':'2','name':'Agustin','created':'15-dec-2019','impressions':'3'})
        ];

        beforeAll(()=> {

            dbFindOne = jest.spyOn(Review,"findOne");
            dbFindOne.mockImplementation((query, callback)=>{
                callback(null,reviews);
            });
        });


        it("Should update the impressions of a review if the review's id exists", () =>{
            return request(server).post("/path").send(Review).then((response)=>{
                expect(response.statusCode).toBe(201);
            });
        });

        it("Should give error 400 if the object as review's id is not valid", () =>{
            return request(server).post("/path").send(Review).then((response)=>{
                expect(response.statusCode).toBe(400);
            });
        });
    });
    
});
