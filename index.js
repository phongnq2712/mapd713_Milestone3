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
const dotenv = require("dotenv")
dotenv.config()

var port = process.env.PORT;
var ipaddress = process.env.IP;

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring = process.env.MONGODB_URI;

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log("!!!! Connected to db: " + uristring)
});

// User Schema.
var userSchema = new mongoose.Schema({
  userId: String, 
  userName: String, 
  password:String,
  position: String,
  created_time: Date,
  login_token: String,
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
// Task Schema.
var taskSchema = new mongoose.Schema({
  userId: String, 
  taskName: String, 
  time: Date,
  status:String,
});

// Compiles the schema into a model, opening (or creating, if
// nonexistent) the 'Patients' collection in the MongoDB database
var Patient = mongoose.model('Patient', patientSchema);
var Task = mongoose.model('Task', taskSchema);
var User = mongoose.model('User', userSchema);

var patientRecordsSchema = new mongoose.Schema({
  patientId: String,
  bloodPressure: String,
  respiratoryRate: String,
  bloodOxygenLevel: String,
  heartBeatRate: String
});
var PatientRecords = mongoose.model('Patient-records', patientRecordsSchema);

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
  console.log(' POST:  /users/register')
  console.log(' POST:  /users/login')
  console.log(' GET:  /patients')
  console.log(' POST: /patients')
  console.log(' GET:  /patients/:id')
  console.log(' GET:  /patients/:id/clinical-records')
  console.log(' POST: /patients/:id/clinical-records')
  console.log(' GET:  /users/:userId//tasks')
  console.log(' GET;  /users/:userId//tasks/:id')
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
function generateToken(length) {
    var result = '';
    var characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
// 1. register in the system
server.post('/users/register', function (req, res, next) {
  console.log('POST request: /users/register');
  if (req.body.userName === undefined) {
    return next(new errors.BadRequestError('userName must be supplied'))
  }
  if (req.body.password === undefined) {
    return next(new errors.BadRequestError('password must be supplied'))
  }
  if (req.body.created_time === undefined) {
    return next(new errors.BadRequestError('created_time must be supplied'))
  }

  var newUser = new User({
    userId: Math.floor(Math.random() * 1000 + 1), 
    userName: req.body.userName, 
    password: req.body.password,
    position: 'doctor',
    created_time: req.body.created_time,
    login_token: generateToken(10),
  });

  newUser.save(function (error, result) {
    if (error) return next(new Error(JSON.stringify(error.errors)))
    res.send(201, result)
  })
})
// 2. login the system
server.post('/users/login', function (req, res, next) {
  console.log('POST request: /users/login');
  if (req.body.userName === undefined) {
    return next(new errors.BadRequestError('userName must be supplied'))
  }
  if (req.body.password === undefined) {
    return next(new errors.BadRequestError('password must be supplied'))
  }
  User.find({userName:req.body.userName,password:req.body.password}).exec(function (error, result) {
    if (error) return next(new Error(JSON.stringify(error.errors)))
    res.send(result);
  });
})

  // 3. Get all patients in the system
  server.get('/patients', function (req, res, next) {
    console.log('GET request: patients');
    // Find every entity within the given collection
    Patient.find({}).exec(function (error, result) {
      if (error) return next(new Error(JSON.stringify(error.errors)))
      res.send(result);
    });
  })


  // 4. Get a single patient by their patient id
  server.get('/patients/:id', function (req, res, next) {
    console.log('GET request: patients/' + req.params.id);

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


  // 5. Create a new patient
  server.post('/patients', function (req, res, next) {
    console.log('POST request: patients params=>' + JSON.stringify(req.params));
    console.log('POST request: patients body=>' + JSON.stringify(req.body));
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

  // 6. Get a single patient records by their patient id
  server.get('/patients/:id/clinical-records', function (req, res, next) {
    console.log('GET request: /patients/' + req.params.id + '/clinical-records');

    // Find a single patient by their id
    PatientRecords.find({ patientId: req.params.id }).exec(function (error, patientRecords) {
      if (patientRecords) {
        // Send the patient if no issues
        res.send(patientRecords)
      } else {
        // Send 404 header if the patient doesn't exist
        res.send(404)
      }
    })
  })

  // 7. Create a new clinical records' patient
  server.post('/patients/:id/clinical-records', function (req, res, next) {
    console.log('POST request: /patients/:id/clinical-records params=>' + JSON.stringify(req.params));
    console.log('POST request: /patients/:id/clinical-records body=>' + JSON.stringify(req.body));
    // Make patientId is defined
    if (req.body.patientId === undefined) {
      // If there are any errors, pass them to next in the correct format
      return next(new errors.BadRequestError('patientId must be supplied'))
    }
    
    // Creating new clinical records.
    var newPatientRecords = new PatientRecords({
      patientId: req.body.patientId,
      bloodPressure: req.body.bloodPressure,
      respiratoryRate: req.body.respiratoryRate,
      gender: req.body.gender,
      bloodOxygenLevel: req.body.bloodOxygenLevel,
      heartBeatRate: req.body.heartBeatRate
    });

    // Create the clinical records and saving to db
    newPatientRecords.save(function (error, result) {
      // If there are any errors, pass them to next in the correct format
      if (error) return next(new Error(JSON.stringify(error.errors)))
      // Send the patient if no issues
      res.send(201, result)
    })
  })

  // 8. Get all tasks of a user
  server.get('/users/:userId/tasks', function (req, res, next) {
    console.log('GET request: /tasks'+req.params.userId);
    // Find every entity within the given collection
    Task.find({userId: req.params.userId }).exec(function (error, result) {
      if (error) return next(new Error(JSON.stringify(error.errors)))
      res.send(result);
    })
  })

  //just for data insert
  server.post('/users/:userId/tasks', function (req, res, next) {
    console.log('POST request: /tasks/' + req.params.userId + '/tasks');

    if (req.params.userId === undefined) {
      // If there are any errors, pass them to next in the correct format
      return next(new errors.BadRequestError('useId must be supplied'))
    }
    
    // Creating new clinical records.
    var newTasks = new Task({
      userId: req.params.userId,
      taskName: req.body.taskName,
      time: req.body.time,
      status: req.body.status,
    });

    newTasks.save(function (error, result) {
      if (error) return next(new Error(JSON.stringify(error.errors)))
  
      res.send(200, result)
    })
  })
  // 9. Get one task of a user
  server.get('/users/:userId//tasks/:id', function (req, res, next) {
    console.log('GET request: /tasks/:id');
    Task.find({ _id: req.params.id }).exec(function (error, task) {
      if (error) return next(new Error(JSON.stringify(error.errors)))
      if (task) {
        // Send the task if no issues
        res.send(task)
      } else {
        // Send 404 header if the task doesn't exist
        res.send(404)
      }
    })
  })


