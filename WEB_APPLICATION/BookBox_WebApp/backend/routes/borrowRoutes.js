var express = require('express');
var router = express.Router();
var borrowController = require('../controllers/borrowController.js');
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

router.get('/', requiresLogin, borrowController.listMine); //to get your own
router.get('/all', requiresAuth, borrowController.listAll); //to get all
router.get('/:id',requiresLogin, borrowController.show);

var tokenAuth = require('../middleware/tokenAuth');
var adminAuth = require('../middleware/adminAuth')

router.get('/', tokenAuth, borrowController.listPerUser);
router.get('/all', tokenAuth,adminAuth, borrowController.list); //admin
router.get('/:id', tokenAuth, borrowController.show);

router.post('/borrow', tokenAuth, borrowController.borrowBooks);
router.post('/return', tokenAuth, borrowController.returnBooks);
router.post('/reposes', tokenAuth, borrowController.reposesBooks);
router.post('/donate', tokenAuth, borrowController.donateBooks);

router.put('/:id', tokenAuth, borrowController.update);

router.delete('/:id', tokenAuth,adminAuth, borrowController.remove); //admin

module.exports = router;
