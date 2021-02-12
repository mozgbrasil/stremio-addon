const { addonBuilder } = require('stremio-addon-sdk');
const _ = require('lodash');
const logger = require('./logger.js');
const magnet = require('magnet-uri');
const { rarbg } = require('rarbg-api-ts');
const webtorrentHealth = require('webtorrent-health');
const { MovieDb } = require('moviedb-promise');
const moviedb = new MovieDb(process.env.TMDB_API);
const TMDB_API_LANGUAGE = 'pt-BR';
const package_manifest = require('../package.json');

//

function isNumeric(value) {
  return /^\d+$/.test(value);
}

//

// https://www.npmjs.com/package/moviedb-promise

async function getGenreList(language, type) {
  if (type === 'movie') {
    const getGenreMovieList = moviedb
      .genreMovieList({ language: language })
      .then((res) => {
        return res.genres;
      })
      .catch(console.error);
    return getGenreMovieList;
  } else {
    const getGenreTvList = moviedb
      .genreTvList({ language: language })
      .then((res) => {
        return res.genres;
      })
      .catch(console.error);
    return getGenreTvList;
  }
}

async function getGenres(type, language, genre, page) {
  if (type === 'movie') {
    const genre_id = await getGenreList(language, type);

    if (isNumeric(genre)) {
      var parameters = {
        language: language,
        page: page,
        primary_release_year: genre,
      };
    } else {
      const gen_name = genre_id.find((x) => x.name === genre).id;
      var parameters = {
        language: language,
        page: page,
        with_genres: gen_name,
      };
    }

    const getDiscoverMovie = moviedb
      .discoverMovie(parameters)
      .then(async (res) => {
        const resp = res.results;
        const metas = await Promise.all(
          resp.map(async (el) => {
            var tmdbId = el.id;
            const genre = el.genre_ids.map((el) => {
              const gen_name = genre_id.find((x) => x.id === el).name;
              return gen_name;
            });
            const year = el.release_date.substr(0, 4);

            const movieInfo = await moviedb
              .movieInfo({ id: el.id })
              .then((res) => {
                // console.log('movieInfo: ', res);
                return res;
              })
              .catch(console.error);

            const imdb_id = movieInfo.imdb_id;

            return {
              id: `${imdb_id}`,
              name: `${el.title}`,
              genre: genre,
              poster: `https://image.tmdb.org/t/p/original${el.poster_path}`,
              posterShape: 'regular',
              imdbRating: `${el.vote_average}`,
              year: year,
              type: `${type}`,
              description: `${el.overview}`,
            };
          })
        );
        return Promise.resolve({ metas });
      })
      .catch(console.error);

    return getDiscoverMovie;
  } else {
    const genre_id = await getGenreList(language, type);

    if (isNumeric(genre)) {
      var parameters = {
        language: language,
        page: page,
        first_air_date_year: genre,
      };
    } else {
      const gen_name = genre_id.find((x) => x.name === genre).id;
      var parameters = {
        language: language,
        page: page,
        with_genres: gen_name,
      };
    }

    const getDiscoverTv = moviedb
      .discoverTv(parameters)
      .then(async (res) => {
        const resp = res.results;
        const metas = await Promise.all(
          resp.map(async (el) => {
            var tmdbId = el.id;

            const tvInfo = await moviedb
              .tvInfo({ id: el.id, append_to_response: 'external_ids' })
              .then((res) => {
                // console.log('tvInfo: ', res);
                return res;
              })
              .catch(console.error);

            const imdb_id = tvInfo.external_ids.imdb_id;

            return {
              id: `${imdb_id}`,
              name: `${el.name}`,
              genre: `${el.genre_ids}`,
              poster: `https://image.tmdb.org/t/p/original${el.poster_path}`,
              posterShape: 'regular',
              imdbRating: `${el.vote_average}`,
              year: year,
              type: `${type}`,
              description: `${el.overview}`,
            };
          })
        );
        return Promise.resolve({ metas });
      })
      .catch(console.error);

    return getDiscoverTv;
  }
}

