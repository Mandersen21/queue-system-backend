require("dotenv").config();


const express = require('express');
const config = require('config');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const app = express();

require('./startup/logging');
require('./startup/routes')(app);
require('./startup/db')();


// ------------------------------
// Create express app
// ------------------------------
app.use(cors())
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