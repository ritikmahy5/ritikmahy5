const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  semester: {
    type: String,
    default: 'Current',
  },
  professor: {
    type: String,
    default: 'Unknown',
  },
  fileName: {
    type: String,
  },
  rawText: {
    type: String,
  },
  parsedData: {
    topics: [{
      name: String,
      week: Number,
      description: String,
    }],
    assignments: [{
      title: String,
      type: String,
      dueDate: Date,
      description: String,
      weight: String,
    }],
    gradingBreakdown: {
      type: Map,
      of: String,
    },
    keyDates: [{
      event: String,
      date: Date,
    }],
    studyRecommendations: [String],
  },
  userId: {
    type: String,
    default: 'default-user',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Syllabus', syllabusSchema);
