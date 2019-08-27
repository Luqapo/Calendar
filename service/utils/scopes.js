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
    // service status, to enable automated health check
    path: /^\/status\/?$/,
    method: 'GET',
    scope: 'public',
  },
];
