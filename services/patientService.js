const moment = require('moment');
const axios = require('axios');

module.exports = {

    getUniqeID: function () {
        return '_' + Math.random().toString(36).substr(2, 18);
    },

    getPatientInitials: function (fullname) { // TODO - test this works as intended when user enters a middle name
        let firstnameCharacter = fullname.split(" ")[0];
        let lastnameCharacter = fullname.split(" ")[1];
        return (firstnameCharacter.charAt(0) + lastnameCharacter.charAt(0)).toUpperCase();
    },

    getWeek: function (currentDate) {
        let momentDate = moment(currentDate)
        momentDate = momentDate.locale('da')
        return momentDate.weekday()
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

    createPatientId: function (triage, number, patientInitials) {
        let triageLetter = "";
        let queueNumber = number.toString();

        if (parseInt(triage) === 0) { triageLetter = "T" }
        if (parseInt(triage) === 1) { triageLetter = "R" }
        if (parseInt(triage) === 2) { triageLetter = "O" }
        if (parseInt(triage) === 3) { triageLetter = "Y" }
        if (parseInt(triage) === 4) { triageLetter = "G" }
        if (parseInt(triage) === 5) { triageLetter = "B" }

        if (parseInt(number) < 10) { queueNumber = "0" + queueNumber }
        return patientInitials + triageLetter + queueNumber;
    },

    getExpectedWaitingTime: async function (triage, week, time, avgWait, currentDate) {
        let response = await this.getPrediction(triage, week, time, avgWait)
        let waitingTime = Math.round(response.data)
        let waitingDate = moment(currentDate).locale('da').add(waitingTime, 'minute')
        return waitingDate
    },

    updateWaitingTime: function () {
        return moment()
    },

    getWaitingTimeInMinutes: function (date) {
        return Math.round(Math.abs((moment() - date) / 60000));
    },

    getQueuePosition: function (patients, triage, priority) {
        if (patients.length < 1) { return 0 }

        switch (parseInt(triage)) {
            case 1:
                let beforeRed = patients.filter(p => p.triage < 2).length
                if (!priority) {
                    return patients.filter(p => p.triage < 2 || (p.queuePriority && p.queuePosition < beforeRed)).length
                }
            case 2:
                let beforeOrange = patients.filter(p => p.triage < 3).length
                if (!priority) {
                    return patients.filter(p => p.triage < 3 || (p.queuePriority && p.queuePosition < beforeOrange)).length
                }
            case 3:
                let beforeYellow = patients.filter(p => p.triage < 4).length
                if (!priority) {
                    return patients.filter(p => p.triage < 4 || (p.queuePriority && p.queuePosition < beforeYellow)).length
                }
            case 4:
                let beforeGreen = patients.filter(p => p.triage < 5).length
                if (!priority) {
                    return patients.filter(p => p.triage < 5 || (p.queuePriority && p.queuePosition < beforeGreen)).length
                }
            case 5:
                if (!priority) {
                    return patients.length
                }
            default:
                return 0
        }
    },

    getPrediction: function (triage, week, time, avgWait) {
        const url = 'http://localhost:4000/predict'
        return axios.get(url, {
            data: {
                triage: triage.toString(),
                week: week.toString(),
                time: time.toString(),
                avgWait: avgWait.toString()
            }
        })
            .then(data => data)
            .catch(err => console.log(err))
    }

}

// Triage enum
const triage = {
    NOT_ASSIGNED: 0,
    IMMEDIATE: 1,
    VERY_URGENT: 2,
    URGENT: 3,
    STANDARD: 4,
    NON_URGENT: 5,
}