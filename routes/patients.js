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

    let useFastTrack = req.body.fastTrack

    // Get position for specific patient
    const patients = await Patient.find({ fastTrack: useFastTrack })
    let position = service.getQueuePosition(patients, req.body.triage, req.body.queuePriority, req.body.fastTrack)

    const patientsToChange = await Patient.find({ queuePosition: { $gte: position }, fastTrack: useFastTrack })
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

    const useFastTrack = req.body.fastTrack;
    const patientOld = await Patient.findOneAndDelete({ patientId: req.params.id });
    const patients = await Patient.find({ fastTrack: useFastTrack })

    let newPosition
    let oldPosition = patientOld.queuePosition

    if (useFastTrack.toString() == patientOld.fastTrack.toString()) {
        if (req.body.queuePriority && !patientOld.queuePriority) {
            newPosition = req.body.queuePosition
            const patientsToChange = await Patient.find({ queuePosition: { $gte: newPosition }, fastTrack: useFastTrack })
            patientsToChange.forEach(function (patient) {
                patient.queuePosition = parseInt(patient.queuePosition) + 1
                Patient.collection.updateOne({ _id: patient._id }, patient)
            })
        }

        if (req.body.queuePriority == false && patientOld.queuePriority == true) {
            newPosition = service.getQueuePosition(patients, req.body.triage, req.body.queuePriority)
            const patientsToChange = await Patient.find({ queuePosition: { $lte: newPosition, $gte: oldPosition }, fastTrack: useFastTrack })
            patientsToChange.forEach(function (patient) {
                patient.queuePosition = parseInt(patient.queuePosition) - 1
                Patient.collection.updateOne({ _id: patient._id }, patient)
            })
        }

        if (req.body.queuePriority == true && patientOld.queuePriority == true) {
            newPosition = req.body.queuePosition

            if (newPosition > oldPosition) {
                let patientsToChange = await Patient.find({ queuePosition: { $gte: oldPosition, $lte: newPosition }, fastTrack: useFastTrack })
                patientsToChange.forEach(function (patient) {
                    if (patient.queuePosition > 0) {
                        patient.queuePosition = parseInt(patient.queuePosition) - 1
                        Patient.collection.updateOne({ _id: patient._id }, patient)
                    }
                })
            }

            if (newPosition < oldPosition) {
                let patientsToChange = await Patient.find({ queuePosition: { $gte: newPosition, $lte: patientOld.queuePosition }, fastTrack: useFastTrack })
                patientsToChange.forEach(function (patient) {
                    patient.queuePosition = parseInt(patient.queuePosition) + 1
                    Patient.collection.updateOne({ _id: patient._id }, patient)
                })
            }
        }
    }
    else {
        if (useFastTrack) {
            // If useFastTrack, patients are moving to fast-track queue
            const p = await Patient.find({ fastTrack: true })
            newPosition = service.getQueuePosition(p, req.body.triage, req.body.queuePriority)

            const patientsToChangeInFastTrack = await Patient.find({ queuePosition: { $gte: oldPosition }, fastTrack: false })

            if (patientsToChangeInFastTrack && patientsToChangeInFastTrack.length > 0) {
                patientsToChangeInFastTrack.forEach(function (patient) {
                    patient.queuePosition = parseInt(patient.queuePosition) - 1
                    Patient.collection.updateOne({ _id: patient._id }, patient)
                })
            }

            const patientsToChangeInRegular = await Patient.find({ queuePosition: { $gte: newPosition }, fastTrack: true })

            if (patientsToChangeInRegular && patientsToChangeInRegular.length > 0) {
                patientsToChangeInRegular.forEach(function (patient) {
                    patient.queuePosition = parseInt(patient.queuePosition) + 1
                    Patient.collection.updateOne({ _id: patient._id }, patient)
                })
            }
        }
        else {
            // If !useFastTrack, patients are moving to regular queue
            const p = await Patient.find({ fastTrack: false })
            newPosition = service.getQueuePosition(p, req.body.triage, req.body.queuePriority)

            const patientsToChangeInFastTrack = await Patient.find({ queuePosition: { $gte: oldPosition }, fastTrack: true })

            if (patientsToChangeInFastTrack && patientsToChangeInFastTrack.length > 0) {
                patientsToChangeInFastTrack.forEach(function (patient) {
                    patient.queuePosition = parseInt(patient.queuePosition) - 1
                    Patient.collection.updateOne({ _id: patient._id }, patient)
                })
            }

            const patientsToChangeInRegular = await Patient.find({ queuePosition: { $gte: newPosition }, fastTrack: false })

            if (patientsToChangeInRegular && patientsToChangeInRegular.length > 0) {
                patientsToChangeInRegular.forEach(function (patient) {
                    patient.queuePosition = parseInt(patient.queuePosition) + 1
                    Patient.collection.updateOne({ _id: patient._id }, patient)
                })
            }
        }
    }

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
            queuePosition: parseInt(newPosition)
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
        let useFastTrack = patient.fastTrack
        let position = patient.queuePosition
        const patientsToChange = await Patient.find({ queuePosition: { $gte: position }, fastTrack: useFastTrack })
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