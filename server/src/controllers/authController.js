const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, isSqlite } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Generate JWT token
function generateToken(id) {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });
}

// @desc    Register a new student/user
// @route   POST /api/auth/register
// @access  Public
async function registerUser(req, res) {
  const { name, email, password, roll_number, college_name } = req.body;

  if (!name || !email || !password || !roll_number || !college_name) {
    return res.status(400).json({ message: 'Please provide all registration fields' });
  }

  try {
    // Check if user already exists
    const userExists = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Determine role (first user becomes admin for testing ease)
    const countCheck = await query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(countCheck.rows[0].count || 0);
    const role = userCount === 0 || email.toLowerCase().includes('admin@') ? 'admin' : 'student';

    // Insert user
    // Generate UUID string for SQLite
    const userId = isSqlite ? require('crypto').randomUUID() : undefined;
    
    let insertQuery;
    let params;

    if (isSqlite) {
      insertQuery = `
        INSERT INTO users (id, name, email, password_hash, roll_number, college_name, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      params = [userId, name, email, passwordHash, roll_number, college_name, role];
    } else {
      insertQuery = `
        INSERT INTO users (name, email, password_hash, roll_number, college_name, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      params = [name, email, passwordHash, roll_number, college_name, role];
    }

    const result = await query(insertQuery, params);
    const id = isSqlite ? userId : result.rows[0].id;

    res.status(201).json({
      id,
      name,
      email,
      roll_number,
      college_name,
      role,
      token: generateToken(id)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
}

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter email and password' });
  }

  try {
    // Find user
    const userRes = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userRes.rows[0];

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        roll_number: user.roll_number,
        college_name: user.college_name,
        role: user.role,
        score: user.score,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
}

// @desc    Get user profile details
// @route   GET /api/auth/me
// @access  Private
async function getMe(req, res) {
  try {
    // Fetch solves for this user
    const solvesRes = await query(
      `SELECT s.challenge_id, s.points_awarded, s.created_at, c.title, c.category, c.difficulty
       FROM solves s
       JOIN challenges c ON s.challenge_id = c.id
       WHERE s.user_id = $1`,
      [req.user.id]
    );

    // Fetch badges awarded
    const badgesRes = await query(
      `SELECT b.id, b.name, b.description, b.icon
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1`,
      [req.user.id]
    );

    // Fetch user rank dynamically
    const rankRes = await query(
      `SELECT count(*) + 1 as rank FROM users WHERE score > $1`,
      [req.user.score]
    );
    const rank = parseInt(rankRes.rows[0].rank || 1);

    res.json({
      ...req.user,
      rank,
      solves: solvesRes.rows,
      badges: badgesRes.rows
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching user details' });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getMe
};
