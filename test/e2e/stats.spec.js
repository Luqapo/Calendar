const request = require('supertest');
const { expect } = require('chai');

const appInit = require('../../app');
const User = require('../../model/user');
const Calendar = require('../../model/calendar');
const service = require('../../service');

let app;

describe('Stats endpoints', () => {
  before(async () => {
    app = await appInit();
    await User.deleteMany({});
    await Calendar.deleteMany({});
  });
  describe('Get /stats', () => {
    it('returns 200 and stats from spec date to date for admin', async () => {
      const testCalendar = {
        workStart: 8,
        workEnd: 16,
        daysFree: [
        ],
      };
      await service.calendar.set(testCalendar);
      const userData = {
        email: 'test-adminStats@test.com',
        password: 'testPassword',
        admin: true,
      };
      return request(app.callback())
        .post('/user')
        .send(userData)
        .expect(201)
        .then(() => {})
        .then(() => request(app.callback())
          .post('/user/login')
          .send(userData)
          .expect(200)
          .then(res => res.body.token)
          .then(token => request(app.callback())
            .get('/stats')
            .set('Authorization', `Bearer ${token}`)
            .send({ from: '2019-08-25', to: '2019-09-25' })
            .expect(200)
            .then((res) => {
              const stats = res.body;
              Object.keys(stats).forEach((k) => {
                expect(stats[k]).to.have.property('freeHours');
                expect(stats[k]).to.have.property('blockedHours');
                expect(stats[k]).to.have.property('reservations');
              });
            })));
    });
    it('returns 200 and stats from spec date to date for user', async () => {
      const testCalendar = {
        workStart: 8,
        workEnd: 16,
        daysFree: [
        ],
      };
      await service.calendar.set(testCalendar);
      const userData = {
        email: 'test-userStats@test.com',
        password: 'testPassword',
      };
      return request(app.callback())
        .post('/user')
        .send(userData)
        .expect(201)
        .then(() => {})
        .then(() => request(app.callback())
          .post('/user/login')
          .send(userData)
          .expect(200)
          .then(res => res.body.token)
          .then(token => request(app.callback())
            .get('/stats')
            .set('Authorization', `Bearer ${token}`)
            .send({ from: '2019-08-25', to: '2019-08-30' })
            .expect(200)
            .then((res) => {
              const stats = res.body;
              expect(Object.keys(stats).length).to.equal(6);
              Object.keys(stats).forEach((k) => {
                expect(stats[k]).to.have.property('freeHours');
                expect(stats[k]).to.have.property('blockedHours');
                expect(stats[k]).to.have.property('reservations');
              });
            })));
    });
  });
});
