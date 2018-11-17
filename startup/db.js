const mongoose = require('mongoose');
const winston = require('winston');

module.exports = function (app) {
    // ------------------------------
    // Set up DB connection
    // ------------------------------
    mongoose.connect('mongodb://localhost/waitingtimes')
        .then(() => console.log("Connected to waitingtimes database"))
}