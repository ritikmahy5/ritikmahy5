const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  quizId: {
    type: String,
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyPlan',
  },
  answers: [{
    questionId: String,
    topic: String,
    question: String,
    userAnswer: mongoose.Schema.Types.Mixed,
    correctAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean,
    options: [String],
  }],
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  correct: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  userId: {
    type: String,
    default: 'default-user',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
