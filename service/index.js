const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);
const db = {};
const services = [];

fs
  .readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    const serviceName = path.basename(file, '.js');
    /* eslint-disable import/no-dynamic-require,global-require */
    db[serviceName] = require(path.join(__dirname, file));
    services.push(serviceName);
  });

Object.assign(module.exports, db);
