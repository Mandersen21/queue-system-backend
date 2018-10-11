const moment = require('moment');

module.exports = {

    getUniqeID: function () {
        return '_' + Math.random().toString(36).substr(2, 18);
    },

    getPatientInitials: function (fullname) { // TODO - test this works as intended when user enters a middle name
        let firstnameCharacter = fullname.split(" ")[0];
        let lastnameCharacter = fullname.split(" ")[1];
        return (firstnameCharacter.charAt(0) + lastnameCharacter.charAt(0)).toUpperCase();
    },

    getTriage: function (triageNumber) {
        switch (triageNumber) {
            case 1:
                return triage.VERY_URGENT;
            case 2:
                return triage.URGENT;
            case 3:
                return triage.IMMEDIATE;
            case 4:
                return triage.STANDARD;
            case 5:
                return triage.NON_URGENT;
            default:
                return triage.NOT_ASSIGNED;
        }
    },

    getPatients: function () { // TODO - Add database and retreive from it to get a list of current patients in the queue

    },

    getWaitingTime: function (time) { // TODO - add logic to retrieve estimated waiting time, note use Moment libery
        return moment().add(time, 'minute').toDate()
    },

    getWaitingTimeInMinutes: function (date1, date2) {
        return (date1 - date2) / 60;
    },

    getMockPatients: function () {
        return [
            {
                id: this.getUniqeID(),
                fullname: 'Anders Andersen',
                age: 3,
                patientInitials: this.getPatientInitials('Anders Andersen'),
                triage: triage.URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('25'),
                minutesToWait: this.getWaitingTimeInMinutes(this.registredTime, this.waitingTime)
            },
            {
                id: this.getUniqeID(),
                fullname: 'Mikkel Andersen',
                age: 37,
                patientInitials: this.getPatientInitials('Mikkel Andersen'),
                triage: triage.STANDARD,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('29'),
                minutesToWait: this.getWaitingTimeInMinutes(this.registredTime, this.waitingTime)
            },
            {
                id: this.getUniqeID(),
                fullname: 'Mads Wehlast',
                age: 37,
                patientInitials: this.getPatientInitials('Anders Andersen'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('35'),
                minutesToWait: this.getWaitingTimeInMinutes(this.registredTime, this.waitingTime)
            },
            {
                id: this.getUniqeID(),
                fullname: 'Patrick Rasmussen',
                age: 2,
                patientInitials: this.getPatientInitials('Patrick Rasmussen'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('42'),
                minutesToWait: this.getWaitingTimeInMinutes(this.registredTime, this.waitingTime)
            },
            {
                id: this.getUniqeID(),
                fullname: 'Søren Spætte',
                age: 37,
                patientInitials: this.getPatientInitials('Søren Spætte'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('55'),
                minutesToWait: this.getWaitingTimeInMinutes(this.registredTime, this.waitingTime)
            },
            {
                id: this.getUniqeID(),
                fullname: 'Lisbeth Thy',
                age: 37,
                patientInitials: this.getPatientInitials('Lisbeth Thy'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('75'),
                minutesToWait: this.getWaitingTimeInMinutes(this.registredTime, this.waitingTime)
            },
            {
                id: this.getUniqeID(),
                fullname: 'Claus Kluder',
                age: 37,
                patientInitials: this.getPatientInitials('Claus Kluder'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('77'),
                minutesToWait: this.getWaitingTimeInMinutes(this.registredTime, this.waitingTime)
            },
            {
                id: this.getUniqeID(),
                fullname: 'Nicolaj Bjarkesen',
                age: 37,
                patientInitials: this.getPatientInitials('Nicolaj Bjarkesen'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('85'),
                minutesToWait: this.getWaitingTimeInMinutes(this.registredTime, this.waitingTime)
            },
            {
                id: this.getUniqeID(),
                fullname: 'Jesper Sndersen',
                age: 37,
                patientInitials: this.getPatientInitials('Jesper Sndersen'),
                triage: triage.STANDARD,
                fastTrack: true,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('105'),
                minutesToWait: this.getWaitingTimeInMinutes(this.registredTime, this.waitingTime)
            },
            {
                id: this.getUniqeID(),
                fullname: 'Nicolaj Nndersen',
                age: 3,
                patientInitials: this.getPatientInitials('Nicolaj Nndersen'),
                triage: triage.STANDARD,
                fastTrack: true,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('10'),
                minutesToWait: this.getWaitingTimeInMinutes(this.registredTime, this.waitingTime)
            },
            {
                id: this.getUniqeID(),
                fullname: 'Q Andersen',
                age: 15,
                patientInitials: this.getPatientInitials('Q Andersen'),
                triage: triage.STANDARD,
                fastTrack: true,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('17'),
                minutesToWait: this.getWaitingTimeInMinutes(this.registredTime, this.waitingTime)
            },
            {
                id: this.getUniqeID(),
                fullname: 'K Rndersen',
                age: 37,
                patientInitials: this.getPatientInitials('K Rndersen'),
                triage: triage.STANDARD,
                fastTrack: true,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('29'),
                minutesToWait: this.getWaitingTimeInMinutes(this.registredTime, this.waitingTime)
            },
            {
                id: this.getUniqeID(),
                fullname: 'T Andersen',
                age: 37,
                patientInitials: this.getPatientInitials('T Andersen'),
                triage: triage.STANDARD,
                fastTrack: true,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('33'),
                minutesToWait: this.getWaitingTimeInMinutes(this.registredTime, this.waitingTime)
            },
        ];
    }
}

// Triage enum
const triage = {
    IMMEDIATE: 1,
    VERY_URGENT: 2,
    URGENT: 3,
    STANDARD: 4,
    NON_URGENT: 5,
    NOT_ASSIGNED: 6,
}