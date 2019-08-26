const { expect } = require('chai');
const sinon = require('sinon');

const userService = require('../../service/user');
const User = require('../../model/user');
const appInit = require('../../app');

let app;

describe('User service', () => {
  before(async () => {
    app = await appInit();
    await User.deleteMany({});
  });

  it.only('creates user with correct fields and hashed secret, returns user and token', async () => {
    const testUser = {
      email: 'createTestUserName',
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

  it.only('returns user by id', async () => {
    const testUser = await userService.create({ email: 'find user test name', password: 'findUser' });
    const user = await userService.get(testUser.id);
    expect(String(user._id)).to.equal(String(testUser.id));
    expect(user.email).to.equal(testUser.email);
    expect(user.password).to.be.a('string');
    expect(user.createdAt instanceof Date).to.equal(true);
    expect(user.updatedAt instanceof Date).to.equal(true);
  });

  it.only('returns user\'s public fields', async () => {
    const testUser = await userService.create({ email: 'public fields test', password: 'publicFields' });
    const user = await userService.get(testUser.id);
    const userPublic = user.getPublicFields();
    expect(userPublic).to.have.property('id');
    expect(userPublic).to.have.property('email');
    expect(String(userPublic.id)).to.equal(String(testUser.id));
    expect(userPublic.email).to.equal(testUser.email);
    expect(userPublic.createdAt instanceof Date).to.equal(true);
  });

  it('updates user and returns updated user', async () => {
    const testUser = await userService.create({ name: 'update user test' }, app.context.content);
    const updates = { name: 'someUpdatedName' };
    const updatedUser = await userService.update(testUser.uid, updates);
    expect(updatedUser.uid).to.equal(testUser.uid);
    expect(updatedUser.name).to.equal(updates.name);
    expect(updatedUser.hSecret).to.be.a('string');
    expect(updatedUser.createdAt instanceof Date).to.equal(true);
    expect(updatedUser.updatedAt instanceof Date).to.equal(true);
    const updatedUserDb = await User.findById(User.idFromUid(testUser.uid));
    expect(updatedUser).to.deep.equal(updatedUserDb);
  });
});
