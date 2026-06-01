var express = require('express');
var router = express.Router();
var bookController = require('../controllers/bookController.js');
var multer = require('multer');
var upload = multer({dest: 'public/images/'});

var tokenAuth = require('../middleware/tokenAuth');

router.get('/', bookController.list);
router.get('/myBook', tokenAuth, bookController.myBooks);
router.get('/:id', bookController.show);

router.post('/', tokenAuth, upload.single('image'), bookController.create);

router.put('/:id', tokenAuth, upload.single('image'), bookController.update);

router.delete('/:id', tokenAuth, bookController.remove);

module.exports = router;
