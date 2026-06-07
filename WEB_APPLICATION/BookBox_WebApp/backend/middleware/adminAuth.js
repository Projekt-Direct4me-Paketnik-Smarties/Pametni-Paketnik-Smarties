const UserModel = require('../models/User.js');

module.exports = async function (req, res, next) {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized: No user ID found' });
        }

        const user = await UserModel.findById(req.user.id);

        if (user && user.isAdmin === true) {
            return next();
        }

        return res.status(403).json({ message: 'Admin access required' });
    } catch (err) {
        return res.status(500).json({ message: 'Error verifying admin status', error: err.message });
    }
};
