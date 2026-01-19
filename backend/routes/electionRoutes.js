const express = require('express');
const router = express.Router();

const {
    createElection,
    getAllElections,
    getElectionById,
    updateElection,
    deleteElection,
    publishResults,
    getElectionResults,
    getElectionCandidates,
    addPositionToElection,
    removePositionFromElection,
    getActiveElections,
    getUpcomingElections,
    getCompletedElections,
    searchElections,
    closeElection
} = require('../controllers/electionController');

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

// Admin: Create a new election
router.post('/', protect, adminOnly, createElection);

// Get all elections (admin or public) with cache
router.get('/', protect, cache(() => 'elections:all', 60), getAllElections);

// Get active (ongoing) elections with cache
router.get('/active', protect, cache(() => 'elections:active', 60), getActiveElections);

// Get upcoming elections with cache
router.get('/upcoming', protect, cache(() => 'elections:upcoming', 60), getUpcomingElections);

// Get completed elections with cache
router.get('/completed', protect, cache(() => 'elections:completed', 60), getCompletedElections);

// Search elections by title, status, etc. (no cache, dynamic)
router.get('/search', protect, searchElections);

// Get a single election by ID with cache
router.get('/:id', protect, cache(req => `elections:id:${req.params.id}`, 60), getElectionById);

// Admin: Update an election
router.put('/:id', protect, adminOnly, updateElection);

// Admin: Delete an election
router.delete('/:id', protect, adminOnly, deleteElection);

// Admin: Publish results for an election
router.put('/:id/publish-results', protect, adminOnly, publishResults);

// Get results for an election with cache
router.get('/:id/results', protect, cache(req => `elections:results:${req.params.id}`, 60), getElectionResults);

// Get all candidates for an election with cache
router.get('/:id/candidates', protect, cache(req => `elections:${req.params.id}:candidates`, 60), getElectionCandidates);

// Admin: Add a position to an election
router.post('/:id/positions', protect, adminOnly, addPositionToElection);

// Admin: Remove a position from an election
router.delete('/:id/positions/:position', protect, adminOnly, removePositionFromElection);

// Admin: Close an election (set status to completed)
router.put('/:id/close', protect, adminOnly, closeElection);

module.exports = router;