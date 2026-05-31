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



router.get('/', bookController.list);
router.get('/:id', bookController.show);

router.post('/',requiresAuth,upload.single('image'), bookController.create);

router.put('/:id',requiresAuth,upload.single('image'), bookController.update);

router.delete('/:id',requiresAuth, bookController.remove);

module.exports = router;
