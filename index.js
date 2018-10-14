const express = require('express');
const config = require('config');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;

// Routes
const patients = require('./routes/patients')

// Database connection
mongoose.connect('mongodb://localhost/waitingtimes')
    .then(() => console.log("Connected to waitingtimes database"))
    .catch(err => console.log("Could not connect to the database: waitingtimes", err))

// App settings
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(helmet());
app.use('/api/patients', patients);

// Start server
app.listen(port, () => console.log('Listening on port ' + port))








// function callName(req, res) {

//     // Use child_process.spawn method from 
//     // child_process module and assign it
//     // to variable spawn
//     var spawn = require("child_process").spawn;

//     // Parameters passed in spawn -
//     // 1. type_of_script
//     // 2. list containing Path of the script
//     //    and arguments for the script 

//     // E.g : http://localhost:3000/name?firstname=Mike&lastname=Will
//     // so, first name = Mike and last name = Will
//     var process = spawn('python',["./python.py",
//                             "Mikkel",
//                             "Mikkel2"] );

//     // Takes stdout data from script which executed
//     // with arguments and send this data to res object
//     process.stdout.on('data', function(data) {

//         console.log("Data from script: ", data.toString())

//         res.send(data.toString());
//     } )
// }