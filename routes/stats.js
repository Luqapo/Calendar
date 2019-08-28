const Router = require('koa-router');
const service = require('../service');

const router = new Router({ prefix: '/stats' });

router.get('/', async (ctx, next) => {
  const stats = await service.stats.get(ctx.request.body);
  ctx.status = 200;
  ctx.body = stats;
  return next();
});

module.exports = router;
