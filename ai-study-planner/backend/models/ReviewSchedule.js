const mongoose = require('mongoose');

const reviewScheduleSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
  },
  easeFactor: {
    type: Number,
    default: 2.5,
  },
  interval: {
    type: Number,
    default: 1,
  },
  repetitions: {
    type: Number,
    default: 0,
  },
  lastReview: {
    type: Date,
    default: null,
  },
  nextReview: {
    type: Date,
    default: Date.now,
  },
  quality: {
    type: Number,
    min: 0,
    max: 5,
    default: null,
  },
  userId: {
    type: String,
    default: 'default-user',
  },
}, {
  timestamps: true,
});

// Compound index for unique topic per user
reviewScheduleSchema.index({ topic: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ReviewSchedule', reviewScheduleSchema);
