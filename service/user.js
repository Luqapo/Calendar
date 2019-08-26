const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../model/user');

const env = process.env.NODE_ENV || 'test';
const config = require('../config/config')[env];

const changableProperties = [
  'name',
];

async function createUser(u) {
  const hashedPAssword = bcrypt.hashSync(u.password, 8);
  const newUser = await User.create({ email: u.email, password: hashedPAssword });
  const token = jwt.sign({ email: u.email, userId: newUser._id }, config.secret, { expiresIn: '1h' });
  console.log('NEW USER ->', newUser);
  return Object.assign({ token }, newUser.getPublicFields());
}

async function getUser(id) {
  const user = await User.findById(id);
  return user;
}

Object.assign(module.exports, {
  changableProperties,
  create: createUser,
  get: getUser,
});
