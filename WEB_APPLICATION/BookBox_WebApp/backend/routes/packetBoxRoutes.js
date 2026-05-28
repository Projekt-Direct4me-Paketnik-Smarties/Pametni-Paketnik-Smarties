var express = require('express');
var router = express.Router();
var packetBoxController = require('../controllers/packetBoxController.js');
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

router.get('/', packetBoxController.list);
router.get('/:id', packetBoxController.show);

router.post('/',requiresAuth, packetBoxController.create);

router.put('/books/:id',requiresAuth, packetBoxController.addNewBooks);
router.put('/:id',requiresAuth, packetBoxController.update);

router.delete('/:id',requiresAuth, packetBoxController.remove);

module.exports = router;
