/**
 * Group 9 - Milestone 2
 * 1. Quoc Phong Ngo - Student ID: 301148406
 * 2. Feiliang Zhou  - Student ID: 301216989
 * Date created: October 27th, 2021
 */

var DEFAULT_PORT = 5000
var DEFAULT_HOST = '127.0.0.1'
var SERVER_NAME = 'healthrecords'

var http = require ('http');
var mongoose = require ("mongoose");

var port = process.env.PORT;
var ipaddress = process.env.IP;

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring = 
  process.env.MONGODB_URI || 
  'mongodb+srv://lkZac4WrRc5Jl8ZQ:lkZac4WrRc5Jl8ZQ@cluster0.xwahq.mongodb.net/patients-db?retryWrites=true&w=majority';

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("!!!! Connected to db: " + uristring)
});


// Patient Schema.
var patientSchema = new mongoose.Schema({
		firstName: String, 
		lastName: String, 
		age: Number,
		gender: String,
		healthInsuranceNo: String,
		phoneNo: String,
    email:String
});

// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'Patients' collection in the MongoDB database
var Patient = mongoose.model('Patient', patientSchema);

var errors = require('restify-errors');
var restify = require('restify')
  // Create the restify server
  , server = restify.createServer({ name: SERVER_NAME})

	if (typeof ipaddress === "undefined") {
		//  Log errors on OpenShift but continue w/ 127.0.0.1 - this
		//  allows us to run/test the app locally.
		console.warn('No process.env.IP var, using default: ' + DEFAULT_HOST);
		ipaddress = DEFAULT_HOST;
	};

	if (typeof port === "undefined") {
		console.warn('No process.env.PORT var, using default port: ' + DEFAULT_PORT);
		port = DEFAULT_PORT;
	};
  
  
  server.listen(port, ipaddress, function () {
  console.log('Server %s listening at %s', server.name, server.url)
  console.log('Resources:')
  console.log(' /patient')
  console.log(' /patient/:id')
})


  server
    // Allow the use of POST
    .use(restify.plugins.fullResponse())

    // Maps req.body to req.params
    .use(restify.plugins.bodyParser())
    .use(
  function crossOrigin(req,res,next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    return next();
  }
);

  // 1. Get all patients in the system
  server.get('/patients', function (req, res, next) {
    console.log('GET request: patient');
    // Find every entity within the given collection
    Patient.find({}).exec(function (error, result) {
      if (error) return next(new Error(JSON.stringify(error.errors)))
      res.send(result);
    });
  })


  // 2. Get a single patient by their patient id
  server.get('/patients/:id', function (req, res, next) {
    console.log('GET request: patient/' + req.params.id);

    // Find a single patient by their id
    Patient.find({ _id: req.params.id }).exec(function (error, patient) {
      if (patient) {
        // Send the patient if no issues
        res.send(patient)
      } else {
        // Send 404 header if the patient doesn't exist
        res.send(404)
      }
    })
  })


  // 3. Create a new patient
  server.post('/patients', function (req, res, next) {
    console.log('POST request: patient params=>' + JSON.stringify(req.params));
    console.log('POST request: patient body=>' + JSON.stringify(req.body));
    // Make first name is defined
    if (req.body.firstName === undefined) {
      // If there are any errors, pass them to next in the correct format
      return next(new errors.BadRequestError('firstName must be supplied'))
    }
    if (req.body.lastName === undefined) {
      // If there are any errors, pass them to next in the correct format
      return next(new errors.BadRequestError('lastName must be supplied'))
    }
    if (req.body.healthInsuranceNo === undefined) {
      // If there are any errors, pass them to next in the correct format
      return next(new errors.BadRequestError('healthInsuranceNo must be supplied'))
    }

    // Creating new patient.
    var newPatient = new Patient({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      age: req.body.age,
      gender: req.body.gender,
      healthInsuranceNo: req.body.healthInsuranceNo,
      phoneNo: req.body.phoneNo,
      email: req.body.email
    });

    // Create the patient and saving to db
    newPatient.save(function (error, result) {
      // If there are any errors, pass them to next in the correct format
      if (error) return next(new Error(JSON.stringify(error.errors)))
      // Send the patient if no issues
      res.send(201, result)
    })
  })