var express = require('express');
var router = express.Router();
var packetBoxController = require('../controllers/packetBoxController.js');
var tokenAuth = require('../middleware/tokenAuth');
var adminAuth = require('../middleware/adminAuth.js')

router.get('/', packetBoxController.list);
router.get('/:id', packetBoxController.show);

router.post('/', tokenAuth,adminAuth, packetBoxController.create);

router.put('/:id', tokenAuth,adminAuth, packetBoxController.update);

router.delete('/:id', tokenAuth,adminAuth, packetBoxController.remove);

module.exports = router;
