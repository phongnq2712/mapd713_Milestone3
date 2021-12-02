
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

const dotenv = require("dotenv")
dotenv.config()
var PORT = process.env.PORT;
var IP = process.env.IP;
var HOST = 'http://'+IP+':'+PORT


// register 
describe("when we issue a 'POST' to "+HOST+"/users/register ", function(){
    it("should return HTTP 200", function(done) {
        chai.request(HOST)
            .post('/users/register')
            .type('form')
            .send({
                'userName': 'chai_test',
                'password': '123456',
                'position': 'doctor'
            })
            .end(function(req, res){
                expect(res.status).to.equal(201);
                done();
            });
    });
});

// login 
describe("when we issue a 'POST' to "+HOST+"/users/login ", function(){
    it("should return HTTP 200", function(done) {
        chai.request(HOST)
            .post('/users/login')
            .type('form')
            .send({
                'userName': 'greg',
                'password': '123456'
            })
            .end(function(req, res){
                expect(res.status).to.equal(200);
                done();
            });
    });
});

// users list 
describe("when we issue a 'GET' to "+HOST+"/users ", function(){
    it("should return HTTP 200", function(done) {
        chai.request(HOST)
            .get('/users')
            .query().end(function(req, res){
                expect(res.status).to.equal(200);
                done();
            });
    });
});
