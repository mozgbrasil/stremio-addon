//

function getConfig() {
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

  return config;
}

//

function isNumeric(value) {
  return /^\d+$/.test(value);
}

//

const package_manifest = require('../package.json');

//

const captureMessage =
  '' +
  package_manifest.version +
  ' | ' +
  getConfig().local +
  ' | ' +
  __filename;

// console.log('process.env: ', process.env);

//

function getSentry() {
  if (process.env.APP_SENTRY_DSN) {
    const Sentry = require('@sentry/node');
    const { Integrations } = require('@sentry/tracing');
    var name = package_manifest.name;
    name = name.replace('@', '');
    name = name.replace('/', '-');
    name += `-${process.env.APP_ID}`;
    var version = package_manifest.version;
    var release = name + '@' + version;
    const parameters = {
      dsn: process.env.APP_SENTRY_DSN,
      // To set your release version
      release: release,
      integrations: [new Integrations.BrowserTracing()],
      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    };

    Sentry.init(parameters);

    // Set user information, as well as tags and further extras
    Sentry.configureScope((scope) => {
      scope.setExtra('battery', 0.7);
      scope.setTag('user_mode', 'admin');
      scope.setUser({ id: '4711' });
      // scope.setExtra('env', process.env);
      // scope.clear();
    });

    // Add a breadcrumb for future events
    Sentry.addBreadcrumb({
      message: 'My Breadcrumb',
    });

    Sentry.captureMessage(captureMessage);

    // myUndefinedFunction(); // This snippet includes an intentional error, so you can test that everything is working as soon as you set it up:

    console.log('Sentry: ', 'Sentry');
  }
}

function getRollbar() {
  if (process.env.APP_ROLLBAR_DSN) {
    // Send a Message to Rollbar
    // include and initialize the rollbar library with your access token
    var Rollbar = require('rollbar');
    var rollbar = new Rollbar({
      accessToken: process.env.APP_ROLLBAR_DSN,
      captureUncaught: true,
      captureUnhandledRejections: true,
    });

    // record a generic message and send it to Rollbar
    rollbar.log(captureMessage);

    console.log('rollbar: ', 'rollbar');
  }
}

function getLogzio() {
  if (
    !process.env.APP_LOGGER_TOKEN ||
    process.env.APP_LOGGER_TOKEN === 'false'
  ) {
    var obj = {
      debug: function () {
        console.log('APP_LOGGER_TOKEN: false');
      },
      info: function () {
        console.log('APP_LOGGER_TOKEN: false');
      },
      error: function () {
        console.log('APP_LOGGER_TOKEN: false');
      },
    };

    // console.log('obj: ', obj);

    return obj;
    // return (module.exports = obj);
  }

  const logzioLogger = require('logzio-nodejs').createLogger({
    token: process.env.APP_LOGGER_TOKEN,
    // host: process.env.APP_LOGGER_HOST,
    // supressErrors: process.env.APP_LOGGER_SUPRESS_ERRORS,
    // debug: process.env.APP_LOGGER_INCLUDE_DEBUG
  });

  const log4js = require('log4js');
  log4js.configure({
    appenders: {
      console: {
        type: 'console',
      },
    },
    categories: {
      default: {
        appenders: ['console'],
        level: process.env.APP_LOG_LEVEL,
      },
    },
  });
  const log4jslogger = log4js.getLogger('default');

  function log(msg, handler, catalog, genre, count, item) {
    log4jslogger.log(msg);
    logzioLogger.log({
      message: msg,
      level: 'debug',
      handler: handler,
      catalog: catalog,
      genre: genre,
      count: count,
      item: item,
    });
  }

  function debugLog(msg, handler, catalog, genre, count, item) {
    log4jslogger.debug(msg);
    logzioLogger.log({
      message: msg,
      level: 'debug',
      handler: handler,
      catalog: catalog,
      genre: genre,
      count: count,
      item: item,
    });
  }

  function infoLog(msg, handler, catalog, genre, count, item) {
    log4jslogger.info(msg);
    logzioLogger.log({
      message: msg,
      level: 'info',
      handler: handler,
      catalog: catalog,
      genre: genre,
      count: count,
      item: item,
    });
  }

  function errorLog(msg, handler, catalog, genre, count, item) {
    log4jslogger.info(msg);
    logzioLogger.log({
      message: msg,
      level: 'error',
      handler: handler,
      catalog: catalog,
      genre: genre,
      count: count,
      item: item,
    });
  }

  var obj = {
    debug: debugLog,
    info: infoLog,
    error: errorLog,
  };

  console.log('obj: ', obj);

  return obj;
  // return (module.exports = obj);
}

function getFirebaseInit() {
  if (process.env.APP_FIREBASE_APIKEY) {
    var firebase = require('firebase');

    var firebaseConfig = {
      apiKey: process.env.APP_FIREBASE_APIKEY,
      authDomain: process.env.APP_FIREBASE_AUTHDOMAIN,
      databaseURL: process.env.APP_FIREBASE_DATABASEURL,
      projectId: process.env.APP_FIREBASE_PROJECTID,
      storageBucket: process.env.APP_FIREBASE_STORAGEBUCKET,
      messagingSenderId: process.env.APP_FIREBASE_MESSAGINGSENDERID,
      appId: process.env.APP_FIREBASE_APPID,
    };

    var app = firebase.initializeApp(firebaseConfig);
    var db = firebase.database();
    console.log('firebase.initializeApp: ', app);
    console.log('firebase.database: ', db);
    // Self-Invoking Functions
    (async function () {
      var db_set = firebase
        .database()
        .ref('default-rtdb')
        .set({
          username: 'name',
          email: 'email',
          profile_picture: 'imageUrl',
        })
        .catch((err) => console.error('error: ', err));
      console.log('firebase.database.set: ', db_set);
    })();
  }
}

function getGADebug() {
  if (process.env.APP_GA_TRACKING_ID) {
    const fetch = require('node-fetch');

    const { APP_GA_TRACKING_ID } = process.env;

    const trackEvent = (category, action, label, value) => {
      const data = {
        // API Version.
        v: '1',
        // Tracking ID / Property ID.
        tid: GA_TRACKING_ID,
        // Anonymous Client Identifier. Ideally, this should be a UUID that
        // is associated with particular user, device, or browser instance.
        cid: '555',
        // Event hit type.
        t: 'event',
        // Event category.
        ec: category,
        // Event action.
        ea: action,
        // Event label.
        el: label,
        // Event value.
        ev: value,
      };

      // console.log('data: ', data);

      return fetch('http://www.google-analytics.com/debug/collect', {
        params: data,
      })
        .then((res) => res.json())
        .then((json) => console.log('json: ', json))
        .catch((err) => console.error('error: ', err));
    };

    (async function () {
      try {
        await trackEvent(
          'Example category',
          'Example action',
          'Example label',
          captureMessage
        );
        console.log('trackEvent');
      } catch (error) {
        console.log(error);
      }
    })();
  }
}

//

module.exports = {
  getConfig,
  isNumeric,
  getSentry,
  getRollbar,
  getLogzio,
  getFirebaseInit,
  getGADebug,
};
