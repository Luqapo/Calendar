const jwt = require('jsonwebtoken');
/* istanbul ignore next */
const env = process.env.NODE_ENV || 'test';
const config = require('../config/config')[env];

const User = require('../model/user');

module.exports = async (ctx, next) => {
  const token = ctx.get('Authorization').split(' ')[1];
  if(!token) {
    ctx.throw(401, 'Unauthorized');
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, config.secret);
  } catch(err) {
    ctx.throw(500, 'Auth fail!');
  }
  if(!decodedToken) {
    ctx.throw(401, 'Not authenticated');
  }
  ctx.state.user = await User.findById(decodedToken.userId);
  next();
};
