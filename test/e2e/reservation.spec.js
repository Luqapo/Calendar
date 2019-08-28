const request = require('supertest');
const { expect } = require('chai');

const appInit = require('../../app');
const User = require('../../model/user');
const Day = require('../../model/day');
const service = require('../../service');

let app;

describe('Reservation endpoints', () => {
  before(async () => {
    app = await appInit();
    await User.deleteMany({});
    await Day.deleteMany({});
  });
  describe('POST /reservation', () => {
    it('sets reservation for day and hour', () => {
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
    it('blocks hour and return 201', async () => {
      const userData = {
        email: 'test-reservationblock1@test.com',
        password: 'testPassword',
        admin: true,
      };
      await service.user.create(userData);
      const reservation = {
        hour: 10,
        title: 'testREservation 1',
        date: '2019-9-14',
      };
      let checkUser;
      return request(app.callback())
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
          }));
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
    it('returns all reservations', async () => {
      const userData = {
        email: 'test-reservationGet1@test.com',
        password: 'testPassword',
        admin: true,
      };
      await service.user.create(userData);
      return request(app.callback())
        .post('/user/login')
        .send(userData)
        .expect(200)
        .then(res => res.body.token)
        .then(token => request(app.callback())
          .get('/reservation')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then(async (res) => {
            const all = [];
            const days = await Day.find({});
            days.forEach(d => all.push(...d.reservations));
            expect(res.body.length).to.equal(all.length);
          }));
    });
  });
  describe('DELTE /reservation', () => {
    it('delete reservation', () => {
      const userData = {
        email: 'test-reservationD@test.com',
        password: 'testPassword',
      };
      const reservation = {
        hour: 10,
        title: 'testREservation 1',
        date: '2019-9-23',
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
            .post('/reservation')
            .set('Authorization', `Bearer ${token}`)
            .send(reservation)
            .expect(201)
            .then(res => res.body)
            .then(r => request(app.callback())
              .delete('/reservation')
              .set('Authorization', `Bearer ${token}`)
              .send(r)
              .expect(204)
              .then(async () => {
                const day = await Day.findOne({ date: reservation.date });
                expect(day.reservations.length).to.equal(0);
              }))));
    });
  });
  describe('POST /reservation/confirm', () => {
    it('sets reservation for day and hour', async () => {
      const userData = {
        email: 'test-reservationCo@test.com',
        password: 'testPassword',
      };
      const adminData = {
        email: 'test-Admin-Coo@test.com',
        password: 'testPassword',
        admin: true,
      };
      const admin = await service.user.create(adminData);
      const reservation = {
        hour: 10,
        title: 'testREservation 1',
        date: '2019-9-27',
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
            .post('/reservation')
            .set('Authorization', `Bearer ${token}`)
            .send(reservation)
            .expect(201)
            .then(res => res.body)
            .then(rese => request(app.callback())
              .post('/reservation/confirm')
              .set('Authorization', `Bearer ${admin.token}`)
              .send(rese)
              .expect(204))));
    });
  });
  describe('GET /reservation/mine', () => {
    before(async () => {
      await User.deleteMany({});
      await Day.deleteMany({});
    });
    it('returns all user reservations', async () => {
      const userData = {
        email: 'test-reservationGU@test.com',
        password: 'testPassword',
      };
      const user2Data = {
        email: 'testU-Coo@test.com',
        password: 'testPassword',
      };
      const user2 = await service.user.create(user2Data);
      await service.reservation.set({
        hour: 11,
        title: 'testREservation 1',
        date: '2019-9-30',
      }, user2.id);
      await service.reservation.set({
        hour: 8,
        title: 'testREservation 2',
        date: '2019-8-30',
      }, user2.id);
      await service.reservation.set({
        hour: 15,
        title: 'testREservation 2',
        date: '2019-11-11',
      }, user2.id);
      const reservation = {
        hour: 10,
        title: 'testREservation 1',
        date: '2019-9-27',
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
            .post('/reservation')
            .set('Authorization', `Bearer ${token}`)
            .send(reservation)
            .expect(201)
            .then(res => res.body)
            .then(() => request(app.callback())
              .get('/reservation/mine')
              .set('Authorization', `Bearer ${user2.token}`)
              .expect(200)
              .then((res) => {
                expect(res.body.length).to.equal(3);
                expect(res.body.filter(it => String(it.user) === String(user2.id)).length)
                  .to.equal(3);
              }))));
    });
  });
});
