const express = require('express');     // Express
const Joi = require('joi');             // Joi for validating models 
const moment = require('moment');       // Moment for calculating waiting times

// Service
const service = require('../services/patientService');

const router = express.Router();
const patients = service.getMockPatients();

// Get all patients
router.get('/', (req, res) => {
    res.send(patients)
});

// Get specific patient, based on id
router.get('/:id', (req, res) => {
    const patient = patients.find(p => p.id === parseInt(req.params.id));
    if (!patient) return res.status(404).send('Patient was not found')
    res.send(patient)
})

// Add new patient to the queue
router.post('/', (req, res) => {
    const { error } = validatePatient(req.body);
    if (error) return res.status(400).send(result.error);

    const patent = {
        id: service.getUniqeID(),
        fullname: req.body.fullname,
        patientInitials: service.getPatientInitials(req.body.fullname),
        triage: service.getTriage(req.body.triage),
        registredTime: new Date(),
        waitingTime: service.getWaitingTime(new Date())
    };
    patients.push(patent);
    res.send(patient);
});

// Update patient in queue
// router.put()

// Remove patient from queue
// router.delte()

function validatePatient(patient) {
    const schema = {
        fullname: Joi.string().required(),
        triage: Joi.number().required(),
    };
    return Joi.validate(genre, schema);
}

module.exports = router;