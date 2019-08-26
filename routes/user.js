const Router = require('koa-router');
const service = require('../service');

const router = new Router({ prefix: '/user' });

router.post('/', async (ctx, next) => {
  const user = await service.user.create(ctx.request.body);
  ctx.status = 201;
  ctx.body = user;
  next();
});

router.get('/', (ctx, next) => {
  ctx.body = ctx.state.user.getPublicFields();
  return next();
});

router.patch('/', async (ctx, next) => {
  const illegalKeys = Object.keys(ctx.request.body)
    .filter(k => !service.user.changableProperties.includes(k));
  if(illegalKeys.length) {
    ctx.throw(403, 'Illegal update request', { invalidKeys: illegalKeys });
  }
  await service.user.update(ctx.state.user.uid, ctx.request.body);
  ctx.status = 204;
  return next();
});

router.get('/:uid', async (ctx, next) => {
  const { uid } = ctx.params;
  const user = await service.user.get(uid);
  if(!user) ctx.throw(404, 'User not found');
  ctx.body = user.getPublicFields();
  next();
});

module.exports = router;
