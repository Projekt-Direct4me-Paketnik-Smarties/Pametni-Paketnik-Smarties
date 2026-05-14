var express = require('express');
var router = express.Router();
var bookController = require('../controllers/bookController.js');
var multer = require('multer');
var upload = multer({dest: 'public/images/'});

function requiresAuth(req, res, next){
    if(req.session && req.session.userId){ //here put it that it equals to admin or smth, so only admin can make books
        console.log("user authorized")
        return next();
    } else{
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        console.log("user NOT authorized")
        return next(err);
    }
}



router.get('/', bookController.list);
router.get('/:id', bookController.show);

router.post('/',requiresAuth,upload.single('image'), bookController.create);

router.put('/:id',requiresAuth,upload.single('image'), bookController.update);

router.delete('/:id',requiresAuth, bookController.remove);

module.exports = router;
