const { expect } = require('chai');

const service = require('../../service');
const Calendar = require('../../model/calendar');
const Day = require('../../model/day');
const appInit = require('../../app');

const env = process.env.NODE_ENV || 'test';
const config = require('../../config/config')[env];

describe('User service', () => {
  before(async () => {
    await appInit();
    await Calendar.deleteMany({});
    await Day.deleteMany({});
  });
  it('creates new Calendar', async () => {
    const testCalendar = {
      workStart: 8,
      workEnd: 16,
      daysFree: [
        { date: '2019-9-1' }, { date: '2019-9-2' }, { date: '2019-9-14' }, { date: '2019-9-25' },
      ],
    };
    const newCalc = await service.calendar.set(testCalendar);
    delete newCalc._id;
    delete newCalc.__v;
    newCalc.daysFree.forEach(d => delete d._id);
    expect(newCalc).to.deep.equal(testCalendar);
  });
  it('returns calendar with number of days given in config', async () => {
    const testCal = {
      workStart: 8,
      workEnd: 16,
      daysFree: [
      ],
    };
    await service.calendar.set(testCal);
    const testCalendar = await service.calendar.get();
    const expectedCalendar = {};
    for(let i = 0; i < config.calendarLength; i++) {
      const dateToPush = new Date(Date.now() + (i * 86400000));
      const day = `${dateToPush.getFullYear()}-${dateToPush.getMonth()+1}-${dateToPush.getDate()}`;
      expectedCalendar[day] = {};
    }
    expect(testCalendar).to.deep.equal(expectedCalendar);
  });
  it('returns calendar without days set as free', async () => {
    const testCal = {
      workStart: 8,
      workEnd: 16,
      daysFree: [
        { date: '2019-9-1' }, { date: '2019-9-2' }, { date: '2019-9-14' }, { date: '2019-9-25' },
      ],
    };
    await service.calendar.set(testCal);
    const testCalendar = await service.calendar.get();
    const expectedCalendar = {};
    for(let i = 0; i < config.calendarLength; i++) {
      const dateToPush = new Date(Date.now() + (i * 86400000));
      const day = `${dateToPush.getFullYear()}-${dateToPush.getMonth()+1}-${dateToPush.getDate()}`;
      expectedCalendar[day] = {};
    }
    testCal.daysFree.forEach(d => delete expectedCalendar[d.date]);
    expect(testCalendar).to.deep.equal(expectedCalendar);
  });
});
