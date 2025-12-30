const asyncHandler = require("express-async-handler");
const Vote = require("../models/Vote");
const Candidate = require("../models/Candidate");
const Election = require("../models/Election");

// @desc    Cast a vote
// @route   POST /api/votes
// @access  User
const castVote = asyncHandler(async (req, res) => {
  const { electionId, position, candidateId, abstain } = req.body;

  // 1. Basic Validation
  if (!electionId || !position) {
    return res.status(400).json({ message: "electionId and position are required" });
  }

  // 2. Fetch Election with .lean() for maximum performance
  const election = await Election.findById(electionId).lean();
  if (!election) {
    return res.status(400).json({ message: "Election not found" });
  }

  // 3. Time Window Check using Server Time
  const now = new Date();
  const start = election.startDate ? new Date(election.startDate) : null;
  const end = election.endDate ? new Date(election.endDate) : null;

  if (start && now < start) {
    return res.status(403).json({ message: 'Voting has not started yet' });
  }
  if (end && now > end) {
    return res.status(403).json({ message: 'Voting has ended' });
  }

  try {
    // 4. Record Vote & Atomic Integrity
    // Relying on the Unique Index: { user, election, position } 
    // This is the "Race Condition" fix.
    const vote = await Vote.create({
      user: req.user._id,
      election: electionId,
      position,
      candidate: abstain ? undefined : candidateId
    });

    // 5. Atomic Increment of Candidate's Vote Count
    if (!abstain && candidateId) {
      await Candidate.updateOne(
        { _id: candidateId, election: electionId, position },
        { $inc: { votes: 1 } }
      );
    }

    // 6. SUCCESS RESPONSE (Sent immediately to stop the lag)
    res.status(201).json({ message: "Vote cast successfully", vote });

    // 7. ASYNCHRONOUS BACKGROUND TASKS (Socket updates)
    setImmediate(async () => {
      try {
        const io = req.app.get('io');
        if (!io) return;

        // Notify specific election room
        io.to(`election_${electionId}`).emit('vote:update', {
          electionId,
          candidateId: candidateId || null,
          position,
          abstain: !!abstain,
        });

        // Background Stats Aggregation (Doesn't make the user wait)
        const allElections = await Election.find().select('title').lean();
        const votesPerElectionAgg = await Vote.aggregate([
          { $group: { _id: '$election', count: { $sum: 1 } } }
        ]);

        const votesPerElection = allElections.map(e => {
          const found = votesPerElectionAgg.find(v => String(v._id) === String(e._id));
          return { election: e._id, title: e.title, count: found ? found.count : 0 };
        });

        const candidateVotesAgg = await Candidate.find({ election: electionId })
          .select('name votes position')
          .lean();

        io.emit('dashboard:update', {
          votesPerElection,
          candidateVotes: candidateVotesAgg
        });

      } catch (emitError) {
        console.error('Background socket error:', emitError.message);
      }
    });

  } catch (error) {
    // Handling Duplicate Key error (User trying to vote twice)
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already voted for this position in this election" });
    }
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get own voting history
// @route   GET /api/votes/me
// @access  User
const getMyVotes = asyncHandler(async (req, res) => {
  try {
    const votes = await Vote.find({ user: req.user._id })
      .populate("election", "title")
      .populate("candidate", "name position");
    res.json(votes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all votes for an election
// @route   GET /api/votes/election/:electionId
// @access  Admin
const getVotesByElection = asyncHandler(async (req, res) => {
  try {
    const votes = await Vote.find({ election: req.params.electionId })
      .populate("user", "name email")
      .populate("candidate", "name position");
    res.json(votes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all votes for a candidate
// @route   GET /api/votes/candidate/:candidateId
// @access  Admin
const getVotesByCandidate = asyncHandler(async (req, res) => {
  try {
    const votes = await Vote.find({ candidate: req.params.candidateId })
      .populate("user", "name email")
      .populate("election", "title");
    res.json(votes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all votes (system-wide)
// @route   GET /api/votes
// @access  Admin
const getAllVotes = asyncHandler(async (req, res) => {
  try {
    const votes = await Vote.find()
      .populate("user", "name email")
      .populate("election", "title")
      .populate("candidate", "name position");
    res.json(votes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = {
  castVote,
  getMyVotes,
  getVotesByElection,
  getVotesByCandidate,
  getAllVotes
};