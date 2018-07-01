/**
 * Created by Antonio Altamura on 05/06/2018.
 */
"use strict";
let router = require('express').Router(),
	Graph = $require("models").Graph;


router
	.get('/', async (req, res, next) => {
		res.json(await Graph.getAll());
	})
	.get('/shortestPath', async (req, res, next) => {
		let author1 = req.query.author1;
		let author2 = req.query.author2;
		//console.log(author1,author2)
		if (!author1 || !author2) res.json({message: "error", text: "no author provided"})
		res.json(await Graph.shortestPath(author1, author2));
	});
module.exports = router;
