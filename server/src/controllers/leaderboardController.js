const { query } = require('../config/db');

// @desc    Get real-time leaderboard rankings
// @route   GET /api/leaderboard
// @access  Public
async function getLeaderboard(req, res) {
  try {
    // Select users, count their solves, and get their last solve time
    // Order by score DESC, then by last solve time ASC (earlier solves get higher ranks)
    const sql = `
      SELECT u.id, u.name, u.college_name, u.roll_number, u.score,
             (SELECT COUNT(*) FROM solves s WHERE s.user_id = u.id) as solved_count,
             (SELECT MAX(created_at) FROM solves s WHERE s.user_id = u.id) as last_solve_time
      FROM users u
      WHERE u.role = 'student'
      ORDER BY u.score DESC, last_solve_time ASC
    `;

    const result = await query(sql);

    // Format output and add rank
    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      id: row.id,
      name: row.name,
      college_name: row.college_name,
      roll_number: row.roll_number,
      score: row.score,
      solved_count: parseInt(row.solved_count || 0),
      last_solve_time: row.last_solve_time
    }));

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error fetching leaderboard data' });
  }
}

// @desc    Export leaderboard to CSV (Admin only)
// @route   GET /api/leaderboard/export
// @access  Private/Admin
async function exportLeaderboardCSV(req, res) {
  try {
    const sql = `
      SELECT u.name, u.email, u.college_name, u.roll_number, u.score,
             (SELECT COUNT(*) FROM solves s WHERE s.user_id = u.id) as solved_count,
             (SELECT MAX(created_at) FROM solves s WHERE s.user_id = u.id) as last_solve_time
      FROM users u
      WHERE u.role = 'student'
      ORDER BY u.score DESC, last_solve_time ASC
    `;

    const result = await query(sql);

    // Build CSV content
    let csv = 'Rank,Name,Email,College Name,Roll Number,Score,Challenges Solved,Last Solve Time\n';
    
    result.rows.forEach((row, index) => {
      const rank = index + 1;
      const name = `"${row.name.replace(/"/g, '""')}"`;
      const email = `"${row.email.replace(/"/g, '""')}"`;
      const college = `"${row.college_name.replace(/"/g, '""')}"`;
      const roll = `"${row.roll_number.replace(/"/g, '""')}"`;
      const score = row.score;
      const solved = row.solved_count;
      const lastSolve = row.last_solve_time ? new Date(row.last_solve_time).toISOString() : 'N/A';

      csv += `${rank},${name},${email},${college},${roll},${score},${solved},${lastSolve}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=cyberquest_leaderboard.csv');
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting leaderboard CSV:', error);
    res.status(500).json({ message: 'Server error generating CSV report' });
  }
}

module.exports = {
  getLeaderboard,
  exportLeaderboardCSV
};
