const jwt = require('jsonwebtoken');

const env = process.env.NODE_ENV || 'test';
const config = require('../config/config')[env];

const User = require('../model/token');

module.exports = (ctx, next) => {
  const token = ctx.response.get('x-acces-token').split(' ')[1];
  if(!token) {
    ctx.throw(401, 'Not authenticated.');
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, config.secret);
  } catch(err) {
    ctx.throw(500, 'Auth fail!');
  }
  if(!decodedToken) {
    ctx.throw(401, 'Not authenticated.');
  }
  ctx.state.user = User.findOne(decodedToken.userId);
  next();
};
