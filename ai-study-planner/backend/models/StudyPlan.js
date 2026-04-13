const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  goals: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate',
  },
  content: {
    overview: String,
    dailyPlan: [{
      day: Number,
      topics: [String],
      duration: String,
      activities: [String],
      resources: [String],
    }],
    tips: [String],
    assessments: [{
      day: Number,
      type: String,
      topics: [String],
    }],
  },
  syllabusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Syllabus',
    default: null,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  userId: {
    type: String,
    default: 'default-user',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
