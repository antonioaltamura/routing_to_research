let router = require('express').Router(),
	Topic = $require("models").Topic;

router
	.get('/', async (req, res, next) => {
		res.json(await Topic.getAll());
	})
	.get('/:id', async (req, res, next) => {
		let r = await Topic.getById(parseInt(req.params.id));
		if (r) {
			res.json(r)
		} else {
			res.status(404).send('Not found');
		}
	})
	.post('/', async (req, res, next) => {
		new Topic(req.body.model)
			.save()
			.then((d) => res.json({message: 'ok', data: d}))
			.catch((e) => res.json({message: "error", ...e}))
	})
	.route('/:id').delete(function (req, res, next) {
		Topic
			.delete(parseInt(req.params.id))
			.then((d) => res.json({message: 'ok', data: d}))
			.catch((e) => res.json({message: "error", ...e}))

});
module.exports = router;
