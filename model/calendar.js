const mongoose = require('mongoose');

const { Schema } = mongoose;

const calendarSchema = new Schema({
  workStart: {
    type: Number,
    required: true,
  },
  workEnd: {
    type: Number,
    required: true,
  },
  daysFree: [
    {
      date: {
        type: String,
        required: true,
      },
    },
  ],
});

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;
