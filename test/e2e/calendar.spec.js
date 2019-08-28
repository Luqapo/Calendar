const request = require('supertest');
const { expect } = require('chai');

const appInit = require('../../app');
const User = require('../../model/user');
const Calendar = require('../../model/calendar');

let app;

describe('Calendar endpoints', () => {
  before(async () => {
    app = await appInit();
    await User.deleteMany({});
    await Calendar.deleteMany({});
  });
  describe('POST /calendar', () => {
    it('creates new calendar', () => {
      const userData = {
        email: 'test-admin1@test.com',
        password: 'testPassword',
        admin: true,
      };
      const testCalendar = {
        workStart: 8,
        workEnd: 16,
        daysFree: [
          { date: '2019-9-1' }, { date: '2019-9-2' }, { date: '2019-9-14' }, { date: '2019-9-25' },
        ],
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
            .post('/calendar')
            .set('Authorization', `Bearer ${token}`)
            .send(testCalendar)
            .expect(201)
            .then((res) => {
              delete res.body._id;
              delete res.body.__v;
              res.body.daysFree.forEach(d => delete d._id);
              expect(res.body).to.deep.equal(testCalendar);
            })));
    });
    it('returns 422 when missing workStart', () => {
      const userData = {
        email: 'test-admin2@test.com',
        password: 'testPassword',
        admin: true,
      };
      const testCalendar = {
        workEnd: 16,
        daysFree: [
          { date: '2019-9-1' }, { date: '2019-9-2' }, { date: '2019-9-14' }, { date: '2019-9-25' },
        ],
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
            .post('/calendar')
            .set('Authorization', `Bearer ${token}`)
            .send(testCalendar)
            .expect(422)
            .then((res) => {
              expect(res.body.error).to.equal('workStart and workEnd hour required');
            })));
    });
  });
});
