const Router = require('koa-router');
const service = require('../service');

const router = new Router({ prefix: '/reservation' });

router.post('/', async (ctx, next) => {
  try {
    const reserv = await service.reservation.set(ctx.request.body, ctx.state.user._id);
    ctx.status = 201;
    ctx.body = reserv;
  } catch(err) {
    ctx.throw(422, err.message);
  }
  return next();
});

// router.get('/', (ctx, next) => {
//   ctx.body = ctx.state.user.getPublicFields();
//   return next();
// });


module.exports = router;
