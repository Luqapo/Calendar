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

calendarSchema.methods.getPublicFields = function getPublicFields() {
  const calendar = this.toObject();
  return calendar;
};

const Calendar = mongoose.model('Calendar', calendarSchema);

module.exports = Calendar;
