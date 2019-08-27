const mongoose = require('mongoose');
const Reservation = require('./reservation');

const { Schema } = mongoose;

const daySchema = new Schema({
  date: {
    type: String,
    required: true,
  },
  reservations: [
    Reservation,
  ],
});

const Day = mongoose.model('Day', daySchema);

module.exports = Day;
