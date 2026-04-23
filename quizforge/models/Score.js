// models/Score.js — Mongoose Schema & Model (Unit IV - Node.js Syllabus)
const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    username: { type: String, default: 'Guest' },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    quizTitle: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, required: true },
    score: { type: Number, required: true },         // percentage 0-100
    correctAnswers: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    timeTakenAvg: { type: Number, default: 0 },      // avg seconds per question
    bestStreak: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for fast leaderboard queries
ScoreSchema.index({ quiz: 1, score: -1 });
ScoreSchema.index({ score: -1 });

module.exports = mongoose.model('Score', ScoreSchema);
