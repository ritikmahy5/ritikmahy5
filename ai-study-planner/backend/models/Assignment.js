const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  syllabusId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Syllabus',
    default: null,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  dueDate: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['assignment', 'quiz', 'exam', 'project', 'other'],
    default: 'assignment',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  reminded: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: String,
    default: 'default-user',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Assignment', assignmentSchema);
