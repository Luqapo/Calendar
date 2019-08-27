const { expect } = require('chai');

const service = require('../../service');
const Calendar = require('../../model/calendar');
const Day = require('../../model/day');
const User = require('../../model/user');
const appInit = require('../../app');
const { deepCopy } = require('../utils');

let app;

describe('User service', () => {
  before(async () => {
    app = await appInit();
    await User.deleteMany({});
    await Day.deleteMany({});
  });
  it('makes new reservation', async () => {
    const createdUser = await service.user.create({
      email: 'testREserv@test.com',
      password: 'testreserv',
    });
    const check = await service.reservation.set({
      hour: 10,
      title: 'testREservation 1',
      day: '2019-8-30',
    }, createdUser.id);
    const check2 = await service.reservation.set({
      hour: 15,
      title: 'testREservation 2',
      day: '2019-8-30',
    }, createdUser.id);
  });
  it('throws error when reservation hour already taken', async () => {
    const createdUser = await service.user.create({
      email: 'testREserv1@test.com',
      password: 'testreserv',
    });
    const check = await service.reservation.set({
      hour: 10,
      title: 'testREservation 1',
      day: '2019-9-30',
    }, createdUser.id);
    await expect(service.reservation.set({
      hour: 10,
      title: 'testREservation 2',
      day: '2019-9-30',
    }, createdUser.id)).to.be.rejectedWith('Hour already reserved');
  });
});
