const express = require('express');     // Express
const Joi = require('joi');             // Joi for validating models 
const moment = require('moment')        // Moment for calculating waiting times

const router = express.Router();

const triage = {
    IMMEDIATE: 1,
    VERY_URGENT: 2,
    URGENT: 3,
    STANDARD: 4,
    NON_URGENT: 5
}

router.get('/', (req, res) => {
    res.send(patients)
});

function getUniqeID() {
    return '_' + Math.random().toString(36).substr(2, 9);
};

// TODO - test this works as intended
function getPatientInitials(fullname) {
    let firstnameCharacter = fullname.split(" ")[0];
    let lastnameCharacter = fullname.split(" ")[1];
    return (firstnameCharacter.charAt(0) + lastnameCharacter.charAt(0)).toUpperCase();
};

// TODO - add logic to retrieve estimated waiting time, note use Moment libery
function getWaitingTime(registredTime) {
    return new Date()
};

// Mock data
const patients = [
    {
        id: getUniqeID(),
        fullname: 'Anders Andersen',
        patientInitials: getPatientInitials('Anders Andersen'),
        triage: triage.STANDARD,
        registredTime: new Date(),
        waitingTime: getWaitingTime(registredTime),
    },
    {
        id: getUniqeID(),
        fullname: 'Mikkel Andersen',
        patientInitials: getPatientInitials('Mikkel Andersen'),
        triage: triage.STANDARD,
        registredTime: new Date(),
        waitingTime: getWaitingTime(registredTime),
    },
    {
        id: getUniqeID(),
        fullname: 'Mads Wehlast',
        patientInitials: getPatientInitials('Anders Andersen'),
        triage: triage.NON_URGENT,
        registredTime: new Date(),
        waitingTime: getWaitingTime(registredTime),
    },
    {
        id: getUniqeID(),
        fullname: 'Patrick Rasmussen',
        patientInitials: getPatientInitials('Patrick Rasmussen'),
        triage: triage.NON_URGENT,
        registredTime: new Date(),
        waitingTime: getWaitingTime(registredTime),
    },
    {
        id: getUniqeID(),
        fullname: 'Søren Spætte',
        patientInitials: getPatientInitials('Søren Spætte'),
        triage: triage.NON_URGENT,
        registredTime: new Date(),
        waitingTime: getWaitingTime(registredTime),
    },
    {
        id: getUniqeID(),
        fullname: 'Lisbeth Thy',
        patientInitials: getPatientInitials('Lisbeth Thy'),
        triage: triage.NON_URGENT,
        registredTime: new Date(),
        waitingTime: getWaitingTime(registredTime),
    },
    {
        id: getUniqeID(),
        fullname: 'Claus Kluder',
        patientInitials: getPatientInitials('Claus Kluder'),
        triage: triage.NON_URGENT,
        registredTime: new Date(),
        waitingTime: getWaitingTime(registredTime),
    },
    {
        id: getUniqeID(),
        fullname: 'Nicolaj Bjarkesen',
        patientInitials: getPatientInitials('Nicolaj Bjarkesen'),
        triage: triage.NON_URGENT,
        registredTime: new Date(),
        waitingTime: getWaitingTime(registredTime),
    },
];