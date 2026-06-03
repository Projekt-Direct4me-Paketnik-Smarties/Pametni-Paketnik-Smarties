var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');
var tokenAuth = require('../middleware/tokenAuth');
var upload = require('../middleware/upload');

router.get('/', userController.list);
router.get('/:id', userController.show);

router.post('/', userController.create)
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/refresh', userController.refresh);
router.post('/image-login', upload.single('image'), userController.image_2FA);

router.put('/:id', tokenAuth, userController.update);

router.delete('/:id', tokenAuth, userController.remove);

module.exports = router;