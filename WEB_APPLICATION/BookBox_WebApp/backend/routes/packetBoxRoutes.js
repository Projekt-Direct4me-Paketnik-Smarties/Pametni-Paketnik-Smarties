var express = require('express');
var router = express.Router();
var packetBoxController = require('../controllers/packetBoxController.js');
function requiresAuth(req, res, next){
    if(req.session && req.session.userId && req.session.isAdmin === true){ 
        console.log("user authorized")
        return next();
    } else{
        var err = new Error("Admin privileges required.");
        err.status = 403;
        console.log("user NOT authorized")
        return next(err);
    }
}

router.get('/', packetBoxController.list);
router.get('/:id', packetBoxController.show);

router.post('/',requiresAuth, packetBoxController.create);

router.put('/books/:id',requiresAuth, packetBoxController.addNewBooks);
router.put('/:id',requiresAuth, packetBoxController.update);

router.delete('/:id',requiresAuth, packetBoxController.remove);

module.exports = router;
