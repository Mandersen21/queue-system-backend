const express = require('express');     // Express for running the app plus routes
const config = require('config');       // Config for enable environment configs
const helmet = require('helmet');       // Helmet for securing the app
const morgan = require('morgan');       // Morgan for logging

// Routes that can be called
const patients = require('./routes/patients')

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded( { extended: true } ));
app.use(express.static('public'));
app.use(helmet());
app.use('/api/patients', patients);

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