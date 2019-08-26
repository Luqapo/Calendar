/* istanbul ignore next */
const path = require('path');
const Koa = require('koa');
const serve = require('koa-static');
const mount = require('koa-mount');
const bodyParser = require('koa-bodyparser');

const router = require('./routes');

/* istanbul ignore next */
const env = process.env.NODE_ENV || 'test';
const config = require('./config/config')[env];

const service = require('./service');
const dbInit = require('./db');

const app = new Koa();

let appPromise;

/* istanbul ignore next */
const port = process.env.PORT || config.PORT || 3000;

app.use(mount('/docs', serve(path.join(__dirname, 'docs'))));

app.use(bodyParser({
  enableTypes: ['json'],
}));


/* istanbul ignore next catch-all error handling, tests meaningless */
app.use(async (ctx, next) => {
  try {
    await next();
  } catch(err) {
    // eslint-disable-next-line no-console
    console.error(err.stack);
    if(ctx.status === 401 && !ctx.response.get('WWW-Authenticate')) {
      ctx.set('WWW-Autenthicate', 'Bearer scope="user"');
    }
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = { error: err.message };
    if(ctx.status === 500) {
      // eslint-disable-next-line no-debugger
      debugger;
    }
  }
});

app.use(service.auth);

app.use(router());

function init() {
  if(!appPromise) {
    appPromise = new Promise(async (resolve) => {
      app.context.mongoose = await dbInit;
      app.listen(port);
      resolve(app);
    });
  }
  return appPromise;
}

init();

module.exports = init;
