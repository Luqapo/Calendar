const mongoose = require('mongoose');

const { Schema } = mongoose;

const reservationSchema = new Schema({
  hour: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  blocked: {
    type: Boolean,
  },
}, {
  timestamps: true,
});


module.exports = reservationSchema;
