const { query, isSqlite } = require('../config/db');

// Helper to award a badge to a user
async function awardBadge(userId, badgeId) {
  try {
    // Check if user already has this badge
    const checkRes = await query(
      'SELECT id FROM user_badges WHERE user_id = $1 AND badge_id = $2',
      [userId, badgeId]
    );

    if (checkRes.rows.length === 0) {
      const userBadgeId = isSqlite ? require('crypto').randomUUID() : undefined;
      let insertQuery = isSqlite 
        ? 'INSERT INTO user_badges (id, user_id, badge_id) VALUES ($1, $2, $3)'
        : 'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)';
      let params = isSqlite ? [userBadgeId, userId, badgeId] : [userId, badgeId];
      
      await query(insertQuery, params);
      
      // Fetch badge details to return
      const badgeRes = await query('SELECT name, description, icon FROM badges WHERE id = $1', [badgeId]);
      return badgeRes.rows[0];
    }
  } catch (error) {
    console.error('Error awarding badge:', error);
  }
  return null;
}

// Evaluate badges for a user after a correct solve
async function evaluateBadges(userId, challengeCategory) {
  const awarded = [];

  try {
    // 1. Check for "First Blood" (First Solve)
    const solvesCheck = await query('SELECT COUNT(*) as count FROM solves WHERE user_id = $1', [userId]);
    const solveCount = parseInt(solvesCheck.rows[0].count || 0);

    if (solveCount >= 1) {
      const badge = await awardBadge(userId, 'badge-first-blood');
      if (badge) awarded.push(badge);
    }

    // 2. Check for Category Clears
    // Get all challenges in this category
    const categoryChallengesCheck = await query(
      'SELECT COUNT(*) as count FROM challenges WHERE category = $1',
      [challengeCategory]
    );
    const categoryChallengesCount = parseInt(categoryChallengesCheck.rows[0].count || 0);

    // Get user solves in this category
    const categorySolvesCheck = await query(
      `SELECT COUNT(*) as count FROM solves s
       JOIN challenges c ON s.challenge_id = c.id
       WHERE s.user_id = $1 AND c.category = $2`,
      [userId, challengeCategory]
    );
    const categorySolvesCount = parseInt(categorySolvesCheck.rows[0].count || 0);

    if (categoryChallengesCount > 0 && categoryChallengesCount === categorySolvesCount) {
      let badgeId = null;
      if (challengeCategory === 'Cryptography') {
        badgeId = 'badge-crypto-master';
      } else if (challengeCategory === 'Web Security') {
        badgeId = 'badge-web-hacker';
      }
      
      if (badgeId) {
        const badge = await awardBadge(userId, badgeId);
        if (badge) awarded.push(badge);
      }
    }

    // 3. Check for Score Threshold (300 points)
    const userRes = await query('SELECT score FROM users WHERE id = $1', [userId]);
    const score = parseInt(userRes.rows[0].score || 0);

    if (score >= 300) {
      const badge = await awardBadge(userId, 'badge-elite-hacker');
      if (badge) awarded.push(badge);
    }
  } catch (error) {
    console.error('Error evaluating badges:', error);
  }

  return awarded;
}

