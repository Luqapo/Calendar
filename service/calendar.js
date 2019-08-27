const Calendar = require('../model/calendar');
const Day = require('../model/day');

async function getDay(obj, day) {
  const data = await Day.findOne({ date: day });
  obj[day] = data || {};
}

async function get() {
  const calendar = await Calendar.findOne({});
  const promises = [];
  const days = {};
  const dayMs = 86400000;
  for(let i = 0; i < 100; i++) {
    const dateToPush = new Date(Date.now() + (i * dayMs));
    const day = `${dateToPush.getFullYear()}-${dateToPush.getMonth()+1}-${dateToPush.getDate()}`;
    if(!calendar.daysFree.find(d => d.date === day)) {
      promises.push(getDay(days, day));
    }
  }
  await Promise.all(promises);
  return days;
}

async function set(data) {
  const calendar = await Calendar.create(data);
  return calendar.getPublicFields();
}

async function update(data) {
  return Calendar.findOneAndUpdate({}, { $set: data });
}

module.exports = {
  get,
  set,
  update,
};
