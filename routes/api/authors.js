let router = require('express').Router(),
	Author = $require("models").Author;

router
	.get('/', async (req, res, next) => {
		try {
			res.json(await Author.getAll());
		} catch (e) {
			res.json({message: "error", ...e})
		}
	})
	.get('/:id', async (req, res, next) => {
		let r = await Author.getById(parseInt(req.params.id));
		if (r) {
			res.json(r)
		} else {
			res.status(404).send('Not found');
		}
	})
	.post('/', async (req, res, next) => {
		new Author(req.body.model)
			.save()
			.then((d) => res.json({message: 'ok', data: d}))
			.catch((e) => res.json({message: "error", ...e}))
	})
	.route('/:id').delete(function (req, res, next) {
		Author
			.delete(parseInt(req.params.id))
			.then((d) => res.json({message: 'ok', data: d}))
			.catch((e) => res.json({message: "error", ...e}))

});
module.exports = router;
