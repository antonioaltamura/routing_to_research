/**
 * Created by Antonio Altamura on 05/06/2018.
 */
let router = require('express').Router(),
	models = $require("models");


router.get('/', async (req, res, next) => {

	let q = req.query.q
	try {
		res.json ({
			Author:await $require("models").Author.getByNameContains(q),
			Book:await $require("models").Book.getByNameContains(q),
			Journal:await $require("models").Journal.getByNameContains(q),
			Paper:await $require("models").Paper.getByNameContains(q),
			Topic:await $require("models").Topic.getByNameContains(q)
		})
	}  catch(e) {
		res.json({message:"error",...e})
	}
})
	.get('/advanced/', async (req, res, next) => {
	let type = req.query.type;
	let name = req.query.name;

		//search all books and papers by specific topic (name -HAS_KEYWORD->())
		//search all books and papers by specific author (HAS_KEYWORD, name-HAS_WRITTEN->())
		//search all papers by specific journal (()-PUBLISHED_IN->name)

	let r = [];
	try {
		switch(type) {
			case 'Topic':
				r = {Paper:await $require("models").Paper.getByTopic(name), Book:await $require("models").Book.getByTopic(name)};
				break;
			case 'Author':
				r = {Paper:await $require("models").Paper.getByAuthor(name), Book:await $require("models").Book.getByAuthor(name)};
				break;
			case 'Journal':
				r = {Paper:await $require("models").Paper.getByJournal(name)};
				break;
			default:
				throw "Error in advanced search";
		}
		res.json(r)
	} catch (e) {

		res.json({message:"error",...e})
	}

});


module.exports = router;
