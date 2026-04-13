const mongoose = require('mongoose');

const userStatsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: 'default-user',
  },
  plansCreated: {
    type: Number,
    default: 0,
  },
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  currentStreak: {
    type: Number,
    default: 0,
  },
  longestStreak: {
    type: Number,
    default: 0,
  },
  lastActivityDate: {
    type: Date,
    default: null,
  },
  totalStudyMinutes: {
    type: Number,
    default: 0,
  },
  quizzesCompleted: {
    type: Number,
    default: 0,
  },
  perfectQuizzes: {
    type: Number,
    default: 0,
  },
  unlockedAchievements: [{
    type: String,
  }],
  pomodoroSessions: {
    type: Number,
    default: 0,
  },
  totalPomodoroMinutes: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('UserStats', userStatsSchema);
