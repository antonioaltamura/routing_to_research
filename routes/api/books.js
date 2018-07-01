let router = require('express').Router(),
	Book = $require("models").Book;


router
	.get('/', async (req, res, next) => {
		res.json(await Book.getAll());
	})
	.get('/:id', async (req, res, next) => {
		let r = await Book.getById(parseInt(req.params.id));
		if (r) {
			res.json(r)
		} else {
			res.status(404).send('Not found');
		}
	})
	.post('/', async (req, res, next) => {
		new Book(req.body.model)
			.save()
			.then((d) => res.json({message: 'ok', data: d}))
			.catch((e) => res.json({message: "error", ...e}))
	})
	.route('/:id').delete(function (req, res, next) {
		Book
			.delete(parseInt(req.params.id))
			.then((d) => res.json({message: 'ok', data: d}))
			.catch((e) => res.json({message: "error", ...e}))

});
module.exports = router;
