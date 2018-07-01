let router = require('express').Router(),
	Paper = $require("models").Paper,
	λ = $require('utils');

const DIFF_THRESHOLD = 0.5;

router
	.get('/', async (req, res, next) => {
		res.json(await Paper.getAll());
	})
	.get('/titlecheck', async (req, res, next) => {
		let title = req.query.q;
		try {
			let docs = await Paper.getAll();
			// TODO doesnt work wtf
			// let r = docs.filter( d => (Math.max(d.name.length,title.length) / λ.levenshtein(d.name,title)) <= DIFF_THRESHOLD );
			let rr = []
			docs.forEach(d => {
				let len = (Math.max(d.name.length, title.length))
				let distance = λ.levenshtein(d.name, title)
				let percent = distance / len
				//console.log(distance, percent)
				if (percent <= DIFF_THRESHOLD) rr.push(d)

			});
			//console.log("filtered", rr)
			res.json(rr)
		} catch (e) {
			console.error("error")
			console.error(e)
			res.json({message: "error"})
		}
	})
	.get('/:id', async (req, res, next) => {
		let r = await Paper.getById(parseInt(req.params.id));
		if (r) {
			res.json(r)
		} else {
			res.status(404).send('Not found');
		}
	})
	.post('/', async (req, res, next) => {
		new Paper(req.body.model)
			.save()
			.then((d) => {
				console.warn("ok!")
				res.json({message: 'ok', data: d})
			})
			.catch((e) => {
				console.warn("Error in POST route papers")
				console.warn(e)
				res.json({message: "error", ...e})
			})
	})
	.route('/:id').delete(function (req, res, next) {
		Paper
			.delete(parseInt(req.params.id))
			.then((d) => res.json({message: 'ok', data: d}))
			.catch((e) => res.json({message: "error", ...e}))

});


module.exports = router;

