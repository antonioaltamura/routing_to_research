let router = require('express').Router(),
	Journal = $require("models").Journal;

router
	.get('/', async (req, res, next) => {
    	res.json(await Journal.getAll());
	})
	.get('/:id', async (req, res, next) => {
		let r = await Journal.getById(parseInt(req.params.id));
		if(r) {
			res.json(r)
		} else {
			res.status(404).send('Not found');
		}
	})
	.post('/', async (req, res, next) => {
		new Journal(req.body.model)
		.save()
		.then( (d) => res.json({message:'ok',data:d}))
		.catch( (e) => res.json({message:"error",...e}))
	})
	.route('/:id').delete(function(req, res,next) {
		Journal
			.delete(parseInt(req.params.id))
			.then( (d) => res.json({message:'ok',data:d}))
			.catch( (e) => res.json({message:"error",...e}))

});
module.exports = router;
