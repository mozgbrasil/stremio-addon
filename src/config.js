var config = {};

var env = process.env.NODE_ENV;

switch (env) {
  case 'production':
    config.port = process.env.PORT;
    config.local = process.env.APP_URL;
    break;
  case 'development':
  case undefined:
    config.port = 7000;
    config.local = process.env.APP_URL + ':' + config.port;
    break;
}

module.exports = {
  config,
};
