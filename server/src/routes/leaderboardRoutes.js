const express = require('express');
const { getLeaderboard, exportLeaderboardCSV } = require('../controllers/leaderboardController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/export', protect, adminOnly, exportLeaderboardCSV);

module.exports = router;
