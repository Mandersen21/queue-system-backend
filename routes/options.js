const { Option, validateOption } = require('../models/options');
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

// Get options
router.get('/', async (req, res) => {
    const { error } = validateOption(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const options = await Option.find()
    res.send(options);
});

// Update options
router.put('/', async (req, res) => {
    const { error } = validateOption(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    if (req.body.allWaitingTime > 0 && req.body.increaseTime) {
        const patients = await Patient.find();

        patients.forEach(patient => {
            let minutesToWait = patient.minutesToWait

            patient.actualTime = service.updateWaitingTime()
            patient.expectedTime = service.increaseWaitingTime(patient.expectedTime, parseInt(req.body.allWaitingTime))
            patient.minutesToWait = service.getWaitingTimeInMinutes(patient.expectedTime)
            if (patient.minutesToWait < 0) { patient.minutesToWait = 0 }
            if (req.query.update != "false") {
                patient.oldMinutesToWait = minutesToWait
            }
            Patient.collection.updateOne({ _id: patient._id }, patient)
        })
    }

    if (req.body.allWaitingTime > 0 && !req.body.increaseTime) {
        const patients = await Patient.find();

        patients.forEach(patient => {
            let minutesToWait = patient.minutesToWait

            patient.actualTime = service.updateWaitingTime()
            patient.expectedTime = service.decreaseWaitingTime(patient.expectedTime, parseInt(req.body.allWaitingTime))
            patient.minutesToWait = service.getWaitingTimeInMinutes(patient.expectedTime)
            if (patient.minutesToWait < 0) { patient.minutesToWait = 0 }
            if (req.query.update != "false") {
                patient.oldMinutesToWait = minutesToWait
            }
            Patient.collection.updateOne({ _id: patient._id }, patient)
        })
    }

    const option = await Option.findOneAndUpdate({},
        {
            acutePatients: req.body.acutePatients,
            acutePatientMessage: req.body.acutePatientMessage,
            fastTrackOpen: req.body.fastTrackOpen,
            patientInTreatment: req.body.patientInTreatment
        });

    if (!option) {
        let opt = new Option({ acutePatients: 0 });
        opt = await opt.save();
        res.send(opt);
    }
    else {
        res.send(option);
    }

    // Trigger event to clients
    pusher.trigger("events-channel", "new-update-from-admin", {
    });

    // Trigger event to clients
    pusher.trigger("events-channel", "new-option", {
    });
});

module.exports = router;