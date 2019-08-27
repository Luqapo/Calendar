const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/user');
/* istanbul ignore next */
const env = process.env.NODE_ENV || 'test';
const config = require('../config/config')[env];

async function createUser(u) {
  if(!u.email || !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.email))) {
    throw new Error('Email required');
  }
  if(await User.findOne({ email: u.email })) {
    throw new Error('Account with this email already exist');
  }
  if(!u.password || u.password.length < 6) {
    throw new Error('Password required, minimal length 6 characters');
  }
  const hashedPAssword = bcrypt.hashSync(u.password, 8);
  const newUser = await User.create({ email: u.email, password: hashedPAssword });
  const token = jwt.sign({ email: u.email, userId: newUser._id }, config.secret, { expiresIn: '1h' });
  return Object.assign({ token }, newUser.getPublicFields());
}

async function getUser(id) {
  const user = await User.findById(id);
  return user;
}

async function login(u) {
  const user = await User.findOne({ email: u.email });
  if(!user) {
    throw new Error('User not found');
  }
  const passwordIsValid = bcrypt.compareSync(u.password, user.password);
  if(!passwordIsValid) {
    throw new Error('Wrong password');
  }
  const token = jwt.sign({ email: u.email, userId: user._id }, config.secret, { expiresIn: '1h' });
  return Object.assign({ token }, user.getPublicFields());
}

Object.assign(module.exports, {
  create: createUser,
  get: getUser,
  login,
});
