const { serveHTTP } = require('stremio-addon-sdk');
const addonInterface = require('./addon');
const logger = require('./logger.js');
const sentry = require('./sentry');
const { config } = require('./config');
const package_manifest = require('../package.json');

//

addonInterface().then((addonInterface) => {
  logger.info('addonInterface | ' + '' + config.local + '', 'SERVEHTTP');
  serveHTTP(addonInterface, {
    port: config.port,
  });
});

//
