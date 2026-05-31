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

router.post('/',requiresLogin, borrowController.create);
router.post('/return', requiresLogin, borrowController.returnBooks)

router.put('/:id',requiresAuth, borrowController.update);

router.delete('/:id',requiresAuth, borrowController.remove);

module.exports = router;
