const fs = require('fs');
const path = require('path');
const combineRouters = require('koa-combine-routers');

const basename = path.basename(__filename);
const routers = [];

fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    /* eslint-disable import/no-dynamic-require,global-require */
    const router = require(path.join(__dirname, file));
    routers.push(router);
  });

const router = combineRouters(routers);

module.exports = router;
