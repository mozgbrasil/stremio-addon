const express = require('express');
const serverless = require('./serverless');

const app = express();

// app.use(logger('dev'));
// app.use(cors());
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

// app.all('*', function (req, res, next /*** CORS support.*/) {
//   console.log('app.all:', Date.now());
//   next();
// });

// app.use(function (req, res, next) {
//   console.log('app.use:', Date.now());
//   // if (!req.user)
//   //   return next(createError(401, 'Please login to view this page.'));
//   next();
// });
// // catch 404 and forward to error handler
// // app.use(function (req, res, next) {
// //   // next(createError(404));
// // });

// // error handler
// app.use(function (err, req, res, next) {
//   console.log('err:', err);
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// app.use(express.static('static', { maxAge: '1y' }));
app.use((req, res, next) => serverless(req, res, next));

app.listen(process.env.PORT || 7000, () => {
  console.log(`Started addon at: http://localhost:${process.env.PORT || 7000}`);
});
