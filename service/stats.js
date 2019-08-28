const Calendar = require('../model/calendar');
const Day = require('../model/day');

async function getDay(obj, day, hours) {
  const data = await Day.findOne({ date: day });
  if(data) {
    const reservations = data.reservations.filter(r => !r.blocked);
    const blocked = data.reservations.filter(r => r.blocked);
    obj[day] = {
      reservations: reservations.length,
      freeHours: hours - reservations.length - blocked.length,
      blockedHours: blocked.length,
    };
    return;
  }
  obj[day] = {
    reservations: 0,
    freeHours: hours,
    blockedHours: 0,
  };
}

async function get({ from, to }) {
  if(!from || !to) {
    throw new Error('Date from and to required');
  }
  const calendar = await Calendar.findOne({});
  const promises = [];
  const days = {};
  const dayMs = 86400000;
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  for(let i = start, j = 0; i <= end; i += dayMs, j++) {
    const dateToPush = new Date(start + (j * dayMs));
    const day = `${dateToPush.getFullYear()}-${dateToPush.getMonth()+1}-${dateToPush.getDate()}`;
    if(!calendar.daysFree.find(d => d.date === day)) {
      promises.push(getDay(days, day, calendar.workEnd - calendar.workStart));
    }
  }
  await Promise.all(promises);
  return days;
}


module.exports = {
  get,
};
