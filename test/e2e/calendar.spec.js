const request = require('supertest');
const { expect } = require('chai');

const appInit = require('../../app');
const User = require('../../model/user');
const Calendar = require('../../model/calendar');
const service = require('../../service');

let app;

describe('Calendar endpoints', () => {
  before(async () => {
    app = await appInit();
    await User.deleteMany({});
    await Calendar.deleteMany({});
  });
  describe('POST /calendar', () => {
    it('creates new calendar', async () => {
      const userData = {
        email: 'test-admin1@test.com',
        password: 'testPassword',
        admin: true,
      };
      await service.user.create(userData);
      const testCalendar = {
        workStart: 8,
        workEnd: 16,
        daysFree: [
          { date: '2019-9-1' }, { date: '2019-9-2' }, { date: '2019-9-14' }, { date: '2019-9-25' },
        ],
      };
      return request(app.callback())
        .post('/user/login')
        .send(userData)
        .expect(200)
        .then(res => res.body.token)
        .then(token => request(app.callback())
          .post('/calendar')
          .set('Authorization', `Bearer ${token}`)
          .send(testCalendar)
          .expect(201)
          .then((res) => {
            delete res.body._id;
            delete res.body.__v;
            res.body.daysFree.forEach(d => delete d._id);
            expect(res.body).to.deep.equal(testCalendar);
          }));
    });
    it('returns 422 when missing workStart', async () => {
      const userData = {
        email: 'test-admin2@test.com',
        password: 'testPassword',
        admin: true,
      };
      await service.user.create(userData);
      const testCalendar = {
        workEnd: 16,
        daysFree: [
          { date: '2019-9-1' }, { date: '2019-9-2' }, { date: '2019-9-14' }, { date: '2019-9-25' },
        ],
      };
      return request(app.callback())
        .post('/user/login')
        .send(userData)
        .expect(200)
        .then(res => res.body.token)
        .then(token => request(app.callback())
          .post('/calendar')
          .set('Authorization', `Bearer ${token}`)
          .send(testCalendar)
          .expect(422)
          .then((res) => {
            expect(res.body.error).to.equal('workStart and workEnd hour required');
          }));
    });
  });
  describe('GET /calendar', () => {
    it('reutrns 200 and calendar for user', () => {
      const userData = {
        email: 'test-calendarGetUser@test.com',
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
            .get('/calendar')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then((res) => {
              expect(typeof res.body).to.equal('object');
            })));
    });
    it('reutrns 200 and calendar for admin', async () => {
      const user2Data = {
        email: 'testADminCAl@test.com',
        password: 'testPassword',
        admin: true,
      };
      await service.user.create(user2Data);
      return request(app.callback())
        .post('/user/login')
        .send(user2Data)
        .expect(200)
        .then(res => res.body.token)
        .then(token => request(app.callback())
          .get('/calendar')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then((res) => {
            expect(typeof res.body).to.equal('object');
          }));
    });
  });
});
