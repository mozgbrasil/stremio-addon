const package_manifest = require('../package.json');
var sprintf = require('sprintf-js').sprintf,
  vsprintf = require('sprintf-js').vsprintf;
const {
  getGenreList,
  getGenres,
  getCatalog,
  getGenreTvList,
  getGenreMovieList,
} = require('./moviedb');

async function getManifest() {
  // https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md#basic-information

  const genreMovieList = await getGenreMovieList;
  const genres_movie = genreMovieList.map((el) => {
    return el.name;
  });

  const genreTvList = await getGenreTvList;
  const genres_series = genreTvList.map((el) => {
    return el.name;
  });

  function generateArrayOfYears() {
    var max = new Date().getFullYear();
    var min = max - 150;
    var years = [];

    for (var i = max; i >= min; i--) {
      years.push(i);
    }
    return years;
  }

  const years_movie = generateArrayOfYears();

  // let arrayIMDB = ['tt0016847', 'tt0049223'];

  // var jsonIMDB = JSON.stringify(arrayIMDB);

  var jsonIMDB =
    '["tt0016847","tt0049223","tt0078748","tt0090520","tt0121766","tt0285531","tt1446714","tt2316204","tt5073642","tt0017136","tt0055151","tt0080684","tt0092076","tt0129167","tt0300556","tt1454468","tt2527338","tt7329656","tt0021884","tt0055608","tt0083866","tt0092106","tt0139809","tt0816692","tt1564585","tt2557478","tt0046534","tt0061722","tt0086190","tt0096754","tt0140703","tt0910970","tt1823672","tt2719848","tt0046672","tt0065702","tt0088846","tt0102803","tt0142183","tt1104001","tt1971325","tt3371366","tt0048215","tt0071565","tt0089489","tt0116629","tt0182789","tt1318514","tt2109248","tt3741700"]';

  var arrayIMDB = JSON.parse(jsonIMDB);

  const random = Math.floor(Math.random() * arrayIMDB.length);
  var background =
    'https://images.metahub.space/background/medium/' +
    arrayIMDB[random] +
    '/img';

  const catalogs_cinemeta = [
    {
      type: 'movie',
      id: 'movie.top.cinemeta',
      extraSupported: ['search', 'genre', 'skip'],
      genres: genres_movie,
      name: 'Top -️️ CINEMETA',
    },
    {
      type: 'series',
      id: 'series.top.cinemeta',
      extraSupported: ['search', 'genre', 'skip'],
      genres: genres_series,
      name: 'Top -️️ CINEMETA',
    },
    {
      type: 'movie',
      id: 'movie.year.cinemeta',
      genres: years_movie,
      extra: [
        {
          name: 'genre',
          options: years_movie,
          isRequired: true,
        },
      ],
      extraSupported: ['genre'],
      extraRequired: ['genre'],
      name: 'By year -️ CINEMETA️',
    },
    {
      type: 'series',
      id: 'series.year.cinemeta',
      genres: years_movie,
      extra: [
        {
          name: 'genre',
          options: years_movie,
          isRequired: true,
        },
      ],
      extraSupported: ['genre'],
      extraRequired: ['genre'],
      name: 'By year -️️ CINEMETA',
    },
  ];

  const catalogs_tmdb = [
    {
      type: 'movie',
      id: 'movie.top.tmdb',
      extraSupported: ['search', 'genre', 'skip'],
      genres: genres_movie,
      name: 'Top -️️ TMDB',
    },
    {
      type: 'series',
      id: 'series.top.tmdb',
      extraSupported: ['search', 'genre', 'skip'],
      genres: genres_series,
      name: 'Top -️️ TMDB',
    },
    {
      type: 'movie',
      id: 'movie.year.tmdb',
      genres: years_movie,
      extra: [
        {
          name: 'genre',
          options: years_movie,
          isRequired: true,
        },
      ],
      extraSupported: ['genre'],
      extraRequired: ['genre'],
      name: 'By year -️ TMDB️',
    },
    {
      type: 'series',
      id: 'series.year.tmdb',
      genres: years_movie,
      extra: [
        {
          name: 'genre',
          options: years_movie,
          isRequired: true,
        },
      ],
      extraSupported: ['genre'],
      extraRequired: ['genre'],
      name: 'By year -️ TMDB',
    },
  ];

  const varName = 'catalogs_' + process.env.APP_CATALOG;
  const catalogs = eval(varName);

  switch (process.env.APP_CATALOG) {
    case 'tmdb':
      var descriptionCatalog =
        '(' +
        process.env.APP_CATALOG.toUpperCase() +
        ') displays 40 records instead of 20 records';
      break;
    case 'cinemeta':
      var descriptionCatalog =
        '(' +
        process.env.APP_CATALOG.toUpperCase() +
        ') displays 500 records instead of 100 records';
      break;
    default:
      console.log('Default case');
      break;
  }

  const id = 'community.mozg.' + process.env.APP_CATALOG;
  const name = '' + process.env.APP_CATALOG + ' Extend';
  var description =
    '' + sprintf(package_manifest.description, descriptionCatalog);

  return {
    id: id,
    name: name,
    description: description,
    version: package_manifest.version,
    resources: [
      'catalog',
      // 'stream',
      // , 'meta'
      // , 'subtitles'
    ],
    types: ['movie', 'series'],
    idPrefixes: [''],
    catalogs: catalogs,
    background: background,
    logo:
      'https://s.gravatar.com/avatar/38385ec9b5375a77513a4dad6aebca08?s=256',
  };
}

module.exports = {
  getManifest,
};
