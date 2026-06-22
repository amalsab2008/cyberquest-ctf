const express = require('express');
const { createChallenge, updateChallenge, deleteChallenge, getSubmissions, getParticipants } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.post('/challenges', createChallenge);
router.put('/challenges/:id', updateChallenge);
router.delete('/challenges/:id', deleteChallenge);
router.get('/submissions', getSubmissions);
router.get('/users', getParticipants);

module.exports = router;
