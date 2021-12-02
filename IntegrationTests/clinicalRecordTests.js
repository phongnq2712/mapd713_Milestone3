
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

const dotenv = require("dotenv")
dotenv.config()
var PORT = process.env.PORT;
var IP = process.env.IP;
//var HOST = process.env.HEROKU_HOST;
var HOST = 'http://'+IP+':'+PORT;

let patientIdStt200 = '6179c2450c1cd71d6a8c5e50'
let patientIdStt404 = '6179c2450c1cd71d6a8c5e51'


// 1.1. get clinical record of a patient -> status 200
describe("when we issue a 'GET' to "+HOST+"/patients/:patientId/clinical-records", function(){
    it("should return HTTP 200", function(done) {
        chai.request(HOST)
            .get('/patients/'+patientIdStt200+'/clinical-records')
            .query()
            .end(function(req, res){
                expect(res.status).to.equal(200);
                done();
            });
    });
});

// 1.2. get clinical record of a patient -> status 404
describe("when we issue a 'GET' to "+HOST+"/patients/:patientId/clinical-records", function(){
    it("should return HTTP 404", function(done) {
        chai.request(HOST)
            .get('/patients/'+patientIdStt404+'/clinical-records')
            .query()
            .end(function(req, res){
                expect(res.status).to.equal(404);
                done();
            });
    });
});

// 2. create a new clinical record for a patient -> status 201
// describe("when we issue a 'POST' to "+HOST+"/patients", function(){
//     it("should return HTTP 200", function(done) {
//         chai.request(HOST)
//             .post('/patients')
//             .type('form')
//             .send({
//                 'firstName': 'Kari',
//                 'lastName': 'Lesotho',
//                 'age': '77',
//                 'gender':'Male',
//                 'healthInsuranceNo':'HI90123',
//                 'phoneNo':'4168370648',
//                 'email': 'ksa@gmail.com'
//             })
//             .end(function(req, res){
//                 expect(res.status).to.equal(201);
//                 done();
//             });
//     });
// });
