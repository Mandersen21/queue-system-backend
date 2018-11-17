require("dotenv").config();

const winston = require('winston');
const express = require('express');
const config = require('config');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require("body-parser");
const app = express();

require('./startup/logging');
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/prod')(app);


// ------------------------------
// Create express app
// ------------------------------
app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(helmet());

// ------------------------------
// Start server
// ------------------------------
const port = process.env.PORT || 3000;
const server = app.listen(port, () => winston.info('Listening on port ' + port))

module.exports = server;