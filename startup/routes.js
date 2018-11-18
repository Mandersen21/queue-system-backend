const express = require('express');
const patients = require('../routes/patients');
const options = require('../routes/options');
const error = require('../middleware/error');

module.exports = function(app) {
    app.use(express.json());
    app.use('/api/patients', patients);
    app.use('/api/options', options);
    app.use(error);
}