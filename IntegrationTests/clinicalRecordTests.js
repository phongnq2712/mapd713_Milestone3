
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

let patientIdStt201_21 = '61a91d024964d90016a0e258'

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

// 2.1. create a new clinical record for a patient -> status 201
describe("when we issue a 'POST' to "+HOST+"/patients/:patientId/clinical-records", function(){
    it("should return HTTP 201", function(done) {
        chai.request(HOST)
            .post('/patients/'+patientIdStt201_21+'/clinical-records')
            .type('form')
            .send({
                'patientId': patientIdStt201_21,
                'bloodPressure': '40/80 mmHg',
                'respiratoryRate': '79/min',
                'bloodOxygenLevel':'99%',
                'heartBeatRate':'80/min'
            })
            .end(function(req, res){
                expect(res.status).to.equal(201);
                done();
            });
    });
});
