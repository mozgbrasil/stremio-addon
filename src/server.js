const { serveHTTP } = require('stremio-addon-sdk');
const addonInterface = require('./addon');
const { getConfig, getSentry, getRollbar, getLogzio } = require('./base');

getSentry();
getRollbar();

addonInterface().then((addonInterface) => {
  getLogzio().info(
    'addonInterface | ' +
      '' +
      getConfig().local +
      ' - ' +
      getConfig().port +
      '',
    'SERVEHTTP'
  );
  serveHTTP(addonInterface, {
    port: getConfig().port,
  });
});

//
