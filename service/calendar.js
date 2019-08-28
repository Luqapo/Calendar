const Calendar = require('../model/calendar');
const Day = require('../model/day');

/* istanbul ignore next */
const env = process.env.NODE_ENV || 'test';
const config = require('../config/config')[env];

async function getDay(obj, day) {
  const data = await Day.findOne({ date: day }) || {};
  obj[day] = data.reservations || {};
}

async function get() {
  const calendar = await Calendar.findOne({});
  const promises = [];
  const days = {};
  const dayMs = 86400000;
  for(let i = 0; i < config.calendarLength; i++) {
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
  if(!data.workStart || !data.workEnd) {
    throw new Error('workStart and workEnd hour required');
  }
  await Calendar.deleteMany({});
  const calendar = await Calendar.create(data);
  return calendar.getPublicFields();
}

module.exports = {
  get,
  set,
};
