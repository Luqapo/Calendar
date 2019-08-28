const request = require('supertest');
const { expect } = require('chai');

const appInit = require('../../app');
const User = require('../../model/user');
const Day = require('../../model/day');

let app;

describe('Reservation endpoints', () => {
  before(async () => {
    app = await appInit();
    await User.deleteMany({});
    await Day.deleteMany({});
  });
  describe('POST /reservation', () => {
    it('creates new user', () => {
      const userData = {
        email: 'test-reservation1@test.com',
        password: 'testPassword',
      };
      const reservation = {
        hour: 10,
        title: 'testREservation 1',
        day: '2019-9-13',
      };
      let checkUser;
      return request(app.callback())
        .post('/user')
        .send(userData)
        .expect(201)
        .then(() => {})
        .then(() => request(app.callback())
          .post('/user/login')
          .send(userData)
          .expect(200)
          .then((res) => {
            checkUser = res.body;
            return res.body.token;
          })
          .then(token => request(app.callback())
            .post('/reservation')
            .set('Authorization', `Bearer ${token}`)
            .send(reservation)
            .expect(201)
            .then((res) => {
              expect(res.body.user).to.equal(checkUser.id);
              expect(res.body.title).to.equal(reservation.title);
              expect(res.body.hour).to.equal(reservation.hour);
              expect(typeof res.body._id).to.equal('string');
            })));
    });
    it('creates new user', () => {
      const userData = {
        email: 'test-reservation2@test.com',
        password: 'testPassword',
      };
      const reservation = {
        hour: 10,
        title: 'testREservation 1',
        day: '2019-9-13',
      };
      let checkUser;
      return request(app.callback())
        .post('/user')
        .send(userData)
        .expect(201)
        .then(() => {})
        .then(() => request(app.callback())
          .post('/user/login')
          .send(userData)
          .expect(200)
          .then((res) => {
            checkUser = res.body;
            return res.body.token;
          })
          .then(token => request(app.callback())
            .post('/reservation')
            .set('Authorization', `Bearer ${token}`)
            .send(reservation)
            .expect(422)
            .then((res) => {
              expect(res.body.error).to.equal('Hour already reserved');
            })));
    });
  });
});
