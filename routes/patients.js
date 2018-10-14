const { Patient, validate } = require('../models/patient')
const express = require('express');
const service = require('../services/patientService');
const router = express.Router();

// Mock data
// const patients = service.getMockPatients();

// Get all patients
router.get('/', async (req, res) => {
    const patients = await Patient.find();

    // Add waiting time
    patients.forEach(p => {
        p.minutesToWait = service.getWaitingTimeInMinutes(p.registredTime, p.waitingTime)
    })
    res.send(patients)
});

// Get specific patient, based on id
router.get('/:id', async (req, res) => {
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).send('Patient was not found')
    res.send(patient)
})

// Add new patient to the queue
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error);

    let patient = new Patient(
        {
            name: req.body.name,
            age: req.body.age,
            patientInitials: service.getPatientInitials(req.body.name),
            triage: req.body.triage,
            fastTrack: req.body.fastTrack,
            registredTime: new Date,
            waitingTime: service.getWaitingTime('25'),
            minutesToWait: null
        });

    patient = await Patient.save();
    res.send(patient);
});

// Update patient in queue TODO - Mads
// router.put()

// Remove patient from queue TODO - Mads
// router.delte()

module.exports = router;