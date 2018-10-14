const Joi = require('joi');
const mongoose = require('mongoose');

const Patient = mongoose.model('Patient', new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: { 
        type: Number, 
        required: true 
    },
    patientInitials: { 
        type: String, 
        required: false 
    },
    triage: { 
        type: Number, 
        required: true 
    },
    fastTrack: { 
        type: Boolean, 
        required: true, 
        default: false 
    },
    registredTime: { 
        type: Date, 
        required: false, 
        default: new Date() 
    },
    waitingTime: { 
        type: Date, 
        required: false, 
        default: new Date() 
    },
    minutesToWait: { 
        type: Number, 
        required: false 
    },
}));

function validatePatient(patient) {
    const schema = {
        name: Joi.string().min(1).required(),
        age: Joi.number().required(),
        patientInitials: Joi.string().optional().allow('').min(1).max(3),
        triage: Joi.number().required(),
        fastTrack: Joi.boolean(),
        registredTime: Joi.string().allow(''),
        waitingTime: Joi.string().allow(''),
        minutesToWait: Joi.number()
    };
    return Joi.validate(patient, schema);
}

exports.Patient = Patient;
exports.validate = validatePatient;