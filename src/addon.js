const { addonBuilder } = require('stremio-addon-sdk');
// const _ = require('lodash');
const logger = require('./logger.js');
const magnet = require('magnet-uri');
const { rarbg } = require('rarbg-api-ts');
const webtorrentHealth = require('webtorrent-health');

const package_manifest = require('../package.json');
const fetch = require('node-fetch');

const { getManifest } = require('./manifest');
const {
  getGenreList,
  getGenres,
  getCatalog,
  getGenreTvList,
  getGenreMovieList,
} = require('./moviedb');

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

    const manifest = await getManifest();

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
    // builder.defineStreamHandler(async function (args) {
    //   logger.info(
    //     'defineStreamHandler | ' + '' + JSON.stringify(args) + '',
    //     'STREAM',
    //     args.id
    //   );

    //   //

    //   var streams = [];

    //   const robots = {
    //     streamHandler: async function () {
    //       console.log('robot->streamHandler: ', args);
    //     },
    //     rarbg: async function () {
    //       console.log('robot->rarbgt: ', args);

    //       // https://www.npmjs.com/package/rarbg-api-ts

    //       // const findMovie = async (title) => {

    //       //

    //       // let stream = {
    //       //   name: 'rarbg-api-ts',
    //       //   title: `💾 test`,
    //       //   type: args.type,
    //       //   infoHash: 'false',
    //       // };

    //       // streams.push(stream);
    //       // return streams;

    //       //
    //     },
    //   };

    //   //

    //   async function promise_streamHandler() {
    //     // return new Promise((resolve) => {
    //     //   (async function () {
    //     // Self-Invoking Functions
    //     console.log('promise_streamHandler: ', args);

    //     return await robots.streamHandler();
    //     //   })();
    //     //   setTimeout(() => {
    //     //     resolve('promise_streamHandler');
    //     //   }, 500);
    //     // });
    //   }

    //   async function promise_rarbg() {
    //     // return new Promise((resolve) => {
    //     //   (async function () {
    //     // Self-Invoking Functions
    //     console.log('promise_rarbg: ', args);
    //     try {
    //       return await robots.rarbg();
    //     } catch (e) {
    //       console.log('catch: ', e);
    //       let stream = {
    //         name: 'rarbg-api-ts',
    //         title: `🔴️ ${e}`,
    //         type: args.type,
    //         url:
    //           'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4',
    //       };
    //       streams.push(stream);
    //       return streams;
    //     }
    //     //   })();
    //     //   setTimeout(() => {
    //     //     resolve('promise_rarbg');
    //     //   }, 500);
    //     // });
    //   }

    //   async function promise_searchImdb() {
    //     // return new Promise((resolve) => {
    //     //   (function () {
    //     // Self-Invoking Functions
    //     console.log('promise_searchImdb: ', args);
    //     return await rarbg
    //       .searchImdb(args.id)
    //       .then((res) => {
    //         console.log('searchImdb->res: ', 'res');

    //         function iterate(obj) {
    //           // console.log('obj: ', obj);
    //           let uri = obj.download;
    //           var parsed = magnet.decode(uri);

    //           var title = parsed.dn;
    //           var infoHash = parsed.infoHash;
    //           var titleUpper = title.toUpperCase();

    //           var tags = '';
    //           if (titleUpper.match(/720P/i)) tags = tags + '720p ';
    //           if (titleUpper.match(/1080P/i)) tags = tags + '1080p ';
    //           if (titleUpper.match(/LEGENDADO/i)) tags = tags + 'LEGENDADO ';
    //           if (titleUpper.match(/DUBLADO/i)) tags = tags + 'DUBLADO ';
    //           if (titleUpper.match(/DUBLADA/i)) tags = tags + 'DUBLADA ';
    //           if (titleUpper.match(/DUAL/i)) tags = tags + 'DUAL ÁUDIO ';
    //           if (titleUpper.match(/4K/i)) tags = tags + '4K ';
    //           if (titleUpper.match(/2160P/i)) tags = tags + '2160p ';
    //           if (titleUpper.match(/UHD/i)) tags = tags + 'UHD ';

    //           let stream = {
    //             name: '⭐ rarbg',
    //             title: `🎥 ${title}`,
    //             type: args.type,
    //             infoHash: infoHash,
    //             _magnet: uri,
    //             _sources: (parsed.announce || [])
    //               .map(function (x) {
    //                 return 'tracker:' + x;
    //               })
    //               .concat(['dht:' + infoHash]),
    //             _tag: tags,
    //           };

    //           console.log('searchImdb->res->iterate: ', 'stream');

    //           streams.push(stream);
    //         }

    //         // res.forEach(async function (obj) {
    //         // });
    //         for (var i = 0; i < res.length; i++) {
    //           iterate(res[i]);
    //         }

    //         console.log('robot->searchImdb->res->Promise: ', 'streams');
    //         return streams;
    //         // return await Promise.resolve({ streams: streams });
    //       })
    //       .catch(console.error.bind(console));

    //     // console.log('promise_searchImdb->streams: ', streams);
    //     // return Promise.resolve({ streams: streams });

    //     //   })();
    //     //   setTimeout(() => {
    //     //     resolve('promise_searchImdb');
    //     //   }, 500);
    //     // });
    //   }

    //   async function promise_webtorrentHealth() {
    //     // return new Promise((resolve) => {
    //     //   (async function () {
    //     // Self-Invoking Functions
    //     console.log('promise_webtorrentHealth: ', args);

    //     //

    //     // https://oieduardorabelo.medium.com/javascript-armadilhas-do-asyn-await-em-loops-1cdad44db7f0

    //     // (async function () {
    //     // Self-Invoking Functions

    //     async function iterator(val, idx) {
    //       if (!val._magnet) {
    //         return;
    //         // continue;
    //       }

    //       var stream = val;

    //       console.log(`stream[${idx}]:`, 'stream');

    //       var magnet = stream._magnet;

    //       // var todo = 'todo';

    //       // https://www.npmjs.com/package/webtorrent-health
    //       var todo = new Promise((resolve, reject) => {
    //         webtorrentHealth(magnet, function (err, data) {
    //           if (err) return console.error(err);
    //           // console.log('webtorrentHealth->data: ', data);
    //           resolve(data);
    //         });
    //       });

    //       var data = await todo;

    //       console.log(`Received Todo ${idx + 1}:`, 'data');

    //       streams[idx].title = `${streams[idx].title} \n 🌱 seeders: ${
    //         data.seeds
    //       } 🌵 leechers: ${data.peers} ⭐ ratio: ${Math.round(
    //         data.peers > 0 ? data.seeds / data.peers : data.seeds
    //       )} \n ${streams[idx]._tag}`;

    //       // console.log(`Received Todo ${idx + 1}:`, todo);
    //     }

    //     // sincrona
    //     // for (const [idx, val] of streams.entries()) {
    //     //   iterator(val, idx);
    //     // }

    //     // assincrona
    //     const promises = streams.map(async (val, idx) => iterator(val, idx));
    //     await Promise.all(promises);

    //     //

    //     console.log('Finished!');
    //     // })();

    //     //

    //     // console.log('promise_webtorrentHealth->update->streams: ', streams);

    //     // return await streams;
    //     //   })();
    //     //   setTimeout(() => {
    //     //     resolve('promise_webtorrentHealth');
    //     //   }, 500);
    //     // });
    //   }

    //   //

    //   return new Promise((resolve, reject) => {
    //     //

    //     (async function () {
    //       // Self-Invoking Functions

    //       promise_streamHandler()
    //         .then(async (res) => {
    //           console.log('res_1_promise_streamHandler: ', 'res');
    //           await promise_rarbg()
    //             .then(async (res) => {
    //               console.log('res_2_promise_rarbg: ', 'res');
    //               await promise_searchImdb()
    //                 .then(async (res) => {
    //                   console.log('res_3_promise_searchImdb: ', 'res');
    //                   await promise_webtorrentHealth()
    //                     .then((res) => {
    //                       console.log(
    //                         'res_4_promise_webtorrentHealth: ',
    //                         'res'
    //                       );
    //                       // console.log('resolve:', streams);
    //                       resolve({
    //                         streams: streams,
    //                       });
    //                     })
    //                     .catch(console.error.bind(console));
    //                 })
    //                 .catch(console.error.bind(console));
    //             })
    //             .catch(console.error.bind(console));
    //         })
    //         .catch(console.error.bind(console));
    //     })();

    //     //
    //   });
    // });

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

      let type = args.type;

      let extra_ids = [
        'movie.top.cinemeta',
        'series.top.cinemeta',
        'movie.year.cinemeta',
        'series.year.cinemeta',
        'movie.top.tmdb',
        'series.top.tmdb',
        'movie.year.tmdb',
        'series.year.tmdb',
      ];

      let contain = extra_ids.includes(args.id);

      // console.log('contain: ', contain);

      if (contain) {
        var source;
        source = args.id.split('.');
        source = source[2];
      }

      var metas = [];

      switch (source) {
        case 'tmdb':
          await (async () => {
            // Self-Invoking Functions

            let page = (args.extra || {}).skip
              ? Math.round(args.extra.skip / 20) + 1
              : 1;

            // assincrona
            async function iterator(val, idx) {
              var page = val;

              if (args.extra && args.extra.genre) {
                const genre = args.extra.genre;
                var _getCatalog = await getGenres(type, genre, page);
              } else {
                var _getCatalog = await getCatalog(type, page);
              }
              // console.log(`iterator->_getCatalog (${page}):`, _getCatalog);

              getMetas = _getCatalog.metas;
              // getMetas = getMetas.slice(0, 2);
              // console.log(
              //   `iterator->_getCatalog->getMetas (${page}):`,
              //   getMetas
              // );

              metas = metas.concat(getMetas);

              console.log(
                `tmdb->iterator->_getCatalog->metas (${page}):`,
                'metas'
              );
            }

            function range(start, end) {
              return Array(end - start + 1)
                .fill()
                .map((_, idx) => start + idx);
            }
            var array_range = range(page, page + 1);
            console.log(
              `tmdb->addon->array_range (${array_range.length}): `,
              array_range
            );
            const promises = array_range.map(async (val, idx) =>
              iterator(val, idx)
            );
            await Promise.all(promises);
            //

            console.log(`tmdb->addon->metas (${metas.length}): `, 'metas');
          })().catch((err) => {
            console.error(err);
          });

          break;

        case 'cinemeta':
          await (async () => {
            // Self-Invoking Functions

            let skip = (args.extra || {}).skip
              ? Math.round(args.extra.skip) + 1
              : 0;

            // assincrona
            async function iterator(val, idx) {
              var skip = val;

              var id_catalog = args.id;
              id_catalog = id_catalog.split('.');
              id_catalog = id_catalog[1];

              if (args.extra && args.extra.genre) {
                const genre = args.extra.genre;
                // @TODO skip
                var url = `https://v3-cinemeta.strem.io/catalog/${type}/${id_catalog}/genre=${genre}.json`;
                console.log(`cinemeta->iterator->url (${skip}):`, url);
                var _getCatalog = await fetch(url).then((res) => res.json());
              } else {
                var url = `https://v3-cinemeta.strem.io/catalog/${type}/${id_catalog}/skip=${skip}.json`;
                console.log(`cinemeta->iterator->url (${skip}):`, url);
                var _getCatalog = await fetch(url).then((res) => res.json());
                // .then((json) => console.log(json));
              }
              // console.log(`iterator->_getCatalog (${skip}):`, _getCatalog);

              getMetas = _getCatalog.metas;
              // getMetas = getMetas.slice(0, 2);
              // console.log(
              //   `iterator->_getCatalog->getMetas (${skip}):`,
              //   getMetas
              // );

              metas = metas.concat(getMetas);

              console.log(
                `cinemeta->iterator->_getCatalog->metas (${skip}):`,
                'metas'
              );
            }

            function range(start, end) {
              return Array(end - start + 1)
                .fill()
                .map((_, idx) => start + idx * 100);
            }
            var start_range = skip;
            var end_range = skip + 4;
            var array_range = range(start_range, end_range);
            console.log(
              `cinemeta->addon->array_range (${start_range}) (${end_range}) (${array_range.length}): `,
              array_range
            );
            const promises = array_range.map(async (val, idx) =>
              iterator(val, idx)
            );
            await Promise.all(promises);
            //

            console.log(`cinemeta->addon->metas (${metas.length}): `, 'metas');
          })();

          break;
        default:
          console.log('Default case');
          break;
      }

      return Promise.resolve({ metas: metas });
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
