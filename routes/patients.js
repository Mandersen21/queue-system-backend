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
    const patients = await Patient.find().sort({ queuePosition: 1, registredTime: 1 });

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
    res.send(patient)
});

// Add new patient to the queue
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const patientIds = await Patient.find({ triage: req.body.triage })
    let queueNumber = service.getQueueNumber(patientIds)

    // Get position for specific patient
    const patients = await Patient.find()
    let position = service.getQueuePosition(patients, req.body.triage, req.body.queuePriority)

    const patientsToChange = await Patient.find({ queuePosition: { $gte: position } })
    patientsToChange.forEach(function (patient) {
        patient.queuePosition = parseInt(patient.queuePosition) + 1
        Patient.collection.updateOne({ _id: patient._id }, patient)
    })

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
            queuePosition: position
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

    const patientOld = await Patient.findOneAndDelete({ patientId: req.params.id });
    const patients = await Patient.find()

    console.log("Queue priority in request:", req.body.queuePriority)

    let newPosition
    let oldPosition = patientOld.queuePosition
    console.log("Old position:", oldPosition)

    if (req.body.queuePriority && !patientOld.queuePriority) {
        console.log("Statement 1")
        newPosition = req.body.queuePosition
        console.log("New position:", newPosition)
        const patientsToChange = await Patient.find({ queuePosition: { $gte: newPosition } })
        patientsToChange.forEach(function (patient) {
            patient.queuePosition = parseInt(patient.queuePosition) + 1
            Patient.collection.updateOne({ _id: patient._id }, patient)
        })
    }

    if (req.body.queuePriority == false && patientOld.queuePriority == true) {
        console.log("Statement 2")
        newPosition = service.getQueuePosition(patients, req.body.triage, req.body.queuePriority)
        console.log("New position:", newPosition)
        const patientsToChange = await Patient.find({ queuePosition: { $lte: newPosition, $gte: oldPosition } })
        patientsToChange.forEach(function (patient) {
            patient.queuePosition = parseInt(patient.queuePosition) - 1
            Patient.collection.updateOne({ _id: patient._id }, patient)
        })
    }

    if (req.body.queuePriority == true && patientOld.queuePriority == true) {
        console.log("Statement 3")
        newPosition = req.body.queuePosition
        console.log("New position:", newPosition)

        if (newPosition > oldPosition) {
            console.log("Patient rykker op")
            let patientsToChange = await Patient.find({ queuePosition: { $gte: oldPosition, $lte: newPosition } })
            patientsToChange.forEach(function (patient) {
                if (patient.queuePosition > 0) {
                    patient.queuePosition = parseInt(patient.queuePosition) - 1
                    Patient.collection.updateOne({ _id: patient._id }, patient)
                }
            })
        }

        if (newPosition < oldPosition) {
            console.log("Patient rykker ned")
            let patientsToChange = await Patient.find({ queuePosition: { $gte: newPosition, $lte: patientOld.queuePosition } })
            patientsToChange.forEach(function (patient) {
                patient.queuePosition = parseInt(patient.queuePosition) + 1
                Patient.collection.updateOne({ _id: patient._id }, patient)
            })
        }
    }

    console.log("Position before adding:", newPosition)

    let patient = new Patient(
        {
            name: req.body.name,
            age: req.body.age,
            patientId: patientOld.patientId,
            patientInitials: patientOld.patientInitials,
            triage: req.body.triage,
            fastTrack: req.body.fastTrack,
            registredTime: patientOld.registredTime,
            expectedTreatmentTime: service.getExpectedTreatmentTime(),
            waitingTime: service.getWaitingTime('25'),
            minutesToWait: null,
            queuePriority: req.body.queuePriority,
            queuePosition: newPosition
        });

    patient = await patient.save();

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
    if (patient) {
        let position = patient.queuePosition
        const patientsToChange = await Patient.find({ queuePosition: { $gte: position } })
        patientsToChange.forEach(function (patient) {
            patient.queuePosition = parseInt(patient.queuePosition) - 1
            Patient.collection.updateOne({ _id: patient._id }, patient)
        })
        res.send(patient);
    }

    // Trigger event to clients
    pusher.trigger("events-channel", "new-update", {
    });
});

module.exports = router;