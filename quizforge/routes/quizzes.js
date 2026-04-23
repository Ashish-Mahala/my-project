// routes/quizzes.js — Quiz CRUD REST API (Unit II & IV - Node.js Syllabus)
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Quiz = require('../models/Quiz');
const { protect, optionalAuth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/quizzes
// @desc    Get all quizzes — supports filter by topic & difficulty
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { topic, difficulty, page = 1, limit = 20 } = req.query;
    const filter = { isPublished: true };
    if (topic && topic !== 'all') filter.topic = topic;
    if (difficulty && difficulty !== 'all') filter.difficulty = difficulty;

    const quizzes = await Quiz.find(filter)
      .select('-questions.correctAnswer -questions.explanation') // Hide answers for listing
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Quiz.countDocuments(filter);

    res.json({
      success: true,
      count: quizzes.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get single quiz with all questions (for taking the quiz)
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz || !quiz.isPublished) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    res.json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/quizzes
// @desc    Create a new quiz
// @access  Private (logged in users) or Public (guest)
router.post(
  '/',
  optionalAuth,
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 100 }),
    body('topic').isIn(['JavaScript','HTML/CSS','Node.js','TypeScript','MongoDB','Express','Other']).withMessage('Invalid topic'),
    body('difficulty').isIn(['easy','medium','hard']).withMessage('Invalid difficulty'),
    body('timerPerQuestion').isInt({ min: 10, max: 120 }).withMessage('Timer must be 10-120 seconds'),
    body('questions').isArray({ min: 1 }).withMessage('At least 1 question required'),
    body('questions.*.questionText').notEmpty().withMessage('Each question needs text'),
    body('questions.*.options').isArray({ min: 4, max: 4 }).withMessage('Each question needs exactly 4 options'),
    body('questions.*.correctAnswer').isInt({ min: 0, max: 3 }).withMessage('Correct answer index must be 0-3'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    try {
      const quizData = {
        ...req.body,
        createdBy: req.user ? req.user._id : null,
        createdByName: req.user ? req.user.username : 'Anonymous',
      };
      const quiz = await Quiz.create(quizData);
      res.status(201).json({ success: true, data: quiz });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/quizzes/:id
// @desc    Update a quiz (only creator or admin)
// @access  Private
router.put('/:id', protect, async (req, res, next) => {
  try {
    let quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    // Only creator or admin can edit
    if (quiz.createdBy && quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this quiz' });
    }

    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete a quiz
// @access  Private
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    if (quiz.createdBy && quiz.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this quiz' });
    }

    await quiz.deleteOne();
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
