// istanbul ignore next
const env = process.env.NODE_ENV || 'test';
const mongoose = require('mongoose');
const config = require('../config/config')[env];

mongoose.Promise = global.Promise;

module.exports = mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
