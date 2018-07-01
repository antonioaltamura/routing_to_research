/**
 * Created by Antonio Altamura on 03/06/2018.
 */
"use strict";
let router = require('express').Router(),
	models = $require("models");

router
	.get('/authors', async (req, res, next) => {
		res.json(await models.Author.getByNameContains(req.query.q));
	})
	.get('/papers', async (req, res, next) => {
		res.json(await models.Paper.getByNameContains(req.query.q));
	})
	.get('/journals', async (req, res, next) => {
		res.json(await models.Journal.getByNameContains(req.query.q));
	})
	.get('/topics', async (req, res, next) => {
		res.json(await models.Topic.getByNameContains(req.query.q));
	})
	.get('/books', async (req, res, next) => {
		res.json(await models.Book.getByNameContains(req.query.q));
	});
module.exports = router;