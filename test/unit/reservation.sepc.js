const { expect } = require('chai');

const service = require('../../service');
const Day = require('../../model/day');
const User = require('../../model/user');
const appInit = require('../../app');

describe('User service', () => {
  before(async () => {
    await appInit();
    await User.deleteMany({});
    await Day.deleteMany({});
  });
  it('makes new reservations', async () => {
    const createdUser = await service.user.create({
      email: 'testREserv@test.com',
      password: 'testreserv',
    });
    const check1 = await service.reservation.set({
      hour: 10,
      title: 'testREservation 1',
      day: '2019-8-30',
    }, createdUser.id);
    const check2 = await service.reservation.set({
      hour: 15,
      title: 'testREservation 2',
      day: '2019-8-30',
    }, createdUser.id);
    const checkDay = await Day.findOne({ date: '2019-8-30' });
    expect(checkDay._doc.reservations.find(r => String(r._id) === String(check1._id))._doc).to
      .deep.equal(check1);
    expect(checkDay._doc.reservations.find(r => String(r._id) === String(check2._id))._doc).to
      .deep.equal(check2);
  });
  it('throws error when reservation hour already taken', async () => {
    const createdUser = await service.user.create({
      email: 'testREserv1@test.com',
      password: 'testreserv',
    });
    await service.reservation.set({
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
  it('throws error when reservation hour already taken', async () => {
    const createdUser = await service.user.create({
      email: 'testREserv2@test.com',
      password: 'testreserv',
    });
    await expect(service.reservation.set({
      hour: 19,
      title: 'testREservation 2',
      day: '2019-9-30',
    }, createdUser.id)).to.be.rejectedWith('Reservation not possible for this hour');
  });
});
