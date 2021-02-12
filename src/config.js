var config = {};

var env = process.env.NODE_ENV;

switch (env) {
  case 'production':
    config.port = process.env.PORT;
    config.local = 'https://9b7c457c25d2-stremio-addon.baby-beamup.club/';
    break;
  case 'development':
  case undefined:
    config.port = 7000;
    config.local = 'http://127.0.0.1:' + config.port;
    break;
}

module.exports = {
  config,
};
