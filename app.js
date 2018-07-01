let createError = require('http-errors'),
    express = require('express'),
    path = require('path'),
    cookieParser = require('cookie-parser'),
	logger = require('morgan');

global.$require = function(mod){
	return require(path.join(__dirname, mod));
};


let app = express();

app
	.set('views', path.join(__dirname, 'views'))
	.set('view engine', 'ejs')
	.use(logger('dev'))
	.use(express.json())
	.use(express.urlencoded({ extended: false }))
	.use(cookieParser())
	.use(express.static(path.join(__dirname, 'public')))
	.use(express.static(path.join(__dirname, 'public/node_modules')))
	.use('/', require('./routes/index'));
[
	'count',
	'storage',
	'search',
	'graph',
	'authors',
	'papers',
	'journals',
	'books',
	'topics',
	'autocomplete'
].map ( r => app.use('/api/' + r, require(path.join(__dirname,'routes','api',r))));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
