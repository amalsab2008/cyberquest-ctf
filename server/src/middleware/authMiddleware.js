const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'cyberquest_jwt_secret_token_1337';

async function protect(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Fetch user details from database
      const userRes = await query(
        'SELECT id, name, email, roll_number, college_name, role, score FROM users WHERE id = $1',
        [decoded.id]
      );

      if (userRes.rows.length === 0) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = userRes.rows[0];
      next();
    } catch (error) {
      console.error('Token authentication error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
}

function adminOnly(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin authorization required' });
  }
}

module.exports = {
  protect,
  adminOnly,
  JWT_SECRET
};
