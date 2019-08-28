const Day = require('../model/day');
const Calendar = require('../model/calendar');

async function set(r, userId) {
  const calendar = await Calendar.findOne({});
  if(r.hour < calendar.workStart || r.hour > calendar.workEnd) {
    throw new Error('Reservation not possible for this hour');
  }
  let day = await Day.findOne({ date: r.date });
  if(!day) {
    day = await Day.create({
      date: r.date,
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
  let day = await Day.findOne({ date: r.date });
  if(!day) {
    day = await Day.create({
      date: r.date,
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

async function getAll() {
  const all = [];
  const days = await Day.find({});
  days.forEach(d => all.push(...d.reservations));
  return all;
}

async function deleteReservation(r) {
  const day = await Day.findOne({ date: r.date });
  day.reservations.id(r._id).remove();
  await day.save();
}

async function confirm(r) {
  const day = await Day.findOne({ date: r.date });
  const reservation = day.reservations.id(r._id);
  reservation.confirmed = true;
  await day.save();
}

async function getUserRservetions(userId) {
  const all = await getAll();
  return all.filter(r => String(r.user) === String(userId));
}

module.exports = {
  set,
  block,
  getAll,
  deleteReservation,
  confirm,
  getUserRservetions,
};
