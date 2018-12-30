const Joi = require('joi');
const mongoose = require('mongoose');

const Treatment = mongoose.model('Treatment', new mongoose.Schema({
    triage: { 
        type: Number, 
        required: true 
    },
    week: { 
        type: Number, 
        required: true 
    },
    timeOfDay: { 
        type: Number, 
        required: true 
    },
    timeWaited: { 
        type: Number, 
        required: true 
    },
    toTreatment: {
        type: Date, 
        required: false, 
        default: new Date()
    },
}));

function validateTreatmentPatient(treatment) {
    const schema = {
        triage: Joi.number().required(),       
        week: Joi.number().required(),
        timeOfDay: Joi.number().required(),
        timeWaited: Joi.number().required(),
        toTreatment: Joi.string().allow(''),
    };
    return Joi.validate(treatment, schema);
}

exports.Treatment = Treatment;
exports.validate = validateTreatmentPatient;