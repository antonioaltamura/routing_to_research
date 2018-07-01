/**
 * Created by Antonio Altamura on 23/02/2016.
 */
"use strict";
let router = require('express').Router(),
    multer  = require('multer'),
    fs  = require('fs'),
    crypto = require('crypto'),
    path = require('path'),
	λ = $require('utils');


router.get('/thumb/:file*?', function(req, res){
	let filename = req.params.file || null;
	let paper_blank = path.join(__dirname, '..','..','public', 'img', 'paper_blank.png');
	if(!filename) {
		res.contentType("image/png");
		res.send(fs.readFileSync(paper_blank));
	} else {
		let file_noext = path.parse(filename).name
		let physical = path.join(__dirname, '..', '..', 'public', 'storage', file_noext + "-0.png");
		fs.readFile(physical, function (err, data) {
			if (err) {
				res.contentType("image/png");
				res.send(fs.readFileSync(paper_blank));
			} else {
				res.contentType("image/png");
				res.send(data);
			}
		});
	}
});


router.get('/:file', function(req, res){
	let filename = req.params.file;
	let physical=path.join(__dirname, '..','..','public', 'storage',filename);
	fs.readFile(physical, function (err,data){
		if(err){
			res.sendStatus(404);
		} else {
			res.contentType("application/pdf");
			res.send(data);
		}
	});
});

var multerForImage = multer(
    {
       // dest: '/storage/',
        rename: function (fieldname, filename) {
            return filename;
        },
        onFileUploadStart: function (file) {
            console.log(file.originalname + ' is starting ...');
        },
        onFileUploadComplete: function (file) {
            console.log(file.originalname + ' uploaded to  ' + file.path);
        }
    }
);
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..','..','public', 'storage'));

    },
    filename: function (req, file, cb) {
        crypto.pseudoRandomBytes(4, function (err, raw) {
            if (err) return cb(err);
            var filenameNoext=file.originalname.replace(/ /g,"_")
            filenameNoext=filenameNoext.substring(filenameNoext.lastIndexOf("."),0)
            cb(null, filenameNoext+'_'+raw.toString('hex') + path.extname(file.originalname))
        });
    }
});
var upload = multer({
    storage: storage,
    onFileUploadComplete: function (file) {
        console.log(file.originalname + ' uploaded to  ' + file.path);
    }
    }).single('file');

router.post('/', upload, function (req, res, next) {
	console.warn(req.file.filename)
	λ.PDFtoPng(req.file.filename)
		.then( thumbpath => {
			console.log("thumb file exist?")
			console.log(fs.existsSync(thumbpath)) // => true
			res.json({
				filename:req.file.filename,
				path:req.file.path,
				thumb:thumbpath
			});
		})
		.catch( e => {
			res.json({
				message:"error generating thumbnail",
				data:e
			})
		})
});
router.delete('/:file', upload, async function (req, res, next) {
	let physical= path.join(__dirname, '..','..','public', 'storage',req.params.file);
	let file_noext = path.parse(req.params.file).name
	let physical_thumb = path.join(__dirname, '..', '..', 'public', 'storage', file_noext + "-0.png");

	try {
		fs.unlinkSync(physical);
		fs.unlinkSync(physical_thumb);
		res.json(
			{message:'successfully deleted '+req.params.file}
		);
	} catch (e) {
		return res.json({message:'error',...e});
	}

});

module.exports = router;