// @desc    Get all challenges (without flags, showing unlocked hints)
// @route   GET /api/challenges
// @access  Private
async function getChallenges(req, res) {
  const userId = req.user.id;

  try {
    // Get all challenges
    const challengesRes = await query(
      'SELECT id, title, description, points, category, difficulty, files FROM challenges ORDER BY points ASC'
    );

    // Get solved challenges by this user
    const solvesRes = await query('SELECT challenge_id, points_awarded FROM solves WHERE user_id = $1', [userId]);
    const solvedMap = {};
    solvesRes.rows.forEach(solve => {
      solvedMap[solve.challenge_id] = solve.points_awarded;
    });

    // Get unlocked hints by this user
    const unlockedHintsRes = await query(
      'SELECT hint_id FROM unlocked_hints WHERE user_id = $1',
      [userId]
    );
    const unlockedHintSet = new Set(unlockedHintsRes.rows.map(h => h.hint_id));

    // Get all hints
    const hintsRes = await query('SELECT id, challenge_id, hint_text, penalty FROM hints');
    
    // Group hints by challenge_id
    const hintsMap = {};
    hintsRes.rows.forEach(hint => {
      if (!hintsMap[hint.challenge_id]) {
        hintsMap[hint.challenge_id] = [];
      }
      
      const isUnlocked = unlockedHintSet.has(hint.id) || solvedMap[hint.challenge_id] !== undefined;
      hintsMap[hint.challenge_id].push({
        id: hint.id,
        penalty: hint.penalty,
        hint_text: isUnlocked ? hint.hint_text : null,
        is_unlocked: isUnlocked
      });
    });

    // Format challenge data
    const challenges = challengesRes.rows.map(ch => {
      let filesParsed = [];
      try {
        filesParsed = typeof ch.files === 'string' ? JSON.parse(ch.files) : (ch.files || []);
      } catch (e) {
        filesParsed = [];
      }

      return {
        id: ch.id,
        title: ch.title,
        description: ch.description,
        points: ch.points,
        category: ch.category,
        difficulty: ch.difficulty,
        files: filesParsed,
        is_solved: solvedMap[ch.id] !== undefined,
        points_awarded: solvedMap[ch.id] || 0,
        hints: hintsMap[ch.id] || []
      };
    });

    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Server error fetching challenges' });
  }
}

// @desc    Unlock a hint for a challenge
// @route   POST /api/challenges/:id/hint/:hintId/unlock
// @access  Private
async function unlockHint(req, res) {
  const userId = req.user.id;
  const challengeId = req.params.id;
  const hintId = req.params.hintId;

  try {
    // 1. Verify hint exists and belongs to challenge
    const hintRes = await query(
      'SELECT id, hint_text, penalty FROM hints WHERE id = $1 AND challenge_id = $2',
      [hintId, challengeId]
    );

    if (hintRes.rows.length === 0) {
      return res.status(404).json({ message: 'Hint not found for this challenge' });
    }

    const hint = hintRes.rows[0];

    // 2. Check if challenge is already solved
    const solveRes = await query(
      'SELECT id FROM solves WHERE user_id = $1 AND challenge_id = $2',
      [userId, challengeId]
    );
    if (solveRes.rows.length > 0) {
      return res.json({ 
        message: 'Challenge already solved. Hint text revealed.',
        hint_text: hint.hint_text 
      });
    }

    // 3. Check if hint is already unlocked
    const checkRes = await query(
      'SELECT id FROM unlocked_hints WHERE user_id = $1 AND hint_id = $2',
      [userId, hintId]
    );

    if (checkRes.rows.length > 0) {
      return res.json({
        message: 'Hint already unlocked.',
        hint_text: hint.hint_text
      });
    }

    // 4. Unlock hint
    const unlockedId = isSqlite ? require('crypto').randomUUID() : undefined;
    let insertQuery = isSqlite
      ? 'INSERT INTO unlocked_hints (id, user_id, challenge_id, hint_id) VALUES ($1, $2, $3, $4)'
      : 'INSERT INTO unlocked_hints (user_id, challenge_id, hint_id) VALUES ($1, $2, $3)';
    let params = isSqlite ? [unlockedId, userId, challengeId, hintId] : [userId, challengeId, hintId];

    await query(insertQuery, params);

    res.json({
      message: 'Hint unlocked successfully!',
      hint_text: hint.hint_text,
      penalty: hint.penalty
    });
  } catch (error) {
    console.error('Error unlocking hint:', error);
    res.status(500).json({ message: 'Server error unlocking hint' });
  }
}

