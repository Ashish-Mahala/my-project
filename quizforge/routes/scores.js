// routes/scores.js — Score Tracking & Leaderboard REST API (Unit VI - Node.js Syllabus)
const express = require('express');
const Score = require('../models/Score');
const Quiz = require('../models/Quiz');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/scores
// @desc    Submit a quiz score
// @access  Public (guest or logged in)
router.post('/', optionalAuth, async (req, res, next) => {
  try {
    const { quizId, correctAnswers, totalQuestions, timeTakenAvg, bestStreak } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const score = Math.round((correctAnswers / totalQuestions) * 100);

    const scoreDoc = await Score.create({
      user: req.user ? req.user._id : null,
      username: req.user ? req.user.username : 'Guest',
      quiz: quizId,
      quizTitle: quiz.title,
      topic: quiz.topic,
      difficulty: quiz.difficulty,
      score,
      correctAnswers,
      totalQuestions,
      timeTakenAvg: timeTakenAvg || 0,
      bestStreak: bestStreak || 0,
    });

    // Update quiz stats
    quiz.totalPlays += 1;
    if (score > quiz.bestScore) quiz.bestScore = score;
    await quiz.save();

    // Update user stats if logged in
    if (req.user) {
      req.user.totalQuizzesTaken += 1;
      req.user.totalScore += score;
      await req.user.save();
    }

    res.status(201).json({ success: true, data: scoreDoc });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/scores/leaderboard
// @desc    Global top scores leaderboard
// @access  Public
router.get('/leaderboard', async (req, res, next) => {
  try {
    const { limit = 20, quizId } = req.query;
    const filter = quizId ? { quiz: quizId } : {};

    const scores = await Score.find(filter)
      .sort({ score: -1, timeTakenAvg: 1 })
      .limit(Number(limit));

    res.json({ success: true, count: scores.length, data: scores });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/scores/my
// @desc    Get scores for the logged-in user
// @access  Private
router.get('/my', protect, async (req, res, next) => {
  try {
    const scores = await Score.find({ user: req.user._id })
      .sort({ completedAt: -1 })
      .limit(50);
    res.json({ success: true, count: scores.length, data: scores });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
