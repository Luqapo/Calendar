const Router = require('koa-router');
const service = require('../service');

const router = new Router({ prefix: '/user' });

router.post('/', async (ctx, next) => {
  try {
    delete ctx.request.body.admin;
    const user = await service.user.create(ctx.request.body);
    ctx.status = 201;
    ctx.body = user;
  } catch(err) {
    ctx.throw(422, err.message);
  }
  return next();
});

router.get('/', (ctx, next) => {
  ctx.body = ctx.state.user.getPublicFields();
  return next();
});

router.post('/login', async (ctx, next) => {
  try {
    const user = await service.user.login(ctx.request.body);
    ctx.status = 200;
    ctx.body = user;
  } catch(err) {
    ctx.throw(401, err.message);
  }
  next();
});

module.exports = router;
