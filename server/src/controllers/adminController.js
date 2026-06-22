const { query, isSqlite } = require('../config/db');

// @desc    Create a new challenge with optional hints
// @route   POST /api/admin/challenges
// @access  Private/Admin
async function createChallenge(req, res) {
  const { title, description, points, category, difficulty, flag, files, hints } = req.body;

  if (!title || !description || !points || !category || !difficulty || !flag) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const challengeId = isSqlite ? require('crypto').randomUUID() : undefined;
    const filesStr = files ? JSON.stringify(files) : JSON.stringify([]);

    let chalQuery;
    let params;

    if (isSqlite) {
      chalQuery = `
        INSERT INTO challenges (id, title, description, points, category, difficulty, flag, files)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      params = [challengeId, title, description, parseInt(points), category, difficulty, flag, filesStr];
    } else {
      chalQuery = `
        INSERT INTO challenges (title, description, points, category, difficulty, flag, files)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      params = [title, description, parseInt(points), category, difficulty, flag, filesStr];
    }

    const result = await query(chalQuery, params);
    const finalId = isSqlite ? challengeId : result.rows[0].id;

    // Insert hints if provided
    if (hints && Array.isArray(hints)) {
      for (const hint of hints) {
        if (hint.hint_text) {
          const hintId = isSqlite ? require('crypto').randomUUID() : undefined;
          let hintQuery = isSqlite
            ? 'INSERT INTO hints (id, challenge_id, hint_text, penalty) VALUES ($1, $2, $3, $4)'
            : 'INSERT INTO hints (challenge_id, hint_text, penalty) VALUES ($1, $2, $3)';
          let hintParams = isSqlite
            ? [hintId, finalId, hint.hint_text, parseInt(hint.penalty || 0)]
            : [finalId, hint.hint_text, parseInt(hint.penalty || 0)];
          
          await query(hintQuery, hintParams);
        }
      }
    }

    res.status(201).json({
      id: finalId,
      title,
      description,
      points,
      category,
      difficulty,
      files: files || []
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ message: 'Server error creating challenge' });
  }
}

// @desc    Update a challenge
// @route   PUT /api/admin/challenges/:id
// @access  Private/Admin
async function updateChallenge(req, res) {
  const challengeId = req.params.id;
  const { title, description, points, category, difficulty, flag, files, hints } = req.body;

  try {
    // Check if challenge exists
    const checkRes = await query('SELECT id FROM challenges WHERE id = $1', [challengeId]);
    if (checkRes.rows.length === 0) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const filesStr = files ? JSON.stringify(files) : undefined;

    // Update challenge
    let updateSql = `
      UPDATE challenges
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          points = COALESCE($3, points),
          category = COALESCE($4, category),
          difficulty = COALESCE($5, difficulty),
          flag = COALESCE($6, flag)
    `;
    const params = [title, description, points ? parseInt(points) : null, category, difficulty, flag];
    
    if (filesStr) {
      updateSql += `, files = $7 WHERE id = $8`;
      params.push(filesStr, challengeId);
    } else {
      updateSql += ` WHERE id = $7`;
      params.push(challengeId);
    }

    await query(updateSql, params);

    // Update hints: for simplicity, we delete existing hints and insert new ones
    if (hints && Array.isArray(hints)) {
      await query('DELETE FROM hints WHERE challenge_id = $1', [challengeId]);
      
      for (const hint of hints) {
        if (hint.hint_text) {
          const hintId = isSqlite ? require('crypto').randomUUID() : undefined;
          let hintQuery = isSqlite
            ? 'INSERT INTO hints (id, challenge_id, hint_text, penalty) VALUES ($1, $2, $3, $4)'
            : 'INSERT INTO hints (challenge_id, hint_text, penalty) VALUES ($1, $2, $3)';
          let hintParams = isSqlite
            ? [hintId, challengeId, hint.hint_text, parseInt(hint.penalty || 0)]
            : [challengeId, hint.hint_text, parseInt(hint.penalty || 0)];
          
          await query(hintQuery, hintParams);
        }
      }
    }

    res.json({ message: 'Challenge updated successfully' });
  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({ message: 'Server error updating challenge' });
  }
}

// @desc    Delete a challenge
// @route   DELETE /api/admin/challenges/:id
// @access  Private/Admin
async function deleteChallenge(req, res) {
  const challengeId = req.params.id;

  try {
    // Delete challenge (foreign key cascades will clear hints, solves, submissions, unlocked_hints)
    const result = await query('DELETE FROM challenges WHERE id = $1', [challengeId]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    res.json({ message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({ message: 'Server error deleting challenge' });
  }
}

// @desc    View all submissions (log viewer)
// @route   GET /api/admin/submissions
// @access  Private/Admin
async function getSubmissions(req, res) {
  try {
    const sql = `
      SELECT s.id, s.submitted_flag, s.is_correct, s.created_at,
             u.name as user_name, u.email as user_email,
             c.title as challenge_title, c.category as challenge_category
      FROM submissions s
      JOIN users u ON s.user_id = u.id
      JOIN challenges c ON s.challenge_id = c.id
      ORDER BY s.created_at DESC
    `;

    const result = await query(sql);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ message: 'Server error fetching logs' });
  }
}

// @desc    View all participants
// @route   GET /api/admin/users
// @access  Private/Admin
async function getParticipants(req, res) {
  try {
    const result = await query(
      `SELECT id, name, email, roll_number, college_name, score, role, created_at
       FROM users
       WHERE role = 'student'
       ORDER BY score DESC, created_at ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ message: 'Server error fetching user profiles' });
  }
}

module.exports = {
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getSubmissions,
  getParticipants
};
