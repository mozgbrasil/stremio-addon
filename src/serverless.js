const { getRouter } = require('stremio-addon-sdk');
const addonInterface = require('./addon');
const logger = require('./logger.js');
const sentry = require('./sentry');
const { config } = require('./config');
const package_manifest = require('../package.json');
const { getManifest } = require('./manifest');

//

const router = getRouter({ ...addonInterface, manifest: getManifest() });

// console.log('router: ', router);

router.get('/', async (req, res) => {
  console.log('router: ', '/');
  // console.log('req: ', req);
  // console.log('res: ', res);
  // res.redirect('/configure');
  // res.end();
  res.send('Hello');
});

router.get('/manifest.json', (req, res) => {
  const manifestBuf = JSON.stringify(getManifest());
  console.log('router req: ', req);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(manifestBuf);
});

module.exports = function (req, res) {
  router(req, res, function () {
    res.statusCode = 404;
    res.end();
  });
};

//
