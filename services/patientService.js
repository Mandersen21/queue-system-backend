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

    getQueueNumber(patientIds) {
        let queueNumber = 0
        let numberArray = []
        
        patientIds.forEach(element => {
            let n = element.patientId.slice(-2);
            numberArray.push(Number(n))
        });

        if (numberArray.length > 0) {
            for (i = 1; i < 99; i++) {
                if (!numberArray.includes(i)) {
                    queueNumber = parseInt(i)
                    break;
                }
            }            
            return queueNumber
        }
        else return 1

    },

    createPatientId: function(triage, number, patientInitials) {
        let triageLetter = "";
        let queueNumber = number.toString();

        // Get triage letters
        if (triage === 1) { triageLetter = "R" }
        if (triage === 2) { triageLetter = "O" }
        if (triage === 3) { triageLetter = "Y" }
        if (triage === 4) { triageLetter = "G" }
        if (triage === 5) { triageLetter = "B" }

        // Check queue number
        if (parseInt(number) < 10) { queueNumber = "0" + queueNumber }
        console.log("Patient with id: " + patientInitials + triageLetter + queueNumber.toString() + " created" )
        return patientInitials + triageLetter + queueNumber;
    },

    getExpectedTreatmentTime: function () {
        return moment().add(35, 'minute').toDate()
    },

    getWaitingTime: function (time) { // TODO - add logic to retrieve estimated waiting time, note use Moment libery
        return moment().add(time, 'minute').toDate()
    },

    getWaitingTimeInMinutes: function (expectedTreatmentTime) {
        return (expectedTreatmentTime - new Date()) / 60000;
    },

    getMockPatients: function () {
        return [
            {
                _id: this.getUniqeID(),
                name: 'Anders Andersen',
                age: 3,
                patientInitials: this.getPatientInitials('Anders Andersen'),
                triage: triage.URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('25'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Mikkel Andersen',
                age: 37,
                patientInitials: this.getPatientInitials('Mikkel Andersen'),
                triage: triage.STANDARD,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('29'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Nicy Sørensen',
                age: 37,
                patientInitials: this.getPatientInitials('Nicy Sørensen'),
                triage: triage.STANDARD,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('29'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Søren Larsen',
                age: 37,
                patientInitials: this.getPatientInitials('Søren Larsen'),
                triage: triage.STANDARD,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('35'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Peter Sch',
                age: 37,
                patientInitials: this.getPatientInitials('Peter Sch'),
                triage: triage.STANDARD,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('46'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Mads Wehlast',
                age: 37,
                patientInitials: this.getPatientInitials('Anders Andersen'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('35'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Patrick Rasmussen',
                age: 2,
                patientInitials: this.getPatientInitials('Patrick Rasmussen'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('42'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Søren Spætte',
                age: 37,
                patientInitials: this.getPatientInitials('Søren Spætte'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('55'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Lisbeth Thy',
                age: 37,
                patientInitials: this.getPatientInitials('Lisbeth Thy'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('75'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Claus Kluder',
                age: 37,
                patientInitials: this.getPatientInitials('Claus Kluder'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('77'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Nicolaj Bjarkesen',
                age: 37,
                patientInitials: this.getPatientInitials('Nicolaj Bjarkesen'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('85'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Cicolaj Kjarkesen',
                age: 37,
                patientInitials: this.getPatientInitials('Cicolaj Kjarkesen'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('90'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Jicolaj Vjarkesen',
                age: 37,
                patientInitials: this.getPatientInitials('Jicolaj Vjarkesen'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('150'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Wicolaj Vjarkesen',
                age: 37,
                patientInitials: this.getPatientInitials('Wicolaj Vjarkesen'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('160'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Sicolaj Kjarkesen',
                age: 37,
                patientInitials: this.getPatientInitials('Sicolaj Kjarkesen'),
                triage: triage.NON_URGENT,
                fastTrack: false,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('185'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Jesper Sndersen',
                age: 37,
                patientInitials: this.getPatientInitials('Jesper Sndersen'),
                triage: triage.STANDARD,
                fastTrack: true,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('105'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Nicolaj Nndersen',
                age: 3,
                patientInitials: this.getPatientInitials('Nicolaj Nndersen'),
                triage: triage.STANDARD,
                fastTrack: true,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('10'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Q Andersen',
                age: 15,
                patientInitials: this.getPatientInitials('Q Andersen'),
                triage: triage.STANDARD,
                fastTrack: true,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('17'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'K Rndersen',
                age: 37,
                patientInitials: this.getPatientInitials('K Rndersen'),
                triage: triage.STANDARD,
                fastTrack: true,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('29'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'T Andersen',
                age: 37,
                patientInitials: this.getPatientInitials('T Andersen'),
                triage: triage.STANDARD,
                fastTrack: true,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('33'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'C Kndersen',
                age: 37,
                patientInitials: this.getPatientInitials('C Kndersen'),
                triage: triage.STANDARD,
                fastTrack: true,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('33'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'Q Rndersen',
                age: 37,
                patientInitials: this.getPatientInitials('Q Rndersen'),
                triage: triage.STANDARD,
                fastTrack: true,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('41'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'H Jndersen',
                age: 37,
                patientInitials: this.getPatientInitials('H Jndersen'),
                triage: triage.STANDARD,
                fastTrack: true,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('42'),
                minutesToWait: null
            },
            {
                _id: this.getUniqeID(),
                name: 'E Yndersen',
                age: 37,
                patientInitials: this.getPatientInitials('E Yndersen'),
                triage: triage.STANDARD,
                fastTrack: true,
                registredTime: new Date(),
                waitingTime: this.getWaitingTime('42'),
                minutesToWait: null
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