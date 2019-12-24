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
                  })
            ];

            dbFind = jest.spyOn(Review, "find");
            dbFind.mockImplementation((query,x,y, f) => {
                f(null, reviews);
            });
        });

        it("Should return an array", () => {
            return request(server).get('/v1/reviews').then((response) => {
                //console.log(response);
                expect(response.statusCode).toBe(200);

            })
        });
    });
});

describe("Reviews Api", ()=>{

    describe(" DELETE /", () =>{
        let dbDeleteOne;

        beforeAll(()=> {
            const reviews=[

                new Review({"imdbId":'313','rating':3,'name':'Carlos','created':'15-dec-2019','impressions':0}),
                new Review({"imdbId":'312','rating':2,'name':'Agustin','created':'15-dec-2019','impressions':3})

            ];

          

        });

        //.delete(nombre de la review que quieres borrar a través del api path)
        it("Should delete the review if the id exists", () =>{

            dbfindOneAndRemove = jest.spyOn(Review,"findOneAndRemove");
            dbfindOneAndRemove.mockImplementation((imdbId,c)=>{
                c(null,reviews);
            });

            return request(server).del("/v1/reviews?imdbId="+"313").then((response)=>{
                expect(response.statusCode).toBe(200);
                expect(dbfindOneAndRemove).toHaveBeenCalled();

            })

        });
        

        it("Should return 400 code if the review's Id doesn't exist",() =>{

            dbfindOneAndRemove = jest.spyOn(Review,"findOneAndRemove");
            dbfindOneAndRemove.mockImplementation((imdbId,c)=>{
                c(true);
            });


            return request(server).del("/v1/reviews?imdbId=2220").then((response)=>{
                expect(response.statusCode).toBe(400);
            })

        })

        });

    /*
    describe("Post impression method/",()=>{
        let dbFindOne;

        const reviews=[
            new Review({"imdbId":'313','rating':'3','name':'Carlos','created':'15-dec-2019','impressions':'0'}),
            new Review({"imdbId":'312','rating':'2','name':'Agustin','created':'15-dec-2019','impressions':'3'})
        ];

        beforeAll(()=> {

            dbFindOne = jest.spyOn(Review,"findOne");
            dbFindOne.mockImplementation((id, callback)=>{
                callback(null,reviews);
            });
        });


        it("Should update the impressions of a review if the review's id exists", () =>{
            return request(server).post("/v1/reviews/imdbId:313").then((response)=>{
                expect(response.statusCode).toBe(201);
            });
        });

        it("Should give error 400 if the object as review's id is not valid", () =>{
            return request(server).post("/v1/reviews/"+"imdbId:300").then((response)=>{
                expect(response.statusCode).toBe(400);
            });
        });
    });

    */
    
    
});

describe(" PUT /", () =>{

    beforeAll(()=> {
        const reviews=[

            new Review({"imdbId":'313','rating':3,'name':'Carlos','created':'15-dec-2019','impressions':0}),
            new Review({"imdbId":'312','rating':2,'name':'Agustin','created':'15-dec-2019','impressions':3})

        ];
    });

    it("Should modify the review which adjusts to the parameters (if the objects are valid)", () =>{

        dbfindOneAndUpdate = jest.spyOn(Review,"findOneAndUpdate");
        dbfindOneAndUpdate.mockImplementation((imdbId,Content,Rating,Title,c)=>{
            c(null,reviews);
        });

        return request(server).put("/v1/reviews/{imdbId=313}").send({'rating':5}).then((response)=>{

            expect(response.statusCode).toBe(201);

        });

    });
})