// @desc    Submit a flag for validation
// @route   POST /api/challenges/:id/submit
// @access  Private
async function submitFlag(req, res) {
  const userId = req.user.id;
  const challengeId = req.params.id;
  const { flag } = req.body;

  if (!flag) {
    return res.status(400).json({ message: 'Please submit a flag' });
  }

  try {
    // 1. Fetch challenge details
    const challengeRes = await query(
      'SELECT id, flag, points, title, category FROM challenges WHERE id = $1',
      [challengeId]
    );

    if (challengeRes.rows.length === 0) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    const challenge = challengeRes.rows[0];

    // 2. Check if already solved
    const solvedCheck = await query(
      'SELECT id FROM solves WHERE user_id = $1 AND challenge_id = $2',
      [userId, challengeId]
    );

    if (solvedCheck.rows.length > 0) {
      return res.status(400).json({ message: 'You have already solved this challenge!' });
    }

    // 3. Validate flag
    const isCorrect = flag.trim() === challenge.flag.trim();

    // 4. Log submission
    const submissionId = isSqlite ? require('crypto').randomUUID() : undefined;
    let subQuery = isSqlite
      ? 'INSERT INTO submissions (id, user_id, challenge_id, submitted_flag, is_correct) VALUES ($1, $2, $3, $4, $5)'
      : 'INSERT INTO submissions (user_id, challenge_id, submitted_flag, is_correct) VALUES ($1, $2, $3, $4)';
    let subParams = isSqlite 
      ? [submissionId, userId, challengeId, flag, isCorrect] 
      : [userId, challengeId, flag, isCorrect];

    await query(subQuery, subParams);

    if (!isCorrect) {
      return res.json({ correct: false, message: 'Incorrect flag! Try again.' });
    }

    // 5. Calculate point penalties from unlocked hints
    const hintsRes = await query(
      `SELECT h.penalty, h.id FROM unlocked_hints uh
       JOIN hints h ON uh.hint_id = h.id
       WHERE uh.user_id = $1 AND uh.challenge_id = $2`,
      [userId, challengeId]
    );

    const totalPenalty = hintsRes.rows.reduce((sum, h) => sum + h.penalty, 0);
    const pointsAwarded = Math.max(0, challenge.points - totalPenalty);
    const hintsUsedArray = hintsRes.rows.map(h => h.id);

    // 6. Record solve
    const solveId = isSqlite ? require('crypto').randomUUID() : undefined;
    let solveQuery = isSqlite
      ? 'INSERT INTO solves (id, user_id, challenge_id, points_awarded, hints_used) VALUES ($1, $2, $3, $4, $5)'
      : 'INSERT INTO solves (user_id, challenge_id, points_awarded, hints_used) VALUES ($1, $2, $3, $4)';
    
    let solveParams = isSqlite
      ? [solveId, userId, challengeId, pointsAwarded, JSON.stringify(hintsUsedArray)]
      : [userId, challengeId, pointsAwarded, JSON.stringify(hintsUsedArray)];

    await query(solveQuery, solveParams);

    // 7. Update user total score
    await query(
      'UPDATE users SET score = score + $1 WHERE id = $2',
      [pointsAwarded, userId]
    );

    // 8. Evaluate Badges
    const earnedBadges = await evaluateBadges(userId, challenge.category);

    res.json({
      correct: true,
      message: `Correct flag! You solved "${challenge.title}"!`,
      points_awarded: pointsAwarded,
      penalty_applied: totalPenalty,
      badges: earnedBadges
    });
  } catch (error) {
    console.error('Error submitting flag:', error);
    res.status(500).json({ message: 'Server error processing flag submission' });
  }
}

// Download forensic challenge image
function downloadChallengeFile(req, res) {
  const filename = req.params.filename;
  if (filename !== 'hacker_avatar.jpg') {
    return res.status(404).json({ message: 'File not found' });
  }
  const path = require('path');
  const filePath = path.join(__dirname, '..', '..', 'public', 'files', 'hacker_avatar.jpg');
  res.download(filePath);
}

module.exports = {
  getChallenges,
  unlockHint,
  submitFlag,
  downloadChallengeFile
};
