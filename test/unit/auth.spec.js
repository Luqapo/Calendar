const mongoose = require('mongoose');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');

const service = require('../../service');

const User = require('../../model/user');

const env = process.env.NODE_ENV || 'test';
const config = require('../../config/config')[env];

chai.use(chaiAsPromised);
chai.use(require('sinon-chai'));

const appInit = require('../../app');

const { expect } = chai;

describe('Auth service', () => {
  before(async () => {
    await appInit();
    await User.deleteMany({});
  });
  afterEach(() => sinon.restore());

  it('provides middleware for parsing authorization header into it\'s associated user', async () => {
    const user = await service.user.create({ email: 'test-user', password: 'findUser' });
    const token = {
      email: 'test-user',
      userId: user.id,
      expires: Date.now() + 3600,
    };
    const ctx = {
      path: '/test',
      method: 'POST',
      state: {},
      set(h, v) {
        ctx.request[h.toLowerCase] = v;
      },
      get(h) {
        return ctx.request[h.toLowerCase()];
      },
      request: {
        authorization: 'Bearer test-token',
      },
    };
    const next = sinon.spy();
    const verifySpy = sinon.stub(jwt, 'verify').returns(token);
    const userFindSpy = sinon.stub(User, 'findById').returns(user);
    await service.auth.middleware([{
      path: /^\/test/,
      method: 'POST',
      scope: 'user',
    }])(ctx, next);
    expect(verifySpy).to.have.been.calledWith('test-token', config.secret);
    expect(userFindSpy).to.have.been.calledWith(user.id);
    expect(ctx.state.user).to.deep.equal(user);
    expect(next).to.have.been.calledWith();
  });

  it('Properly handles incorrect tokens', async () => {
    const ctx = {
      path: '/test',
      method: 'GET',
      state: {},
      set(h, v) {
        ctx.request[h.toLowerCase] = v;
      },
      get(h) {
        return ctx.request[h.toLowerCase()];
      },
      request: {
        // note no 'Bearer ' part, header is invalid
        authorization: 'test-token',
      },
      throw: sinon.stub().throwsArg(1),
    };
    const next = sinon.spy();
    await expect(service.auth.middleware([{
      path: /^\/test/,
      method: 'GET',
      scope: 'user',
    }])(ctx, next))
      .to.eventually.be.rejectedWith('Unauthorized');
    expect(ctx.throw).to.have.been.calledWith(401, 'Unauthorized');
  });

  it('Properly handles verify incorrect tokens', async () => {
    const ctx = {
      path: '/test',
      method: 'GET',
      state: {},
      set(h, v) {
        ctx.request[h.toLowerCase] = v;
      },
      get(h) {
        return ctx.request[h.toLowerCase()];
      },
      request: {
        // note no 'Bearer ' part, header is invalid
        authorization: 'Bearer test-token',
      },
      throw: sinon.stub().throwsArg(1),
    };
    const next = sinon.spy();
    const verifySpy = sinon.stub(jwt, 'verify').returns(null);
    await expect(service.auth.middleware([{
      path: /^\/test/,
      method: 'GET',
      scope: 'user',
    }])(ctx, next))
      .to.eventually.be.rejectedWith('Not authenticated');
    expect(ctx.throw).to.have.been.calledWith(401, 'Not authenticated');
    expect(verifySpy).to.have.been.calledWith('test-token', config.secret);
  });

  it('Properly handles request without token when scope is public', async () => {
    const ctx = {
      path: '/test',
      method: 'GET',
      state: {},
      set(h, v) {
        ctx.request[h.toLowerCase] = v;
      },
      get(h) {
        return ctx.request[h.toLowerCase()];
      },
      request: {
        // note no 'Bearer ' part, header is invalid
        authorization: 'Bearer test-token',
      },
      throw: sinon.stub().throwsArg(1),
    };
    const next = sinon.spy();
    const verifySpy = sinon.stub(jwt, 'verify').returns(null);
    await expect(service.auth.middleware([{
      path: /^\/test/,
      method: 'GET',
      scope: 'public',
    }])(ctx, next));
    expect(verifySpy).not.to.have.been.calledWith('test-token', config.secret);
    expect(next).to.have.been.calledWith();
  });

  it('Properly handles verify incorrect tokens', async () => {
    const ctx = {
      path: '/test',
      method: 'GET',
      state: {},
      set(h, v) {
        ctx.request[h.toLowerCase] = v;
      },
      get(h) {
        return ctx.request[h.toLowerCase()];
      },
      request: {
        // note no 'Bearer ' part, header is invalid
        authorization: 'Bearer test-token',
      },
      throw: sinon.stub().throwsArg(1),
    };
    const next = sinon.spy();
    const verifySpy = sinon.stub(jwt, 'verify').throws(new Error());
    await expect(service.auth.middleware([{
      path: /^\/test/,
      method: 'GET',
      scope: 'user',
    }])(ctx, next))
      .to.eventually.be.rejectedWith('Auth fail!');
    expect(ctx.throw).to.have.been.calledWith(500, 'Auth fail!');
    expect(verifySpy).to.have.been.calledWith('test-token', config.secret);
  });
});