async function getCatalog(type, language, page) {
  if (type === 'movie') {
    const genre_id = await getGenreList(language, type);
    const getDiscoverMovie = moviedb
      .discoverMovie({
        language: language,
        page: page,
        // append_to_response: 'videos',
      })
      .then(async (res) => {
        // console.log('discoverMovie->res: ', res);
        const resp = res.results;
        const metas = await Promise.all(
          resp.map(async (el) => {
            var tmdbId = el.id;
            const genre = el.genre_ids.map((el) => {
              const gen_name = genre_id.find((x) => x.id === el).name;
              return gen_name;
            });
            const year = el.release_date.substr(0, 4);

            const movieInfo = await moviedb
              .movieInfo({ id: el.id })
              .then((res) => {
                // console.log('movieInfo: ', res);
                return res;
              })
              .catch(console.error);

            const imdb_id = movieInfo.imdb_id;

            return {
              id: `${imdb_id}`,
              name: `${el.title}`,
              genre: genre,
              poster: `https://image.tmdb.org/t/p/original${el.poster_path}`,
              posterShape: 'regular',
              imdbRating: `${el.vote_average}`,
              year: year,
              type: `${type}`,
              description: `${el.overview}`,
            };
          })
        );
        return Promise.resolve({ metas });
      })
      .catch(console.error);
    console.log('getDiscoverMovie: ', getDiscoverMovie);
    return getDiscoverMovie;
  } else {
    const genre_id = await getGenreList(language, type);
    const getDiscoverTv = moviedb
      .discoverTv({ language: language, page: page })
      .then(async (res) => {
        const resp = res.results;
        const metas = await Promise.all(
          resp.map(async (el) => {
            var tmdbId = el.id;
            const year = el.first_air_date.substr(0, 4);

            const tvInfo = await moviedb
              .tvInfo({ id: el.id, append_to_response: 'external_ids' })
              .then((res) => {
                // console.log('tvInfo: ', res);
                return res;
              })
              .catch(console.error);

            const imdb_id = tvInfo.external_ids.imdb_id;

            return {
              id: `${imdb_id}`,
              name: `${el.name}`,
              poster: `https://image.tmdb.org/t/p/original${el.poster_path}`,
              posterShape: 'regular',
              imdbRating: `${el.vote_average}`,
              year: year,
              type: `${type}`,
              description: `${el.overview}`,
            };
          })
        );
        return Promise.resolve({ metas });
      })
      .catch(console.error);
    return getDiscoverTv;
  }
}

const getGenreTvList = moviedb
  .genreTvList({ language: TMDB_API_LANGUAGE })
  .then((res) => {
    return res.genres;
  })
  .catch(console.error);

const getGenreMovieList = moviedb
  .genreMovieList({ language: TMDB_API_LANGUAGE })
  .then((res) => {
    return res.genres;
  })
  .catch(console.error);

//

