const { Option, validateOption } = require('../models/options');
const express = require('express');
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
    pusher.trigger("events-channel", "new-option", {
    });
});

module.exports = router;