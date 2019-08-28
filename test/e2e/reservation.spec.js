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
    it.only('sets reservation for day and hour', () => {
      const userData = {
        email: 'test-reservation1@test.com',
        password: 'testPassword',
      };
      const reservation = {
        hour: 10,
        title: 'testREservation 1',
        date: '2019-9-13',
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
    it('returns 422 and error(Hour already reserved) when hour was reserved before', () => {
      const userData = {
        email: 'test-reservation2@test.com',
        password: 'testPassword',
      };
      const reservation = {
        hour: 10,
        title: 'testREservation 1',
        date: '2019-9-13',
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
  describe('POST /reservation/block', () => {
    it.only('blocks hour and return 201', () => {
      const userData = {
        email: 'test-reservationblock1@test.com',
        password: 'testPassword',
        admin: true,
      };
      const reservation = {
        hour: 10,
        title: 'testREservation 1',
        date: '2019-9-14',
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
            .post('/reservation/block')
            .set('Authorization', `Bearer ${token}`)
            .send(reservation)
            .expect(201)
            .then((res) => {
              expect(res.body.user).to.equal(checkUser.id);
              expect(res.body.title).to.equal(reservation.title);
              expect(res.body.hour).to.equal(reservation.hour);
              expect(res.body.blocked).to.equal(true);
              expect(typeof res.body._id).to.equal('string');
            })));
    });
    it('returns 401 nad error(Unauthorized) if user is not a admin', () => {
      const userData = {
        email: 'test-reservationblock2@test.com',
        password: 'testPassword',
      };
      const reservation = {
        hour: 10,
        title: 'testREservation 1',
        date: '2019-9-13',
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
            .post('/reservation/block')
            .set('Authorization', `Bearer ${token}`)
            .send(reservation)
            .expect(401)
            .then((res) => {
              expect(res.body.error).to.equal('Unauthorized!');
            })));
    });
  });
  describe('GET /reservation', () => {
    it.only('returns all reservations', () => {
      const userData = {
        email: 'test-reservationGet1@test.com',
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
            .get('/reservation')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .then(async (res) => {
              console.log('RES ->', res.body);
              const all = [];
              const days = await Day.find({});
              days.forEach(d => all.push(...d.reservations));
              expect(res.body).to.equal(all.map(i => i._doc));
            })));
    });
  });
});
