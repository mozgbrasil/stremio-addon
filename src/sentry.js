const { config } = require('./config');
const package_manifest = require('../package.json');
//

const captureMessage =
  '' + package_manifest.version + ' | ' + config.local + ' | ' + __filename;

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
  var name = package_manifest.name;
  name = name.replace('/', '-');
  const parameters = {
    dsn: process.env.SENTRY_DSN,
    // To set your release version
    release: name + '@' + package_manifest.version,
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
    scope.setExtra('env', process.env);
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

//
