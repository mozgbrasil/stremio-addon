// for more information on deploying, see: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/deploying/README.md
const { publishToCentral } = require('stremio-addon-sdk');

if (process.argv.length == 3) {
  const url = process.argv[2]; // 'https://9b7c457c25d2-stremio-addon.baby-beamup.club/manifest.json'
  console.log('Publishing ' + url + ' to central');
  publishToCentral(url).then((response) => console.log(response));
} else {
  console.error(
    'Please specify a string with the url to your manifest.json file'
  );
}
