var express = require('express');
var router = express.Router();
var borrowController = require('../controllers/borrowController.js');

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