async function getManifest(language = TMDB_API_LANGUAGE) {
  const genreMovieList = await getGenreMovieList;
  const genres_movie = genreMovieList.map((el) => {
    return el.name;
  });

  const genreTvList = await getGenreTvList;
  const genres_series = genreTvList.map((el) => {
    return el.name;
  });

  const descriptionSuffix =
    language && language !== TMDB_API_LANGUAGE
      ? ` with ${language} language.`
      : '.';

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

  let imdb_id = [
    'tt0016847',
    'tt0049223',
    'tt0078748',
    'tt0090520',
    'tt0121766',
    'tt0285531',
    'tt1446714',
    'tt2316204',
    'tt5073642',
    'tt0017136',
    'tt0055151',
    'tt0080684',
    'tt0092076',
    'tt0129167',
    'tt0300556',
    'tt1454468',
    'tt2527338',
    'tt7329656',
    'tt0021884',
    'tt0055608',
    'tt0083866',
    'tt0092106',
    'tt0139809',
    'tt0816692',
    'tt1564585',
    'tt2557478',
    'tt0046534',
    'tt0061722',
    'tt0086190',
    'tt0096754',
    'tt0140703',
    'tt0910970',
    'tt1823672',
    'tt2719848',
    'tt0046672',
    'tt0065702',
    'tt0088846',
    'tt0102803',
    'tt0142183',
    'tt1104001',
    'tt1971325',
    'tt3371366',
    'tt0048215',
    'tt0071565',
    'tt0089489',
    'tt0116629',
    'tt0182789',
    'tt1318514',
    'tt2109248',
    'tt3741700',
  ];

  const random = Math.floor(Math.random() * imdb_id.length);
  var background =
    'https://images.metahub.space/background/medium/' +
    imdb_id[random] +
    '/img';

  // https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md#basic-information
  return {
    id: 'community.mozg.timeline',
    name: package_manifest.name + ' 🇧🇷️',
    description: '❤️ ' + package_manifest.description,
    version: package_manifest.version,
    resources: [
      'catalog',
      'stream',
      // , 'meta', 'subtitles'
    ],
    types: ['movie', 'series'],
    idPrefixes: [''],
    catalogs: [
      {
        type: 'movie',
        id: 'movie.top',
        extraSupported: ['search', 'genre', 'skip'],
        genres: genres_movie,
        name: 'Top 🇧🇷️',
      },
      {
        type: 'series',
        id: 'series.top',
        extraSupported: ['search', 'genre', 'skip'],
        genres: genres_series,
        name: 'Top 🇧🇷️',
      },
      {
        type: 'movie',
        id: 'movie.year',
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
        name: 'By year 🇧🇷️',
      },
      {
        type: 'series',
        id: 'series.year',
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
        name: 'By year 🇧🇷️',
      },
    ],
    background: background,
    logo:
      'https://s.gravatar.com/avatar/38385ec9b5375a77513a4dad6aebca08?s=256',
    contactEmail: 'mozgbrasil@gmail.com',
  };
}

//

var axios = require('axios').default;

