const express = require('express');     // Express
const Joi = require('joi');             // Joi for validating models 
const moment = require('moment');       // Moment for calculating waiting times

// Service
const service = require('../services/patientService');

const router = express.Router();
const patients = service.getMockPatients();

router.get('/', (req, res) => {
    res.send(patients)
});

module.exports = router;