const mongoose = require('mongoose');

const { Schema } = mongoose;

const reservationSchema = new Schema({
  hour: {
    type: Number,
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
  consfirmed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});


module.exports = reservationSchema;
