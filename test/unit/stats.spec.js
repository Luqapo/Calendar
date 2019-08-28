const { expect } = require('chai');

const service = require('../../service');
const Day = require('../../model/day');
const User = require('../../model/user');
const appInit = require('../../app');

describe('Stats service', () => {
  before(async () => {
    await appInit();
    await User.deleteMany({});
    await Day.deleteMany({});
  });
  it('returns stats for spec range', async () => {
    const testCal = {
      workStart: 8,
      workEnd: 16,
      daysFree: [
      ],
    };
    await service.calendar.set(testCal);
    const createdUser = await service.user.create({
      email: 'testREserv@test.com',
      password: 'testreserv',
    });
    await service.reservation.set({
      hour: 10,
      title: 'testREservation 1',
      date: '2019-8-30',
    }, createdUser.id);
    await service.reservation.set({
      hour: 15,
      title: 'testREservation 2',
      date: '2019-8-30',
    }, createdUser.id);
    await service.reservation.block({
      hour: 12,
      title: 'testREservation 1',
      date: '2019-8-30',
    }, createdUser.id);
    await service.reservation.set({
      hour: 15,
      title: 'testREservation 2',
      date: '2019-9-30',
    }, createdUser.id);
    await service.reservation.set({
      hour: 13,
      title: 'testREservation 2',
      date: '2019-11-2',
    }, createdUser.id);
    await service.reservation.set({
      hour: 15,
      title: 'testREservation 2',
      date: '2019-11-2',
    }, createdUser.id);
    const stats = await service.stats.get({ from: '2019-08-25', to: '2019-09-25' });
    expect(stats['2019-8-30'].freeHours).to.equal(5);
    expect(stats['2019-8-30'].reservations).to.equal(2);
    expect(stats['2019-8-30'].blockedHours).to.equal(1);
    Object.keys(stats).forEach((k) => {
      expect(stats[k]).to.have.property('freeHours');
      expect(stats[k]).to.have.property('blockedHours');
      expect(stats[k]).to.have.property('reservations');
    });
  });
  it('throws error when range missig', async () => {
    await expect(service.stats.get({ from: '2019-08-25' })).to
      .be.rejectedWith('Date from and to required');
  });
});
