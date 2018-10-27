require("dotenv").config();

const express = require('express');
const config = require('config');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");

// ------------------------------
// Set routes
// ------------------------------
const patients = require('./routes/patients')

// ------------------------------
// Set up DB connection
// ------------------------------
mongoose.connect('mongodb://localhost/waitingtimes')
    .then(() => console.log("Connected to waitingtimes database"))
    .catch(err => console.log("Could not connect to the database: waitingtimes", err))

// ------------------------------
// Create express app
// ------------------------------
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(helmet());
app.use('/api/patients', patients);

// ------------------------------
// Start server
// ------------------------------
app.listen(port, () => console.log('Listening on port ' + port))