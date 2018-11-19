const Joi = require('joi');
const mongoose = require('mongoose');

const Option = mongoose.model('Option', new mongoose.Schema({
    acutePatients: {
        type: Number,
        required: false,
    },
    acutePatientMessage: {
        type: String,
        required: false,
    }
}));

function validateOption(option) {
    const schema = {
        acutePatients: Joi.number(),
        acutePatientMessage: Joi.string().allow(''),
    };
    return Joi.validate(option, schema);
}

exports.Option = Option;
exports.validateOption = validateOption;