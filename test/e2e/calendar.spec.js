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
    it('creates new user', () => {
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
            console.log('ADIM U', res.body);
            checkUser = res.body;
            return res.body.token;
          })
          .then(token => request(app.callback())
            .post('/calendar')
            .set('Authorization', `Bearer ${token}`)
            .send(testCalendar)
            .expect(201)
            .then((res) => {
              console.log('CALENDAR ->', res.body);
              // expect(res.body.user).to.equal(checkUser.id);
              // expect(res.body.title).to.equal(reservation.title);
              // expect(res.body.hour).to.equal(reservation.hour);
              // expect(typeof res.body._id).to.equal('string');
            })));
    });
    // it('creates new user', () => {
    //   const userData = {
    //     email: 'test-reservation2@test.com',
    //     password: 'testPassword',
    //   };
    //   const reservation = {
    //     hour: 10,
    //     title: 'testREservation 1',
    //     day: '2019-9-13',
    //   };
    //   let checkUser;
    //   return request(app.callback())
    //     .post('/user')
    //     .send(userData)
    //     .expect(201)
    //     .then(() => {})
    //     .then(() => request(app.callback())
    //       .post('/user/login')
    //       .send(userData)
    //       .expect(200)
    //       .then((res) => {
    //         checkUser = res.body;
    //         return res.body.token;
    //       })
    //       .then(token => request(app.callback())
    //         .post('/reservation')
    //         .set('Authorization', `Bearer ${token}`)
    //         .send(reservation)
    //         .expect(422)
    //         .then((res) => {
    //           expect(res.body.error).to.equal('Hour already reserved');
    //         })));
    // });
  });
});
