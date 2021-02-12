const { serveHTTP, publishToCentral } = require('stremio-addon-sdk');
const addonInterface = require('./addon');
// console.log('addonInterface: ', addonInterface);
const { config } = require('./config');
// console.log('config: ', config);
const logger = require('./logger.js');

//

const captureMessage = '' + __filename + ' ' + config.local;

// console.log('process.env: ', process.env);

//

// if (process.env.FIREBASE_APIKEY) {
//   var firebase = require('firebase');

//   var firebaseConfig = {
//     apiKey: process.env.FIREBASE_APIKEY,
//     authDomain: process.env.FIREBASE_AUTHDOMAIN,
//     databaseURL: process.env.FIREBASE_DATABASEURL,
//     projectId: process.env.FIREBASE_PROJECTID,
//     storageBucket: process.env.FIREBASE_STORAGEBUCKET,
//     messagingSenderId: process.env.FIREBASE_MESSAGINGSENDERID,
//     appId: process.env.FIREBASE_APPID,
//   };

//   var app = firebase.initializeApp(firebaseConfig);
//   var db = firebase.database();
//   console.log('firebase.initializeApp: ', app);
//   console.log('firebase.database: ', db);
//   // Self-Invoking Functions
//   (async function () {
//     var db_set = firebase
//       .database()
//       .ref('default-rtdb')
//       .set({
//         username: 'name',
//         email: 'email',
//         profile_picture: 'imageUrl',
//       })
//       .catch((err) => console.error('error: ', err));
//     console.log('firebase.database.set: ', db_set);
//   })();
// }

//

// if (process.env.GA_TRACKING_ID) {
//   const fetch = require('node-fetch');

//   const { GA_TRACKING_ID } = process.env;

//   const trackEvent = (category, action, label, value) => {
//     const data = {
//       // API Version.
//       v: '1',
//       // Tracking ID / Property ID.
//       tid: GA_TRACKING_ID,
//       // Anonymous Client Identifier. Ideally, this should be a UUID that
//       // is associated with particular user, device, or browser instance.
//       cid: '555',
//       // Event hit type.
//       t: 'event',
//       // Event category.
//       ec: category,
//       // Event action.
//       ea: action,
//       // Event label.
//       el: label,
//       // Event value.
//       ev: value,
//     };

//     // console.log('data: ', data);

//     return fetch('http://www.google-analytics.com/debug/collect', {
//       params: data,
//     })
//       .then((res) => res.json())
//       .then((json) => console.log('json: ', json))
//       .catch((err) => console.error('error: ', err));
//   };

//   (async function () {
//     try {
//       await trackEvent(
//         'Example category',
//         'Example action',
//         'Example label',
//         captureMessage
//       );
//       console.log('trackEvent');
//     } catch (error) {
//       console.log(error);
//     }
//   })();
// }

//

if (process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  const { Integrations } = require('@sentry/tracing');
  const parameters = {
    dsn: process.env.SENTRY_DSN,
    // To set your release version
    release: 'my-project-name@' + process.env.npm_package_version,
    integrations: [new Integrations.BrowserTracing()],
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  };
  Sentry.init(parameters);

  Sentry.captureMessage(captureMessage);

  // myUndefinedFunction(); // This snippet includes an intentional error, so you can test that everything is working as soon as you set it up:

  console.log('Sentry: ', 'Sentry');
}

//

addonInterface().then((addonInterface) => {
  logger.info('addonInterface | ' + '' + config.local + '', 'SERVEHTTP');
  serveHTTP(addonInterface, {
    port: config.port,
  });
});

//

// when you've deployed your addon, un-comment this line
// publishToCentral(
//   'https://9b7c457c25d2-stremio-addon.baby-beamup.club/manifest.json'
// );
// for more information on deploying, see: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/deploying/README.md
