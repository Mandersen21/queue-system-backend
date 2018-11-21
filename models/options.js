const Joi = require('joi');
const mongoose = require('mongoose');

const Option = mongoose.model('Option', new mongoose.Schema({
    acutePatients: {
        type: Number,
        required: false,
        default: 0
    },
    acutePatientMessage: {
        type: String,
        required: false,
        default: ''
    },
    fastTrackOpen: {
        type: Boolean,
        required: false,
        default: false
    }
}));

function validateOption(option) {
    const schema = {
        acutePatients: Joi.number(),
        acutePatientMessage: Joi.string().allow(''),
        fastTrackOpen: Joi.boolean(),
    };
    return Joi.validate(option, schema);
}

exports.Option = Option;
exports.validateOption = validateOption;