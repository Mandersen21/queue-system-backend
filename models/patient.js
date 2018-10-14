const Joi = require('joi');
const mongoose = require('mongoose');

const Patient = mongoose.model('Patient', new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: number, required: true },
    patientInitials: { type: String, required: false },
    triage: { type: number, required: true },
    fastTrack: { type: boolean, required: true, default: false },
    registredTime: { type: Date, required: true, default: new Date() },
    waitingTime: { type: Date, required: true, default: new Date() },
    minutesToWait: { type: number, required: true },
}));

function validatePatient(patient) {
    const schema = {
        name: Joi.string().min(3).required(),
        age: Joi.number().required(),
    };
    return Joi.validate(patient, schema);
}

module.exports.Patient = Patient;
module.exports.validate = validatePatient;