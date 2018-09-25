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

    getWaitingTime: function () { // TODO - add logic to retrieve estimated waiting time, note use Moment libery
        return new Date()
    },

    getMockPatients: function () {
        return [
            {
                id: this.getUniqeID(),
                fullname: 'Anders Andersen',
                patientInitials: this.getPatientInitials('Anders Andersen'),
                triage: triage.STANDARD,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime(new Date()),
            },
            {
                id: this.getUniqeID(),
                fullname: 'Mikkel Andersen',
                patientInitials: this.getPatientInitials('Mikkel Andersen'),
                triage: triage.STANDARD,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime(new Date()),
            },
            {
                id: this.getUniqeID(),
                fullname: 'Mads Wehlast',
                patientInitials: this.getPatientInitials('Anders Andersen'),
                triage: triage.NON_URGENT,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime(new Date()),
            },
            {
                id: this.getUniqeID(),
                fullname: 'Patrick Rasmussen',
                patientInitials: this.getPatientInitials('Patrick Rasmussen'),
                triage: triage.NON_URGENT,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime(new Date()),
            },
            {
                id: this.getUniqeID(),
                fullname: 'Søren Spætte',
                patientInitials: this.getPatientInitials('Søren Spætte'),
                triage: triage.NON_URGENT,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime(new Date()),
            },
            {
                id: this.getUniqeID(),
                fullname: 'Lisbeth Thy',
                patientInitials: this.getPatientInitials('Lisbeth Thy'),
                triage: triage.NON_URGENT,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime(new Date()),
            },
            {
                id: this.getUniqeID(),
                fullname: 'Claus Kluder',
                patientInitials: this.getPatientInitials('Claus Kluder'),
                triage: triage.NON_URGENT,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime(new Date()),
            },
            {
                id: this.getUniqeID(),
                fullname: 'Nicolaj Bjarkesen',
                patientInitials: this.getPatientInitials('Nicolaj Bjarkesen'),
                triage: triage.NON_URGENT,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime(new Date()),
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