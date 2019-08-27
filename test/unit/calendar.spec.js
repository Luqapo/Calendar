const { expect } = require('chai');

const service = require('../../service');
const Calendar = require('../../model/calendar');
const appInit = require('../../app');
const { deepCopy } = require('../utils');

let app;

describe('User service', () => {
  before(async () => {
    app = await appInit();
    await Calendar.deleteMany({});
  });
  it('create new Calendar', async () => {
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
  it('get Calendar', async () => {
    const testCalendar = await service.calendar.get();
  });
});
