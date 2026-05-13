var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');

function requiresLogin(req, res, next){
    if(req.session && req.session.userId){
        console.log("user authorized")
        return next();
    } else{
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        console.log("user NOT authorized")
        return next(err);
    }
}

//router.get('/', userController.list)
router.get('/logout', userController.logout)


router.post('/', userController.create)
router.post('/login', userController.login)


router.delete('/:id',requiresLogin, userController.remove);

module.exports = router;