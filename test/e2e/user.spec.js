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
        email: 'api-user-test1@test.com',
        password: 'testPassword',
      };
      let checkUser;
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
          checkUser = res.body;
          return res.body.token;
        })
        .then(token => request(app.callback())
          .get('/user')
          .set('Authorization', `Bearer ${token}`)
          .expect(200)
          .then((res) => {
            delete checkUser.token;
            expect(res.body).to.deep.equal(checkUser);
          }));
    });
    it('throws error (Account whit this email already exist) when email is missing', () => {
      const userData = {
        email: 'api-user-test1@test.com',
        password: 'testPassword',
      };
      return request(app.callback())
        .post('/user')
        .send(userData)
        .expect(422)
        .then(async (res) => {
          expect(res.body.error).to.equal('Account with this email already exist');
        });
    });
    it('throws error Passwor required when password is missing', () => {
      const userData = {
        email: 'api-user-test2@test.com',
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
        email: 'api-user-test3@test.com',
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
    it('throws error (Email required) when email is missing', () => {
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
  describe('POST /user/login', () => {
    it('returns 200 and token', async () => {
      it('creates new user', () => {
        const userData = {
          email: 'api-user-test1@test.com',
          password: 'testPassword',
        };
        return request(app.callback())
          .post('/user/login')
          .send(userData)
          .expect(200)
          .then(async (res) => {
            expect(res.body).to.have.property('id');
            expect(res.body).to.have.property('email');
            expect(res.body).to.have.property('createdAt');
            expect(res.body.id).to.be.a('string');
            expect(res.body.email).to.equal(userData.email);
            const userFromDb = await User.findOne({ _id: res.body.id });
            expect(userFromDb.email).to.equal(res.body.email);
            expect(res.body.token).to.be.an('string');
          });
      });
    });
  });
});
