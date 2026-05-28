const jwt = require('jsonwebtoken');
const ADMIN_ID = process.env.ADMIN_ID || '6a1583a052ae6a0fd5d9e6c'; // temp API1

module.exports = function (req, res, next) {
    if (req.user && req.user.id === ADMIN_ID) {
        return next();
    }
    return res.status(403).json({ message: 'Admin access required' });
};
