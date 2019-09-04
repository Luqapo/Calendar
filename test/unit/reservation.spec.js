const { expect } = require('chai');

const service = require('../../service');
const Day = require('../../model/day');
const User = require('../../model/user');
const appInit = require('../../app');

describe('Reservation service', () => {
  before(async () => {
    await appInit();
    await User.deleteMany({});
    await Day.deleteMany({});
  });
  describe('set reservation', () => {
    it('makes new reservations', async () => {
      const createdUser = await service.user.create({
        email: 'testREserv@test.com',
        password: 'testreserv',
      });
      const check1 = await service.reservation.set({
        hour: 10,
        title: 'testREservation 1',
        date: '2019-8-30',
      }, createdUser.id);
      const check2 = await service.reservation.set({
        hour: 15,
        title: 'testREservation 2',
        date: '2019-8-30',
      }, createdUser.id);
      const checkDay = await Day.findOne({ date: '2019-8-30' });
      expect(checkDay.toJSON().reservations.find(r => String(r._id) === String(check1._id))).to
        .deep.equal(check1);
      expect(checkDay.toJSON().reservations.find(r => String(r._id) === String(check2._id))).to
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
        date: '2019-9-30',
      }, createdUser.id);
      await expect(service.reservation.set({
        hour: 10,
        title: 'testREservation 2',
        date: '2019-9-30',
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
        date: '2019-9-30',
      }, createdUser.id)).to.be.rejectedWith('Reservation not possible for this hour');
    });
    it('throws error when reservation hour blocked by admin', async () => {
      const createdUser = await service.user.create({
        email: 'testREserv3@test.com',
        password: 'testreserv',
      });
      await service.reservation.block({
        hour: 10,
        title: 'testREservation 1',
        date: '2019-10-1',
      }, createdUser.id);
      await expect(service.reservation.set({
        hour: 10,
        title: 'testREservation 2',
        date: '2019-10-1',
      }, createdUser.id)).to.be.rejectedWith('Hour blocked by admin');
    });
  });
  describe('block reservation', () => {
    it('makes new reservation with blocked status', async () => {
      const createdUser = await service.user.create({
        email: 'testREservBlock@test.com',
        password: 'testreserv',
      });
      const check1 = await service.reservation.block({
        hour: 10,
        title: 'testREservation 1',
        date: '2019-10-11',
      }, createdUser.id);
      expect(check1.blocked).to.equal(true);
      const checkDay = await Day.findOne({ date: '2019-10-11' });
      expect(checkDay.toJSON().reservations.find(r => String(r._id) === String(check1._id))).to
        .deep.equal(check1);
    });
    it('throws error when try to block already reserved hour', async () => {
      const createdUser = await service.user.create({
        email: 'testREservBlock2@test.com',
        password: 'testreserv',
      });
      await service.reservation.set({
        hour: 10,
        title: 'testREservation 1',
        date: '2019-11-11',
      }, createdUser.id);
      await expect(service.reservation.block({
        hour: 10,
        title: 'testREservation 1',
        date: '2019-11-11',
      }, createdUser.id)).to.be.rejectedWith('Hour already reserved');
    });
  });
  describe('getAll reservations', () => {
    before(async () => {
      await appInit();
      await User.deleteMany({});
      await Day.deleteMany({});
    });
    it('returns all reservations', async () => {
      const createdUser = await service.user.create({
        email: 'testREservA@test.com',
        password: 'testreserv',
      });
      const check1 = await service.reservation.set({
        hour: 10,
        title: 'testREservation 1',
        date: '2019-8-30',
      }, createdUser.id);
      const check2 = await service.reservation.set({
        hour: 15,
        title: 'testREservation 2',
        date: '2019-8-30',
      }, createdUser.id);
      await service.reservation.set({
        hour: 11,
        title: 'testREservation 3',
        date: '2019-9-6',
      }, createdUser.id);
      await service.reservation.set({
        hour: 8,
        title: 'testREservation 4',
        date: '2019-9-17',
      }, createdUser.id);
      const checkDay = await Day.findOne({ date: '2019-8-30' });
      expect(checkDay.toJSON().reservations.find(r => String(r._id) === String(check1._id))).to
        .deep.equal(check1);
      expect(checkDay.toJSON().reservations.find(r => String(r._id) === String(check2._id))).to
        .deep.equal(check2);
      const res = await service.reservation.getAll();
      const checkDays = await Day.find({});
      const all = [];
      checkDays.forEach(d => all.push(...d.reservations));
      expect(all.length).to.equal(res.length);
    });
  });
  describe('delete reservation', () => {
    before(async () => {
      await appInit();
      await User.deleteMany({});
      await Day.deleteMany({});
    });
    it('delete reservation', async () => {
      const createdUser = await service.user.create({
        email: 'testREservD@test.com',
        password: 'testreserv',
      });
      await service.reservation.set({
        hour: 10,
        title: 'testREservation 1',
        date: '2019-8-30',
      }, createdUser.id);
      const check2 = await service.reservation.set({
        hour: 15,
        title: 'testREservation 2',
        date: '2019-8-30',
      }, createdUser.id);
      await service.reservation.set({
        hour: 11,
        title: 'testREservation 3',
        date: '2019-9-6',
      }, createdUser.id);
      await service.reservation.set({
        hour: 8,
        title: 'testREservation 4',
        date: '2019-9-17',
      }, createdUser.id);
      await service.reservation.deleteReservation(check2);
      const day = await Day.findOne({ date: '2019-8-30' });
      const checkDlete = day.reservations.id(check2._id);
      expect(checkDlete).to.equal(null);
    });
  });
  describe('confirm reservation', () => {
    it('confirm reservation', async () => {
      const createdUser = await service.user.create({
        email: 'testREservConf@test.com',
        password: 'testreserv',
      });
      const res = await service.reservation.set({
        hour: 10,
        title: 'testREservation 1',
        date: '2019-10-2',
      }, createdUser.id);
      await service.reservation.confirm(res);
      const day = await Day.findOne({ date: res.date });
      const checkeConfirm = day.reservations.id(res._id);
      expect(checkeConfirm.confirmed).to.equal(true);
    });
  });
  describe('get user reservations', () => {
    before(async () => {
      await appInit();
      await User.deleteMany({});
      await Day.deleteMany({});
    });
    it('returns all user reservations', async () => {
      const createdUser = await service.user.create({
        email: 'testREserAll@test.com',
        password: 'testreserv',
      });
      await service.reservation.set({
        hour: 13,
        title: 'testREservation 1',
        date: '2019-8-30',
      }, createdUser.id);
      await service.reservation.set({
        hour: 16,
        title: 'testREservation 2',
        date: '2019-8-30',
      }, createdUser.id);
      await service.reservation.set({
        hour: 12,
        title: 'testREservation 2',
        date: '2019-11-11',
      }, createdUser.id);
      const createdUser2 = await service.user.create({
        email: 'testREserAl2l@test.com',
        password: 'testreserv',
      });
      await service.reservation.set({
        hour: 11,
        title: 'testREservation 1',
        date: '2019-9-30',
      }, createdUser2.id);
      await service.reservation.set({
        hour: 8,
        title: 'testREservation 2',
        date: '2019-8-30',
      }, createdUser2.id);
      await service.reservation.set({
        hour: 15,
        title: 'testREservation 2',
        date: '2019-11-11',
      }, createdUser2.id);
      const all = await service.reservation.getUserRservetions(createdUser2.id);
      expect(all.length).to.equal(3);
      expect(all.find(r => String(r.user) === String(createdUser.id))).to.equal(undefined);
    });
  });
});
