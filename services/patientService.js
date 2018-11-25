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

        if (parseInt(triage) === 1) { triageLetter = "R" }
        if (parseInt(triage) === 2) { triageLetter = "O" }
        if (parseInt(triage) === 3) { triageLetter = "Y" }
        if (parseInt(triage) === 4) { triageLetter = "G" }
        if (parseInt(triage) === 5) { triageLetter = "B" }

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