function deepCopy(obj, acc = {}) {
  const keys = Object.keys(obj);
  for(let i = 0, l=keys.length; i < l; i++) {
    const k = keys[i];
    if(obj[k] instanceof Array) {
      acc[k] = deepCopy(obj[k], []);
    } else if(obj[k] instanceof Date) {
      acc[k] = new Date(obj[k].getTime());
    } else if(obj[k] instanceof RegExp) {
      acc[k] = new RegExp(obj[k]);
    } else if(obj[k] === null) {
      acc[k] = null;
    } else if(typeof obj[k] === 'object') {
      acc[k] = deepCopy(obj[k]);
    } else acc[k] = obj[k];
  }
  return acc;
}

module.exports = {
  deepCopy,
};
