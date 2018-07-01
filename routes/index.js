let router = require('express').Router();

router
	.get('/', function (req, res, next) {
		res.render('index');
	})
	.get('/app', function (req, res, next) {
		res.render('app');
	});

module.exports = router;
