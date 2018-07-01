let router = require('express').Router();

router.get('/', async (req, res, next) => {
	try {
		res.json ({
			Author:await $require("models").Author.count(),
			Book:await $require("models").Book.count(),
			Journal:await $require("models").Journal.count(),
			Paper:await $require("models").Paper.count(),
			Topic:await $require("models").Topic.count()
		})
	}  catch(e) {
		res.json({message:"error",...e})
	}
});

module.exports = router;