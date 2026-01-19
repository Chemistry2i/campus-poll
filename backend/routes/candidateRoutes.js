const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');

const {
  createCandidate,
  getAllCandidates,
  getCandidateById,
  getApprovedCandidatesVotes,
  updateCandidate,
  deleteCandidate,
  getCandidatesByElection,
  approveCandidate,
  disqualifyCandidate,
  getMyCandidacy,
    getCandidateDashboard,
    getCandidateElectionStats,
  getCandidatesByElectionAndPosition,
  searchCandidates,
  withdrawMyCandidacy
} = require('../controllers/candidateController');

const { protect, adminOnly } = require('../middleware/authMiddleware');
const { redisClient } = require('../utils/redisClient');

// Redis cache middleware for GET endpoints
function cache(keyFn, ttl = 60) {
  return async (req, res, next) => {
    const key = keyFn(req);
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      // Monkey-patch res.json to cache the result
      const origJson = res.json.bind(res);
      res.json = (data) => {
        redisClient.setEx(key, ttl, JSON.stringify(data));
        return origJson(data);
      };
      next();
    } catch (err) {
      next();
    }
  };
}
const { createCandidateValidation } = require('../validators/candidateValidator');
const { validationResult } = require('express-validator');

// Only admin can create a new candidate (add multer here)
router.post(
  '/',
  protect,
  adminOnly,
  createCandidateValidation,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'symbol', maxCount: 1 }
  ]),
  createCandidate
);

// Get all candidates (admin or student) with cache
router.get('/', protect, cache(() => 'candidates:all', 60), getAllCandidates);
// Candidate: Get dashboard with stats (must come before /me/candidacy)
// (Add cache if needed)
router.get('/dashboard', protect, getCandidateDashboard);
// Candidate: Get detailed stats for a specific election
// (Add cache if needed)
router.get('/election/:electionId/stats', protect, getCandidateElectionStats);



// Candidate: Get my own candidacy info (must come before /:id!)
// (No cache, user-specific)
router.get('/me/candidacy', protect, getMyCandidacy);

// Candidate: Withdraw own candidacy
router.delete('/me/candidacy', protect, withdrawMyCandidacy);

// Get all candidates for a specific election (cache by election)
router.get('/election/:electionId', protect, cache(req => `candidates:election:${req.params.electionId}`, 60), getCandidatesByElection);

// Get candidates for a specific election and position (cache by election+position)
router.get('/election/:electionId/position/:position', protect, cache(req => `candidates:election:${req.params.electionId}:position:${req.params.position}`, 60), getCandidatesByElectionAndPosition);

// Search or paginate candidates (no cache, dynamic)
router.get('/search', protect, searchCandidates);

// Get approved candidates' votes (admin only, cache)
router.get("/approved-votes", protect, adminOnly, cache(() => 'candidates:approved-votes', 60), getApprovedCandidatesVotes);


// Admin: Approve a candidate
router.put('/:id/approve', protect, adminOnly, approveCandidate);

// Admin: Disqualify a candidate
router.put('/:id/disqualify', protect, adminOnly, disqualifyCandidate);

// Get a candidate by ID (cache by id)
router.get('/:id', protect, cache(req => `candidates:id:${req.params.id}`, 60), getCandidateById);

// Update a candidate (admin or candidate themselves)
router.put('/:id', protect, updateCandidate);

// Delete a candidate (admin only)
router.delete('/:id', protect, adminOnly, deleteCandidate);


module.exports = router;