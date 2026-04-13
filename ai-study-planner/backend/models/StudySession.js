const mongoose = require('mongoose');

const studySessionSchema = new mongoose.Schema({
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyPlan',
    default: null,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  topics: [{
    type: String,
  }],
  type: {
    type: String,
    enum: ['pomodoro', 'regular', 'quiz'],
    default: 'regular',
  },
  userId: {
    type: String,
    default: 'default-user',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('StudySession', studySessionSchema);
