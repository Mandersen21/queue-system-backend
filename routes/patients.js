const { Patient, validate } = require('../models/patient');
const { Treatment, validateTreatment } = require('../models/treatment');
const express = require('express');
const service = require('../services/patientService');
const Pusher = require("pusher");
const router = express.Router();
const moment = require('moment');
const config = require('config');

const pusher = new Pusher({
    appId: config.get('pusher_app_id'),
    key: config.get('pusher_api_key'),
    secret: config.get('pusher_api_secret'),
    cluster: config.get('pusher_app_cluster'),
    encrypted: true
});

// Get all patients
router.get('/', async (req, res) => {
    const patients = await Patient.find().sort({ minutesToWait: 1, triage: 1, registredTime: 1 });
    let increaseTime = false
    let triagePatient = 0

    patients.forEach(patient => {
        if (patient.minutesToWait > 0) {
            patient.actualTime = service.updateWaitingTime()
            patient.oldMinutesToWait = patient.minutesToWait
            patient.minutesToWait = service.getWaitingTimeInMinutes(patient.expectedTime)
            Patient.collection.updateOne({ _id: patient._id }, patient)
        }
        else {
            increaseTime = true
            triagePatient = patient.triage
        }
    })

    if (increaseTime) {
        patients.forEach(patient => {
            if (patient.triage >= triagePatient) {
                patient.actualTime = service.updateWaitingTime()
                patient.expectedTime = service.increaseWaitingTime(patient.expectedTime, 5)
                patient.oldMinutesToWait = patient.minutesToWait
                patient.minutesToWait = service.getWaitingTimeInMinutes(patient.expectedTime)
                Patient.collection.updateOne({ _id: patient._id }, patient)
            }
        })
    }

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
    const patients = await Patient.find({ fastTrack: useFastTrack, triage: { $gt: 0 } })
    let position = service.getQueuePosition(patients, req.body.triage, req.body.queuePriority, req.body.fastTrack)

    if (req.body.triage > 0) {
        const patientsToChange = await Patient.find({ queuePosition: { $gte: position }, fastTrack: useFastTrack })
        patientsToChange.forEach(function (patient) {
            patient.queuePosition = parseInt(patient.queuePosition) + 1
            Patient.collection.updateOne({ _id: patient._id }, patient)
        })
    }

    // Get average waitingtime
    let treatmentPatients = await Treatment.find().sort([['toTreatment', 'descending']]).limit(3)
    let avgWaitingTime = Math.round((treatmentPatients.map(p => p.timeWaited).reduce((a, b) => a + b, 0)) / 3);
    let currentDate = moment()
    let expectedWaitingTime = await service.getExpectedWaitingTime(req.body.triage, service.getWeek(currentDate), currentDate.hour(), avgWaitingTime, currentDate)

    let patient = new Patient(
        {
            name: req.body.name,
            age: req.body.age,
            patientId: service.createPatientId(req.body.triage, queueNumber, service.getPatientInitials(req.body.name)),
            patientInitials: service.getPatientInitials(req.body.name),
            triage: req.body.triage,
            fastTrack: req.body.fastTrack,
            registredTime: currentDate,
            actualTime: currentDate,
            expectedTime: expectedWaitingTime,
            minutesToWait: service.getWaitingTimeInMinutes(expectedWaitingTime),
            oldMinutesToWait: service.getWaitingTimeInMinutes(expectedWaitingTime),
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

    // Get old data from mongo
    const patientOld = await Patient.findOne({ patientId: req.params.id });
    if (!patientOld) return res.status(404).send('The patient with the given ID was not found.');

    // Set fastTrack status
    const useFastTrack = req.body.fastTrack;

    // Set triage
    const oldTriage = patientOld.triage
    const newTriage = req.body.triage

    // Set queue priority status
    const oldQueuePriorityStatus = patientOld.queuePriority
    const newQueuePriorityStatus = req.body.queuePriority

    // PatientId
    let patientId

    const patients = await Patient.find({ fastTrack: useFastTrack, triage: { $gt: 0 }, patientId: { $ne: req.params.id } })

    let newPosition
    let oldPosition = patientOld.queuePosition

    if (oldTriage > 0) {
        if (useFastTrack == patientOld.fastTrack) {
            if (req.body.queuePriority && !patientOld.queuePriority) {
                newPosition = req.body.queuePosition
                const patientsToChange = await Patient.find({ queuePosition: { $gte: newPosition }, fastTrack: useFastTrack })
                patientsToChange.forEach(function (patient) {
                    patient.queuePosition = parseInt(patient.queuePosition) + 1
                    Patient.collection.updateOne({ _id: patient._id }, patient)
                })
            }

            if (!newQueuePriorityStatus && oldQueuePriorityStatus) {
                newPosition = service.getQueuePosition(patients, req.body.triage, req.body.queuePriority)
                const patientsToChange = await Patient.find({ queuePosition: { $lte: newPosition, $gte: oldPosition }, fastTrack: useFastTrack })
                patientsToChange.forEach(function (patient) {
                    if (patient.queuePosition > 0) {
                        patient.queuePosition = parseInt(patient.queuePosition) - 1
                        Patient.collection.updateOne({ _id: patient._id }, patient)
                    }
                })
            }

            if (newQueuePriorityStatus == oldQueuePriorityStatus) {

                if (newTriage == oldTriage) {
                    newPosition = req.body.queuePosition
                }
                else {
                    newPosition = service.getQueuePosition(patients, req.body.triage, req.body.queuePriority)
                }

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
                        if (patient.queuePosition > 0) {
                            patient.queuePosition = parseInt(patient.queuePosition) - 1
                            Patient.collection.updateOne({ _id: patient._id }, patient)
                        }
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
                        if (patient.queuePosition > 0) {
                            patient.queuePosition = parseInt(patient.queuePosition) - 1
                            Patient.collection.updateOne({ _id: patient._id }, patient)
                        }
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

    }
    else {
        newPosition = service.getQueuePosition(patients, newTriage, newQueuePriorityStatus)
        const patientIds = await Patient.find({ triage: newTriage })
        let queueNumber = service.getQueueNumber(patientIds)
        patientId = service.createPatientId(newTriage, queueNumber, service.getPatientInitials(patientOld.name))

        const patientsToChange = await Patient.find({ queuePosition: { $gte: newPosition }, fastTrack: useFastTrack, triage: { $gt: 0 } })
        patientsToChange.forEach(function (patient) {
            patient.queuePosition = parseInt(patient.queuePosition) + 1
            Patient.collection.updateOne({ _id: patient._id }, patient)
        })
    }

    patientOld.set({
        name: req.body.name,
        age: req.body.age,
        patientId: patientId ? patientId : patientOld.patientId,
        patientInitials: patientOld.patientInitials,
        triage: newTriage,
        fastTrack: req.body.fastTrack,
        registredTime: patientOld.registredTime,
        expectedTime: patientOld.expectedTime,
        actualTime: service.updateWaitingTime(),
        minutesToWait: service.getWaitingTimeInMinutes(patientOld.expectedTime),
        oldMinutesToWait: patientOld.minutesToWait,
        queuePriority: req.body.queuePriority,
        queuePosition: Number(newPosition)
    })

    const result = await patientOld.save();
    res.send(result);

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

        // Push to treatment
        let treatment = new Treatment(
            {
                triage: patient.triage,
                week: service.getWeek(patient.registredTime),
                timeOfDay: patient.registredTime.getHours(),
                timeWaited: Math.round(service.getWaitingTimeInMinutes(patient.registredTime))
            });
        treatment = await treatment.save();
        res.send(patient);
    }

    // Trigger event to clients
    pusher.trigger("events-channel", "new-update", {
    });
});

router.delete('/', async (req, res) => {
    const patients = await Patient.deleteMany({});
    if (!patients) return res.status(404).send('The patients could not get deleted, error');
    res.send(patients);

    // Trigger event to clients
    pusher.trigger("events-channel", "new-update", {
    });
});

module.exports = router;