const request = require('supertest');
const { expect } = require('chai');

const appInit = require('../../app');
const User = require('../../model/user');

let app;

describe('User endpoints', () => {
  before(async () => {
    app = await appInit();
    await User.deleteMany({});
  });
  describe('POST /user', () => {
    it('creates new user', () => {
      const userData = {
        email: 'api-user-test@test.com',
        password: 'testPassword',
      };
      return request(app.callback())
        .post('/user')
        .send(userData)
        .expect(201)
        .then(async (res) => {
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('email');
          expect(res.body).to.have.property('createdAt');
          expect(res.body.id).to.be.a('string');
          expect(res.body.email).to.equal(userData.email);
          const userFromDb = await User.findOne({ _id: res.body.id });
          expect(userFromDb.email).to.equal(res.body.email);
          expect(res.body.token).to.be.an('string');
          return res.body.token;
        })
        .then(sid => request(app.callback())
          .get('/user')
          .set('Authorization', `Bearer ${sid}`)
          .expect(200));
    });
    it('throws error Passwor required when password is missing', () => {
      const userData = {
        email: 'api-user-test@test.com',
      };
      return request(app.callback())
        .post('/user')
        .send(userData)
        .expect(422)
        .then(async (res) => {
          expect(res.body.error).to.equal('Password required, minimal length 6 characters');
        });
    });
    it('throws error Passwor required when password is to short', () => {
      const userData = {
        email: 'api-user-test@test.com',
        password: 'test',
      };
      return request(app.callback())
        .post('/user')
        .send(userData)
        .expect(422)
        .then(async (res) => {
          expect(res.body.error).to.equal('Password required, minimal length 6 characters');
        });
    });
    it('throws error Email required when email is missing', () => {
      const userData = {
        password: 'testPassword',
      };
      return request(app.callback())
        .post('/user')
        .send(userData)
        .expect(422)
        .then(async (res) => {
          expect(res.body.error).to.equal('Email required');
        });
    });
  });
});
