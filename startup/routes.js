const express= require('express');
const patients = require('../routes/patients');

module.exports = function(app) {
    app.use(express.json());
    app.use('/api/patients', patients);    
}