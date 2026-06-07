var express = require('express');
var router = express.Router();
var bookController = require('../controllers/bookController.js');
var multer = require('multer');
var upload = multer({dest: 'public/images/'});

function requiresAuth(req, res, next){
    if(req.session && req.session.userId && req.session.isAdmin === true){ 
        console.log("admin authorized")
        return next();
    } else{
        var err = new Error("Admin privileges required.");
        err.status = 403;
        console.log("admin NOT authorized")
        return next(err);
    }
}


var tokenAuth = require('../middleware/tokenAuth');

router.get('/', bookController.list);
router.get('/myBook', tokenAuth, bookController.myBooks);
router.get('/:id', bookController.show);

router.post('/', tokenAuth, upload.single('image'), bookController.create);
router.post('/:id/request-return', tokenAuth, bookController.requestReturn);

router.put('/:id', tokenAuth, upload.single('image'), bookController.update);

router.delete('/:id', tokenAuth, bookController.remove);

module.exports = router;
