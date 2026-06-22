const express = require('express');
const { getChallenges, unlockHint, submitFlag, downloadChallengeFile } = require('../controllers/challengeController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getChallenges);
router.post('/:id/submit', protect, submitFlag);
router.post('/:id/hint/:hintId/unlock', protect, unlockHint);
router.get('/download/:filename', downloadChallengeFile);

module.exports = router;
