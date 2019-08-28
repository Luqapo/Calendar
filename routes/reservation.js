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

router.post('/block', async (ctx, next) => {
  try {
    const reserv = await service.reservation.block(ctx.request.body, ctx.state.user._id);
    ctx.status = 201;
    ctx.body = reserv;
  } catch(err) {
    ctx.throw(422, err.message);
  }
  return next();
});

router.post('/confirm', async (ctx, next) => {
  try {
    await service.reservation.confirm(ctx.request.body);
    ctx.status = 204;
  } catch(err) {
    ctx.throw(401, err.message);
  }
  return next();
});

router.delete('/', async (ctx, next) => {
  try {
    const reserv = await service.reservation.deleteReservation(ctx.request.body);
    ctx.status = 201;
    ctx.body = reserv;
  } catch(err) {
    ctx.throw(401, err.message);
  }
  return next();
});

router.get('/mine', async (ctx, next) => {
  const reserv = await service.reservation.getUserRservetions(ctx.state.user._id);
  ctx.body = reserv;
  ctx.status = 200;
  return next();
});

router.get('/', async (ctx, next) => {
  const reserv = await service.reservation.getAll();
  ctx.body = reserv;
  ctx.status = 200;
  return next();
});

module.exports = router;
