const { addonBuilder } = require('stremio-addon-sdk');
// const _ = require('lodash');
// const magnet = require('magnet-uri');
// const { rarbg } = require('rarbg-api-ts');
// const webtorrentHealth = require('webtorrent-health');
const { isNumeric, getLogzio } = require('./base');
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

var debugData = [];
var mozg = mozg || {};
mozg.stremio = {
  objects: {},
  init: async function () {
    debugData.push(arguments.callee.name);
    console.log('mozg.stremio.init', arguments.callee.name);
  },
  sentry: async function () {
    debugData.push(arguments.callee.name);
    console.log('mozg.stremio.sentry');
  },
  builder: async function () {
    debugData.push(arguments.callee.name);
    console.log('mozg.stremio.builder');

    // Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md

    const manifest = await getManifest();

    // console.log('manifest: ', manifest);

    builder = new addonBuilder(manifest);

    // Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md

    builder.defineCatalogHandler(async function (args) {
      (message = 'defineCatalogHandler | ' + '' + JSON.stringify(args) + ''),
        'CATALOG';
      optionalParams = args.id;
      getLogzio().info(message, optionalParams);
      console.log(message, optionalParams);

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

              console.log(
                `iterator->_getCatalog->page(${page})->length(${getMetas.length})`
              );

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
              `tmdb->addon->array_range->length(${array_range.length}): `,
              array_range
            );
            const promises = array_range.map(async (val, idx) =>
              iterator(val, idx)
            );
            await Promise.all(promises);
            //

            console.log(
              `tmdb->addon->metas->length(${metas.length}): `,
              'metas'
            );
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
                var url = `https://v3-cinemeta.strem.io/catalog/${type}/${id_catalog}/genre=${genre}&skip=${skip}.json`;
                console.log(`cinemeta->iterator->url->skip(${skip}):`, url);
                var _getCatalog = await fetch(url).then((res) => res.json());
              } else {
                var url = `https://v3-cinemeta.strem.io/catalog/${type}/${id_catalog}/skip=${skip}.json`;
                console.log(`cinemeta->iterator->url->skip(${skip}):`, url);
                var _getCatalog = await fetch(url).then((res) => res.json());
                // .then((json) => console.log(json));
              }
              // console.log(`iterator->_getCatalog (${skip}):`, _getCatalog);

              getMetas = _getCatalog.metas;

              console.log(
                `cinemeta->iterator->_getCatalog->skip(${skip})->length(${getMetas.length})`
              );

              // getMetas = getMetas.slice(0, 2);
              // console.log(
              //   `iterator->_getCatalog->getMetas (${skip}):`,
              //   getMetas
              // );

              metas = metas.concat(getMetas);

              console.log(
                `cinemeta->iterator->_getCatalog->metas->skip(${skip}):`,
                'metas'
              );
            }

            function range(start, end, multiple) {
              return Array(end - start + 1)
                .fill()
                .map((_, idx) => start + idx * multiple);
            }

            var start_range = skip;
            var end_range = skip + 4;
            var multiple = 100;

            var mozgObjects = mozg.stremio.objects;
            mozgObjects.start_range = start_range;
            debugData.push(mozgObjects);

            // if (args.extra.genre && isNumeric(args.extra.genre)) {
            //   var end_range = skip + 2;
            //   var multiple = 600;
            // }

            var array_range = range(start_range, end_range, multiple);

            // if (args.extra.genre && isNumeric(args.extra.genre)) {
            //   var array_range = (args.extra || {}).skip
            //     ? [skip, Math.round(args.extra.skip) + 600]
            //     : [0];
            // }

            console.log(
              `cinemeta->addon->array_range->(${start_range} - ${end_range})->length(${array_range.length}): `,
              array_range
            );

            const promises = array_range.map(
              async (val, idx) => await iterator(val, idx)
            );
            await Promise.all(promises);
            //

            console.log(
              `cinemeta->addon->metas->length(${metas.length}): `,
              'metas'
            );
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
    //   getLogzio().info(
    //     'defineMetaHandler | ' + '' + JSON.stringify(args) + '',
    //     'SUBTITLE',
    //     args.id
    //   );

    //   return Promise.resolve({ subtitles: [] });
    // });

    // module.exports = builder.getInterface();
    //
  },
  run: async function () {
    debugData.push(arguments.callee.name);
    console.log('mozg.stremio.run');
    mozg.stremio.init();
    await mozg.stremio.sentry();
    await mozg.stremio.builder();
    // await console.log('builder: ', builder);
    return builder.getInterface();
  },
};

//

module.exports = async () => {
  return mozg.stremio.run();
};
