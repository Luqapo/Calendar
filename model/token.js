const mongoose = require('mongoose');

const User = require('./user');

// FIXME: extract to config somewhere
const EXPIRE_TIME = 3600000;

const tokenSchema = new mongoose.Schema({
  sid: {
    type: String,
    required: true,
    minlength: 24,
    maxlength: 32,
  },
  user: {
    type: String,
    ref: 'User',
    required: true,
    minLength: 8,
    maxLength: 24,
  },
  expires: {
    type: Date,
    default: () => Date.now() + EXPIRE_TIME,
  },
});

tokenSchema.methods.getPublicFields = function getPublicFields() {
  return {
    sid: this.sid,
    uid: typeof this.user === 'object' ? String(User.idFromUid(this.user.uid)) : this.user,
    expires: this.expires,
  };
};

tokenSchema.index({ sid: 1 }, {
  unique: true,
  partialFilterExpression: { sid: { $exists: true } },
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;
