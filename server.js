require("dotenv").config();

const config = require('config');
const bodyParser = require("body-parser");
const express = require('express');
const winston = require('winston');
const cors = require('cors');
const app = express();

winston.info('Environment db connection string: ', config.get('db'))

app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

require('./startup/logging');
require('./startup/routes')(app);
require('./startup/db')();
require('./startup/prod')(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => winston.info('Listening on port ' + port))

module.exports = server;