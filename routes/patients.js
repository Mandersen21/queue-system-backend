const { Patient, validate } = require('../models/patient');
const express = require('express');
const service = require('../services/patientService');
const Pusher = require("pusher");
const router = express.Router();
const config = require('config');

const pusher = new Pusher({
    appId: config.get('pusher_app_id'),
    key: config.get('pusher_api_key'),
    secret: config.get('pusher_api_secret'),
    cluster: config.get('pusher_app_cluster'),
    encrypted: true
});

var patientQueueNumber = 0;

// Get all patients
router.get('/', async (req, res) => {
    const patients = await Patient.find().sort({ triage: 1, registredTime: 1 });
    // Add waiting time
    patients.forEach(p => {
        if (p.expectedTreatmentTime) {
            p.minutesToWait = service.getWaitingTimeInMinutes(p.expectedTreatmentTime)
        }
    })
    res.send(patients)
});

// Get specific patient, based on id
router.get('/:id', async (req, res) => {
    const patient = await Patient.findOne({ patientId: req.params.id });
    if (!patient) return res.status(404).send('Patient was not found')
    res.send(patiecsnt)
});

// Add new patient to the queue
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const patientIds = await Patient.find({ triage: req.body.triage })
    let queueNumber = service.getQueueNumber(patientIds)

    let patient = new Patient(
        {
            name: req.body.name,
            age: req.body.age,
            patientId: service.createPatientId(req.body.triage, queueNumber, service.getPatientInitials(req.body.name)),
            patientInitials: service.getPatientInitials(req.body.name),
            triage: req.body.triage,
            fastTrack: req.body.fastTrack,
            registredTime: new Date(),
            expectedTreatmentTime: service.getExpectedTreatmentTime(),
            waitingTime: service.getWaitingTime('25'),
            minutesToWait: null,
            queuePriority: req.body.queuePriority,
            queuePosition: req.body.queuePosition
        });

    patient = await patient.save();
    res.send(patient);

    // Trigger event to clients
    pusher.trigger("events-channel", "new-update", {
    });
});

// Update patient in queue
router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const patient = await Patient.findOneAndUpdate({ patientId: req.params.id },
        {
            name: req.body.name,
            age: req.body.age,
            patientInitials: service.getPatientInitials(req.body.name),
            triage: req.body.triage,
            fastTrack: req.body.fastTrack,
            registredTime: new Date,
            waitingTime: service.getWaitingTime('25'),
            minutesToWait: null,
            queuePriority: req.body.queuePriority,
            queuePosition: req.body.queuePosition
        });

    if (!patient) return res.status(404).send('The patient with the given ID was not found.');
    res.send(patient);

    // Trigger event to clients
    pusher.trigger("events-channel", "new-update", {
    });
});

// Remove patient from queue
router.delete('/:id', async (req, res) => {
    const patient = await Patient.findOneAndDelete({ patientId: req.params.id });
    if (!patient) return res.status(404).send('The patient with the given ID was not found.');
    res.send(patient);

    // Trigger event to clients
    pusher.trigger("events-channel", "new-update", {
    });
});

module.exports = router;