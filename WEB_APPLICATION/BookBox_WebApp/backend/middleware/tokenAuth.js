const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const auth = req.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = auth.slice(7);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = payload;
    return next();
  } catch (err) {
    console.log('JWT verify failed:', err.message || err);
    return res.status(401).json({ message: 'Invalid token' });
  }
};
