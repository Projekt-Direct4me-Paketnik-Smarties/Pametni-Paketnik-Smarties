var express = require('express');
var router = express.Router();
var packetBoxController = require('../controllers/packetBoxController.js');

/*
 * GET
 */
router.get('/', packetBoxController.list);

/*
 * GET
 */
router.get('/:id', packetBoxController.show);

/*
 * POST
 */
router.post('/', packetBoxController.create);

/*
 * PUT
 */
router.put('/:id', packetBoxController.update);

/*
 * DELETE
 */
router.delete('/:id', packetBoxController.remove);

module.exports = router;
