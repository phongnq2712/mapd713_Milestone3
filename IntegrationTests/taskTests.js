
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

const dotenv = require("dotenv")
dotenv.config()
var PORT = process.env.PORT;
var IP = process.env.IP;
var HOST = 'http://'+IP+':'+PORT

let userId = 291
let taskId = '618d5471e1c4f016fe156f5c'


let date_ob = new Date();
let day = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear(); 

// create a task 
describe("when we issue a 'POST' to "+HOST+"/users/:userId/tasks ", function(){
    it("should return HTTP 200", function(done) {
        chai.request(HOST)
            .post('/users/'+userId+'/tasks')
            .type('form')
            .send({
                'taskName': 'chai_task',
                'time': year+'-'+month+'-'+day,
                'status': 'InProgress',
            })
            .end(function(req, res){
                expect(res.status).to.equal(201);
                done();
            });
    });
});

// Get all tasks of a user 
describe("when we issue a 'GET' to "+HOST+"/users/:userId/tasks ", function(){
    it("should return HTTP 200", function(done) {
        chai.request(HOST)
            .get('/users/'+userId+'/tasks')
            .query()
            .end(function(req, res){
                expect(res.status).to.equal(200);
                done();
            });
    });
});

// Get one task of a user 
describe("when we issue a 'GET' to "+HOST+"/users/:userId/tasks/:id ", function(){
    it("should return HTTP 200", function(done) {
        chai.request(HOST)
            .get('/users/'+userId+'/tasks/'+taskId)
            .query()
            .end(function(req, res){
                expect(res.status).to.equal(200);
                done();
            });
    });
});

// delete a task of a user 
describe("when we issue a 'GET' to "+HOST+"/users/:userId/tasks/:taskId ", function(){
    it("should return HTTP 200", function(done) {
        chai.request(HOST)
            .delete('/users/'+userId+'/tasks/'+taskId)
            .query()
            .end(function(req, res){
                expect(res.status).to.equal(200);
                done();
            });
    });
});
