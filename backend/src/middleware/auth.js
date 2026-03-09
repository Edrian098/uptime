const Helpers = require('../utils/helpers');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!process.env.API_KEY_REQUIRED) {
    return next();
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Missing authentication token' });
  }
  
  const decoded = Helpers.verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  
  req.user = decoded;
  next();
};

const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    const decoded = Helpers.verifyToken(token);
    if (decoded) {
      req.user = decoded;
    }
  }
  
  next();
};

module.exports = { authMiddleware, optionalAuth };
