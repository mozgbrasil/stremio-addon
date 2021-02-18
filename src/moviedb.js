// https://www.npmjs.com/package/moviedb-promise

const { MovieDb } = require('moviedb-promise');
const moviedb = new MovieDb(process.env.APP_TMDB_API);
const TMDB_API_LANGUAGE = 'pt-BR';

const { isNumeric } = require('./config');

async function getGenreList(type) {
  if (type === 'movie') {
    const getGenreMovieList = moviedb
      .genreMovieList({ language: TMDB_API_LANGUAGE })
      .then((res) => {
        return res.genres;
      })
      .catch(console.error);

    return getGenreMovieList;
  } else {
    const getGenreTvList = moviedb
      .genreTvList({ language: TMDB_API_LANGUAGE })
      .then((res) => {
        return res.genres;
      })
      .catch(console.error);

    return getGenreTvList;
  }
}

async function getGenres(type, genre, page) {
  if (type === 'movie') {
    const genre_id = await getGenreList(type);

    var parameters;

    if (isNumeric(genre)) {
      parameters = {
        language: TMDB_API_LANGUAGE,
        page: page,
        primary_release_year: genre,
      };
    } else {
      const gen_name = genre_id.find((x) => x.name === genre).id;
      parameters = {
        language: TMDB_API_LANGUAGE,
        page: page,
        with_genres: gen_name,
      };
    }

    const getDiscoverMovie = moviedb
      .discoverMovie(parameters)
      .then(async (res) => {
        const results = res.results;
        const metas = await Promise.all(
          results.map(async (el) => {
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

    console.log(
      `getGenres->getDiscoverMovie->page(${page}): `,
      getDiscoverMovie
    );
    return getDiscoverMovie;
  } else {
    const genre_id = await getGenreList(type);

    if (isNumeric(genre)) {
      var parameters = {
        language: TMDB_API_LANGUAGE,
        page: page,
        first_air_date_year: genre,
      };
    } else {
      const gen_name = genre_id.find((x) => x.name === genre).id;
      var parameters = {
        language: TMDB_API_LANGUAGE,
        page: page,
        with_genres: gen_name,
      };
    }

    const getDiscoverTv = moviedb
      .discoverTv(parameters)
      .then(async (res) => {
        const results = res.results;
        const metas = await Promise.all(
          results.map(async (el) => {
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

    console.log(`getGenres->getDiscoverTv->page(${page}): `, getDiscoverTv);
    return getDiscoverTv;
  }
}

async function getCatalog(type, page) {
  if (type === 'movie') {
    const genre_id = await getGenreList(type);
    const getDiscoverMovie = moviedb
      .discoverMovie({
        language: TMDB_API_LANGUAGE,
        page: page,
      })
      .then(async (res) => {
        // console.log('discoverMovie->res: ', res);
        const results = res.results;
        const metas = await Promise.all(
          results.map(async (el) => {
            const genre = el.genre_ids.map((el) => {
              const gen_name = genre_id.find((x) => x.id === el).name;
              return gen_name;
            });
            var year = '';
            if (el.release_date) {
              year = el.release_date.substr(0, 4);
            }

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

    console.log(
      `getCatalog->getDiscoverMovie->page(${page}): `,
      getDiscoverMovie
    );
    return getDiscoverMovie;
  } else {
    const getDiscoverTv = moviedb
      .discoverTv({ language: TMDB_API_LANGUAGE, page: page })
      .then(async (res) => {
        const results = res.results;
        const metas = await Promise.all(
          results.map(async (el) => {
            var year = '';
            if (el.first_air_date) {
              year = el.first_air_date.substr(0, 4);
            }

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

    console.log(`getCatalog->getDiscoverTv->page(${page}): `, getDiscoverTv);
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

module.exports = {
  getGenreList,
  getGenres,
  getCatalog,
  getGenreTvList,
  getGenreMovieList,
};
