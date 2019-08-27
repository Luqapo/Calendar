const Day = require('../model/day');

async function set(r, userId) {
  const date = r.day;
  delete r.day;
  let day = await Day.findOne({ date });
  if(!day) {
    day = await Day.create({
      date,
    });
  }
  r.user = userId;
  const checkHour = day.reservations.find(i => i.hour === r.hour);
  if(checkHour) {
    throw new Error('Hour already reserved');
  }
  day.reservations.push(r);
  await day.save();
  return day;
}

module.exports = {
  set,
};
