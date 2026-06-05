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
var tokenAuth = require('../middleware/tokenAuth');
var adminAuth = require('../middleware/adminAuth.js')

router.get('/', packetBoxController.list);
router.get('/:id', packetBoxController.show);

router.post('/', tokenAuth,adminAuth, packetBoxController.create);

router.put('/:id', tokenAuth,adminAuth, packetBoxController.update);

router.delete('/:id', tokenAuth,adminAuth, packetBoxController.remove);

module.exports = router;
