const { expect } = require('chai');

const userService = require('../../service/user');
const User = require('../../model/user');
const appInit = require('../../app');

let app;

describe('User service', () => {
  before(async () => {
    app = await appInit();
    await User.deleteMany({});
  });

  it('creates user with correct fields and hashed secret, returns user and token', async () => {
    const testUser = {
      email: 'createTestUserName@test.com',
      password: 'testPassword',
    };
    const createdUser = await userService.create(testUser);
    expect(createdUser.email).to.equal(testUser.email);
    expect(createdUser.createdAt instanceof Date).to.equal(true);
    const dbUser = await User.findOne({ email: createdUser.email });
    expect(dbUser.email).to.equal(testUser.email);
    expect(dbUser.password).to.be.a('string');
    expect(dbUser.createdAt instanceof Date).to.equal(true);
    expect(dbUser.updatedAt instanceof Date).to.equal(true);
  });

  it('returns user by id', async () => {
    const testUser = await userService.create({ email: 'findName@test.com', password: 'findUser' });
    const user = await userService.get(testUser.id);
    expect(String(user._id)).to.equal(String(testUser.id));
    expect(user.email).to.equal(testUser.email);
    expect(user.password).to.be.a('string');
    expect(user.createdAt instanceof Date).to.equal(true);
    expect(user.updatedAt instanceof Date).to.equal(true);
  });

  it('returns user\'s public fields', async () => {
    const testUser = await userService.create({ email: 'publicTest@test.com', password: 'publicFields' });
    const user = await userService.get(testUser.id);
    const userPublic = user.getPublicFields();
    expect(userPublic).to.have.property('id');
    expect(userPublic).to.have.property('email');
    expect(String(userPublic.id)).to.equal(String(testUser.id));
    expect(userPublic.email).to.equal(testUser.email);
    expect(userPublic.createdAt instanceof Date).to.equal(true);
  });
  it('ligin user and return token', async () => {
    const testUser = await userService.create({ email: 'loginTest@test.com', password: 'loginFields' });
    delete testUser.token;
    const checkLogin = await userService.login({ email: testUser.email, password: 'loginFields' });
    delete checkLogin.token;
    expect(testUser).to.deep.equal(checkLogin);
  });
  it('throws error when user dont found', async () => {
    await expect(userService.login({ email: 'testUser.email', password: 'loginFields' })).to
      .be.rejectedWith('User not found');
  });
  it('throws error when try to login with wrong password', async () => {
    const testUser = await userService.create({ email: 'loginTest1@test.com', password: 'loginFields' });
    await expect(userService.login({ email: testUser.email, password: 'loginCheck' })).to
      .be.rejectedWith('Wrong password');
  });
});
