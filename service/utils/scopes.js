module.exports = [
  {
    path: /^\/doc/,
    method: 'GET',
    scope: 'public',
  }, {
    path: /^\/auth\/login/,
    method: 'POST',
    scope: 'public',
  }, {
    path: /^\/auth\/logout/,
    method: 'POST',
    scope: 'public',
  }, {
    // creating user
    path: /^\/user\/?$/,
    method: 'POST',
    scope: 'public',
  }, {
    // getting own user
    path: /^\/user\/?$/,
    method: 'GET',
    scope: 'user',
  }, {
    // service status, to enable automated health check
    path: /^\/status\/?$/,
    method: 'GET',
    scope: 'public',
  }, {
    // creating user
    path: /^\/reservation\/block\/?$/,
    method: 'POST',
    scope: 'admin',
  }, {
    // creating user
    path: /^\/reservation\/?$/,
    method: 'POST',
    scope: 'user',
  },
  {
    // creating user
    path: /^\/reservation\/?$/,
    method: 'GET',
    scope: 'admin',
  }, {
    // creating user
    path: /^\/calendar\/?$/,
    method: 'POST',
    scope: 'admin',
  },
];
