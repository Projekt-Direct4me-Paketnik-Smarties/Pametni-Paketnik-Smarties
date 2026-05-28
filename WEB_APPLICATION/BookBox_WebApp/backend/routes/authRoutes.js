var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController.js');
var tokenAuth = require('../middleware/tokenAuth');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/test', tokenAuth, function(req, res){
	return res.json({ ok: true, user: req.user });
});

router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;