async function getMeta(imdbId) {
  try {
    var url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${process.env.TMDB_API}&language=${TMDB_API_LANGUAGE}&external_source=imdb_id`;
    // console.log('url: ', url);

    var res = await axios.get(url);
    var meta = res.data;

    // console.log('res: ', res);

    if (meta['movie_results'].length > 0) {
      return meta.movie_results[0];
    }

    if (meta['tv_results'].length > 0) {
      return meta.tv_results[0];
    }

    return false;
  } catch (error) {
    console.error(
      `The MovieDB id retrieval failed with http status ${error.response.status}`
    );
  }
}

//

var builder;

//

const robots = {
  init: async function robot() {
    console.log('robot->init');
    // let obj = {
    //   // window: window,
    //   global: global,
    //   // this: this,
    // };
    // for (var [key, value] of Object.entries(obj)) {
    //   let label = key;
    //   console.log(
    //     `getOwnPropertyNames ${label}: `,
    //     Object.getOwnPropertyNames(value).sort()
    //   );
    //   console.log(
    //     `getOwnPropertySymbols ${label}: `,
    //     Object.getOwnPropertySymbols(value).sort()
    //   );
    // }
  },
  sentry: async function robot() {
    console.log('robot->sentry');
  },
  builder: async function robot() {
    console.log('robot->builder');

    // Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md

    const language = TMDB_API_LANGUAGE;
    const manifest = await getManifest(language);

    // console.log('manifest: ', manifest);

    builder = new addonBuilder(manifest);

    // console.log('builder: ', builder);

    // builder.defineResourceHandler('stream', function(args) {
    //   return Promise.resolve({
    //       addons: [
    //           {
    //               transportName: 'http',
    //               transportUrl: 'https://example.addon.org/manifest.json',
    //               manifest: {
    //                   id: 'org.myexampleaddon',
    //                   version: '1.0.0',
    //                   name: 'simple example',
    //                   catalogs: [],
    //                   resources: ['stream'],
    //                   types: ['movie'],
    //                   idPrefixes: ['tt']
    //               }
    //           }
    //       ]
    //   })
    // })

    // Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
    builder.defineStreamHandler(async function (args) {
      logger.info(
        'defineStreamHandler | ' + '' + JSON.stringify(args) + '',
        'STREAM',
        args.id
      );

      //

      var streams = [];

      const robots = {
        streamHandler: async function () {
          console.log('robot->streamHandler: ', args);
        },
        rarbg: async function () {
          console.log('robot->rarbgt: ', args);

          // https://www.npmjs.com/package/rarbg-api-ts

          // const findMovie = async (title) => {

          //

          // let stream = {
          //   name: 'rarbg-api-ts',
          //   title: `💾 test`,
          //   type: args.type,
          //   infoHash: 'false',
          // };

          // streams.push(stream);
          // return streams;

          //
        },
      };

      //

      async function promise_streamHandler() {
        // return new Promise((resolve) => {
        //   (async function () {
        // Self-Invoking Functions
        console.log('promise_streamHandler: ', args);

        return await robots.streamHandler();
        //   })();
        //   setTimeout(() => {
        //     resolve('promise_streamHandler');
        //   }, 500);
        // });
      }

      async function promise_rarbg() {
        // return new Promise((resolve) => {
        //   (async function () {
        // Self-Invoking Functions
        console.log('promise_rarbg: ', args);
        try {
          return await robots.rarbg();
        } catch (e) {
          console.log('catch: ', e);
          let stream = {
            name: 'rarbg-api-ts',
            title: `🔴️ ${e}`,
            type: args.type,
            url:
              'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4',
          };
          streams.push(stream);
          return streams;
        }
        console.log('promise_rarbg->streams: ', 'streams');
        //   })();
        //   setTimeout(() => {
        //     resolve('promise_rarbg');
        //   }, 500);
        // });
      }

      async function promise_searchImdb() {
        // return new Promise((resolve) => {
        //   (function () {
        // Self-Invoking Functions
        console.log('promise_searchImdb: ', args);
        return await rarbg
          .searchImdb(args.id)
          .then((res) => {
            console.log('searchImdb->res: ', 'res');

            function iterate(obj) {
              // console.log('obj: ', obj);
              let filename = obj.filename;
              let uri = obj.download;
              var parsed = magnet.decode(uri);

              var title = parsed.dn;
              var infoHash = parsed.infoHash;
              var titleUpper = title.toUpperCase();

              var tags = '';
              if (titleUpper.match(/720P/i)) tags = tags + '720p ';
              if (titleUpper.match(/1080P/i)) tags = tags + '1080p ';
              if (titleUpper.match(/LEGENDADO/i)) tags = tags + 'LEGENDADO ';
              if (titleUpper.match(/DUBLADO/i)) tags = tags + 'DUBLADO ';
              if (titleUpper.match(/DUBLADA/i)) tags = tags + 'DUBLADA ';
              if (titleUpper.match(/DUAL/i)) tags = tags + 'DUAL ÁUDIO ';
              if (titleUpper.match(/4K/i)) tags = tags + '4K ';
              if (titleUpper.match(/2160P/i)) tags = tags + '2160p ';
              if (titleUpper.match(/UHD/i)) tags = tags + 'UHD ';

              let stream = {
                name: '⭐ rarbg',
                title: `🎥 ${title}`,
                type: args.type,
                infoHash: infoHash,
                _magnet: uri,
                _sources: (parsed.announce || [])
                  .map(function (x) {
                    return 'tracker:' + x;
                  })
                  .concat(['dht:' + infoHash]),
                _tag: tags,
              };

              console.log('searchImdb->res->iterate: ', 'stream');

              streams.push(stream);
            }

            // res.forEach(async function (obj) {
            // });
            for (i = 0; i < res.length; i++) {
              iterate(res[i]);
            }

            console.log('robot->searchImdb->res->Promise: ', 'streams');
            return streams;
            // return await Promise.resolve({ streams: streams });
          })
          .catch(console.error.bind(console));

        // console.log('promise_searchImdb->streams: ', streams);
        // return Promise.resolve({ streams: streams });

        //   })();
        //   setTimeout(() => {
        //     resolve('promise_searchImdb');
        //   }, 500);
        // });
      }

      async function promise_webtorrentHealth() {
        // return new Promise((resolve) => {
        //   (async function () {
        // Self-Invoking Functions
        console.log('promise_webtorrentHealth: ', args);

        //

        // https://oieduardorabelo.medium.com/javascript-armadilhas-do-asyn-await-em-loops-1cdad44db7f0

        const fetch = require('node-fetch');

        // (async function () {
        // Self-Invoking Functions
        for (const [idx, val] of streams.entries()) {
          if (!val._magnet) {
            // return;
            continue;
          }

          var stream = val;

          console.log(`stream[${idx}]:`, 'stream');

          var magnet = stream._magnet;

          var todo = 'todo';

          // https://www.npmjs.com/package/webtorrent-health
          var todo = new Promise((resolve, reject) => {
            webtorrentHealth(magnet, function (err, data) {
              if (err) return console.error(err);
              // console.log('webtorrentHealth->data: ', data);
              resolve(data);
            });
          });

          var data = await todo;

          console.log(`Received Todo ${idx + 1}:`, 'data');

          streams[idx].title = `${streams[idx].title} \n 🌱 seeders: ${
            data.seeds
          } 🌵 leechers: ${data.peers} ⭐ ratio: ${Math.round(
            data.peers > 0 ? data.seeds / data.peers : data.seeds
          )} \n ${streams[idx]._tag}`;

          // console.log(`Received Todo ${idx + 1}:`, todo);
        }

        console.log('Finished!');
        // })();

        //

        // console.log('promise_webtorrentHealth->update->streams: ', streams);

        // return await streams;
        //   })();
        //   setTimeout(() => {
        //     resolve('promise_webtorrentHealth');
        //   }, 500);
        // });
      }

      //

      return new Promise((resolve, reject) => {
        //

        (async function () {
          // Self-Invoking Functions

          promise_streamHandler()
            .then(async (res) => {
              console.log('res_1_promise_streamHandler: ', 'res');
              await promise_rarbg()
                .then(async (res) => {
                  console.log('res_2_promise_rarbg: ', 'res');
                  await promise_searchImdb()
                    .then(async (res) => {
                      console.log('res_3_promise_searchImdb: ', 'res');
                      await promise_webtorrentHealth()
                        .then((res) => {
                          console.log(
                            'res_4_promise_webtorrentHealth: ',
                            'res'
                          );
                          // console.log('resolve:', streams);
                          resolve({
                            streams: streams,
                          });
                        })
                        .catch(console.error.bind(console));
                    })
                    .catch(console.error.bind(console));
                })
                .catch(console.error.bind(console));
            })
            .catch(console.error.bind(console));
        })();

        //
      });
    });

    // Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineMetaHandler.md
    // builder.defineMetaHandler(function (args) {
    //   logger.info(
    //     'defineMetaHandler | ' + '' + JSON.stringify(args) + '',
    //     'META',
    //     args.id
    //   );

    //   if (args.id !== '') {
    //     // serve one stream movie
    //     return Promise.resolve({ meta: [] });
    //   }

    //   // otherwise return no streams
    //   return Promise.resolve({ meta: [] });
    // });

    // Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md
    builder.defineCatalogHandler(async function (args) {
      logger.info(
        'defineCatalogHandler | ' + '' + JSON.stringify(args) + '',
        'CATALOG',
        args.id
      );

      const skip = parseInt(args.extra.skip || 0);

      console.log('skip: ', skip);

      const language = TMDB_API_LANGUAGE;
      const type = args.type;

      if (args.extra && args.extra.genre) {
        const genre = args.extra.genre;
        const page = skip / 20 + 1;
        var metas = await getGenres(type, language, genre, page);
      } else {
        const page = skip / 20 + 1;
        var metas = await getCatalog(type, language, page);
      }

      console.log('addon->metas: ', metas['metas'][0].id);

      // return Promise.resolve({ metas: [] });
      return Promise.resolve({ metas: metas['metas'] });
    });

    // Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineSubtitlesHandler.md
    // builder.defineSubtitlesHandler(function (args) {
    //   logger.info(
    //     'defineMetaHandler | ' + '' + JSON.stringify(args) + '',
    //     'SUBTITLE',
    //     args.id
    //   );

    //   return Promise.resolve({ subtitles: [] });
    // });

    // module.exports = builder.getInterface();
    //
  },
};

//

async function start() {
  console.log('addon-start');
  robots.init();
  await robots.sentry();
  await robots.builder();
  // await console.log('builder: ', builder);
  return builder.getInterface();
}

module.exports = async () => {
  return start();
};
