const jwt = require('jsonwebtoken');
/* istanbul ignore next */
const env = process.env.NODE_ENV || 'test';
const config = require('../config/config')[env];

const User = require('../model/user');

async function auth(ctx, admin) {
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
  if(admin && !ctx.state.user.admin) {
    ctx.throw(401, 'Unauthorized!');
  }
}

module.exports = {
  middleware(scopes) {
    return async (ctx, next) => {
      let found = false;
      for(let i=0, l=scopes.length; i<l && !found; i++) {
        if(scopes[i].method === ctx.method && scopes[i].path.test(ctx.path)) {
          found = true;
          switch(scopes[i].scope) {
            case 'user': {
              // eslint-disable-next-line no-await-in-loop
              await auth(ctx);
              break;
            }
            case 'admin':
              // eslint-disable-next-line no-await-in-loop
              await auth(ctx, true);
              break;
            case 'public':
              break;
            // istanbul ignore next
            default:
              ctx.throw(500, `Invalid scope: ${scopes[i].scope}`);
          }
        }
      }
      return next();
    };
  },
};
