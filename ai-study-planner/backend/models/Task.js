const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyPlan',
    required: true,
  },
  day: {
    type: Number,
    required: true,
  },
  topics: [{
    type: String,
  }],
  duration: {
    type: String,
  },
  activities: [{
    type: String,
  }],
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  userId: {
    type: String,
    default: 'default-user',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema);
