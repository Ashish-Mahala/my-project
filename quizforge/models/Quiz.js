// models/Quiz.js — Mongoose Schema & Model (Unit IV - Node.js Syllabus)
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: {
    type: [String],
    validate: {
      validator: (v) => v.length === 4,
      message: 'Each question must have exactly 4 options',
    },
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    default: 'No explanation provided.',
  },
});

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    topic: {
      type: String,
      required: true,
      enum: ['JavaScript', 'HTML/CSS', 'Node.js', 'TypeScript', 'MongoDB', 'Express', 'Other'],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['easy', 'medium', 'hard'],
    },
    timerPerQuestion: {
      type: Number,
      default: 30,
      min: 10,
      max: 120,
    },
    questions: {
      type: [QuestionSchema],
      validate: {
        validator: (v) => v.length >= 1,
        message: 'Quiz must have at least 1 question',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdByName: { type: String, default: 'Anonymous' },
    totalPlays: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', QuizSchema);
