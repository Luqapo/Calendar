const Router = require('koa-router');
const service = require('../service');

const router = new Router({ prefix: '/calendar' });

router.post('/', async (ctx, next) => {
  try {
    const cal = await service.calendar.set(ctx.request.body, ctx.state.user._id);
    ctx.status = 201;
    ctx.body = cal;
  } catch(err) {
    ctx.throw(422, err.message);
  }
  return next();
});

router.get('/', async (ctx, next) => {
  ctx.body = await service.calendar.get();
  return next();
});


module.exports = router;
