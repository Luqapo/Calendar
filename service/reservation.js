const Day = require('../model/day');
const Calendar = require('../model/calendar');

async function set(r, userId) {
  const calendar = await Calendar.findOne({});
  if(r.hour < calendar.workStart || r.hour > calendar.workEnd) {
    throw new Error('Reservation not possible for this hour');
  }
  const date = r.day;
  delete r.day;
  let day = await Day.findOne({ date });
  if(!day) {
    day = await Day.create({
      date,
    });
  }
  const checkHour = day.reservations.find(i => i.hour === r.hour);
  if(checkHour && checkHour.blocked) {
    throw new Error('Hour blocked by admin');
  }
  if(checkHour) {
    throw new Error('Hour already reserved');
  }
  r.user = userId;
  const newReservation = day.reservations.create(r);
  day.reservations.push(newReservation);
  await day.save();
  return newReservation._doc;
}

async function block(r, userId) {
  const date = r.day;
  delete r.day;
  let day = await Day.findOne({ date });
  if(!day) {
    day = await Day.create({
      date,
    });
  }
  const checkHour = day.reservations.find(i => i.hour === r.hour);
  if(checkHour) {
    throw new Error('Hour already reserved');
  }
  r.user = userId;
  r.blocked = true;
  const newReservation = day.reservations.create(r);
  day.reservations.push(newReservation);
  await day.save();
  return newReservation._doc;
}

module.exports = {
  set,
  block,
};
