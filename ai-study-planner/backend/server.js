const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, TXT, and DOC files are allowed.'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for study plans (in production, use a database)
const studyPlans = new Map();
const tasks = new Map();
const studySessions = new Map();
const achievements = new Map();
const quizzes = new Map();
const quizAttempts = new Map();
const reviewSchedule = new Map();
const chatHistory = new Map();
const notes = new Map();
const syllabi = new Map();
const assignments = new Map();

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
  { id: 'first_plan', name: 'First Steps', description: 'Create your first study plan', icon: '🎯', condition: 'plans_created >= 1' },
  { id: 'plan_master', name: 'Plan Master', description: 'Create 5 study plans', icon: '📚', condition: 'plans_created >= 5' },
  { id: 'first_task', name: 'Task Starter', description: 'Complete your first task', icon: '✅', condition: 'tasks_completed >= 1' },
  { id: 'task_champion', name: 'Task Champion', description: 'Complete 10 tasks', icon: '🏆', condition: 'tasks_completed >= 10' },
  { id: 'task_legend', name: 'Task Legend', description: 'Complete 50 tasks', icon: '👑', condition: 'tasks_completed >= 50' },
  { id: 'streak_3', name: 'On Fire', description: 'Maintain a 3-day streak', icon: '🔥', condition: 'streak >= 3' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '⚡', condition: 'streak >= 7' },
  { id: 'streak_30', name: 'Dedication Master', description: 'Maintain a 30-day streak', icon: '💎', condition: 'streak >= 30' },
  { id: 'quiz_first', name: 'Quiz Taker', description: 'Complete your first quiz', icon: '📝', condition: 'quizzes_completed >= 1' },
  { id: 'quiz_ace', name: 'Quiz Ace', description: 'Score 100% on a quiz', icon: '🌟', condition: 'perfect_quizzes >= 1' },
  { id: 'study_hour', name: 'Hour of Power', description: 'Study for 1 hour total', icon: '⏰', condition: 'total_study_minutes >= 60' },
  { id: 'study_marathon', name: 'Study Marathon', description: 'Study for 10 hours total', icon: '🏃', condition: 'total_study_minutes >= 600' },
];

// User stats (in production, this would be per-user)
let userStats = {
  plansCreated: 0,
  tasksCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastActivityDate: null,
  totalStudyMinutes: 0,
  quizzesCompleted: 0,
  perfectQuizzes: 0,
  unlockedAchievements: [],
};

// Initialize OpenAI (optional - will work without API key using mock responses)
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Helper function to generate AI-powered study plan
async function generateStudyPlan(subject, duration, goals, difficulty) {
  const prompt = `Create a detailed study plan for the following:
Subject: ${subject}
Duration: ${duration} days
Goals: ${goals}
Difficulty Level: ${difficulty}

Please provide:
1. A daily breakdown of topics to study
2. Recommended resources and study techniques
3. Practice exercises or assessments
4. Tips for staying motivated

Format the response as a structured JSON object with the following schema:
{
  "overview": "brief overview of the study plan",
  "dailyPlan": [
    {
      "day": 1,
      "topics": ["topic1", "topic2"],
      "duration": "2 hours",
      "activities": ["activity1", "activity2"],
      "resources": ["resource1", "resource2"]
    }
  ],
  "tips": ["tip1", "tip2"],
  "assessments": [
    {
      "day": 7,
      "type": "quiz",
      "topics": ["topic1", "topic2"]
    }
  ]
}`;

  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational consultant and study planner. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return generateMockStudyPlan(subject, duration, goals, difficulty);
    }
  } else {
    return generateMockStudyPlan(subject, duration, goals, difficulty);
  }
}

// Mock study plan generator when OpenAI is not available
function generateMockStudyPlan(subject, duration, goals, difficulty) {
  const daysCount = parseInt(duration) || 7;
  const dailyPlan = [];

  const topics = generateTopicsForSubject(subject);
  const techniques = [
    'Active recall practice',
    'Spaced repetition',
    'Practice problems',
    'Video tutorials',
    'Reading documentation',
    'Hands-on projects',
    'Peer discussion',
    'Mind mapping',
  ];

  for (let day = 1; day <= daysCount; day++) {
    const topicIndex = (day - 1) % topics.length;
    dailyPlan.push({
      day,
      topics: [topics[topicIndex], topics[(topicIndex + 1) % topics.length]],
      duration: difficulty === 'advanced' ? '3-4 hours' : difficulty === 'intermediate' ? '2-3 hours' : '1-2 hours',
      activities: [
        techniques[day % techniques.length],
        techniques[(day + 1) % techniques.length],
      ],
      resources: [
        `${subject} documentation`,
        `Online tutorials for ${topics[topicIndex]}`,
        'Practice exercises',
      ],
    });
  }

  const assessments = [];
  for (let i = 7; i <= daysCount; i += 7) {
    assessments.push({
      day: i,
      type: i % 14 === 0 ? 'comprehensive test' : 'quiz',
      topics: topics.slice(0, Math.min(3, topics.length)),
    });
  }

  return {
    overview: `A ${daysCount}-day structured study plan for ${subject} designed to help you achieve: ${goals}. This ${difficulty} level plan includes daily learning activities, practical exercises, and regular assessments.`,
    dailyPlan,
    tips: [
      'Start each session with a quick review of previous topics',
      'Take regular breaks using the Pomodoro technique (25 min study, 5 min break)',
      'Practice active recall by testing yourself without looking at notes',
      'Create summary notes after each study session',
      'Stay consistent with your schedule for best results',
      'Get enough sleep - it helps consolidate learning',
    ],
    assessments,
  };
}

function generateTopicsForSubject(subject) {
  const subjectTopics = {
    javascript: ['Variables & Data Types', 'Functions & Scope', 'Arrays & Objects', 'DOM Manipulation', 'Async Programming', 'ES6+ Features', 'Error Handling', 'Modules'],
    python: ['Syntax & Variables', 'Data Structures', 'Functions', 'OOP Concepts', 'File Handling', 'Libraries', 'Error Handling', 'Web Frameworks'],
    mathematics: ['Algebra', 'Calculus', 'Statistics', 'Probability', 'Linear Algebra', 'Geometry', 'Trigonometry', 'Number Theory'],
    physics: ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Waves', 'Quantum Mechanics', 'Relativity', 'Nuclear Physics'],
    chemistry: ['Atomic Structure', 'Chemical Bonding', 'Organic Chemistry', 'Inorganic Chemistry', 'Thermochemistry', 'Electrochemistry', 'Kinetics', 'Equilibrium'],
    biology: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Anatomy', 'Physiology', 'Microbiology', 'Biochemistry'],
    default: ['Fundamentals', 'Core Concepts', 'Advanced Topics', 'Practical Applications', 'Problem Solving', 'Review & Practice', 'Case Studies', 'Final Project'],
  };

  const lowerSubject = subject.toLowerCase();
  for (const [key, topics] of Object.entries(subjectTopics)) {
    if (lowerSubject.includes(key)) {
      return topics;
    }
  }
  return subjectTopics.default;
}

// Helper function to check and update streak
function updateStreak() {
  const today = new Date().toDateString();
  const lastActivity = userStats.lastActivityDate ? new Date(userStats.lastActivityDate).toDateString() : null;
  
  if (lastActivity === today) {
    return; // Already updated today
  }
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (lastActivity === yesterday.toDateString()) {
    userStats.currentStreak++;
  } else if (lastActivity !== today) {
    userStats.currentStreak = 1;
  }
  
  if (userStats.currentStreak > userStats.longestStreak) {
    userStats.longestStreak = userStats.currentStreak;
  }
  
  userStats.lastActivityDate = new Date().toISOString();
  checkAchievements();
}

// Helper function to check and unlock achievements
function checkAchievements() {
  const newAchievements = [];
  
  for (const achievement of ACHIEVEMENT_DEFINITIONS) {
    if (userStats.unlockedAchievements.includes(achievement.id)) continue;
    
    let unlocked = false;
    switch (achievement.id) {
      case 'first_plan':
        unlocked = userStats.plansCreated >= 1;
        break;
      case 'plan_master':
        unlocked = userStats.plansCreated >= 5;
        break;
      case 'first_task':
        unlocked = userStats.tasksCompleted >= 1;
        break;
      case 'task_champion':
        unlocked = userStats.tasksCompleted >= 10;
        break;
      case 'task_legend':
        unlocked = userStats.tasksCompleted >= 50;
        break;
      case 'streak_3':
        unlocked = userStats.currentStreak >= 3;
        break;
      case 'streak_7':
        unlocked = userStats.currentStreak >= 7;
        break;
      case 'streak_30':
        unlocked = userStats.currentStreak >= 30;
        break;
      case 'quiz_first':
        unlocked = userStats.quizzesCompleted >= 1;
        break;
      case 'quiz_ace':
        unlocked = userStats.perfectQuizzes >= 1;
        break;
      case 'study_hour':
        unlocked = userStats.totalStudyMinutes >= 60;
        break;
      case 'study_marathon':
        unlocked = userStats.totalStudyMinutes >= 600;
        break;
    }
    
    if (unlocked) {
      userStats.unlockedAchievements.push(achievement.id);
      newAchievements.push(achievement);
    }
  }
  
  return newAchievements;
}

// Spaced repetition algorithm (SM-2 based)
function calculateNextReview(topic, quality) {
  // quality: 0-5 (0 = complete blackout, 5 = perfect recall)
  const existing = reviewSchedule.get(topic) || {
    easeFactor: 2.5,
    interval: 1,
    repetitions: 0,
  };
  
  let { easeFactor, interval, repetitions } = existing;
  
  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions++;
  } else {
    repetitions = 0;
    interval = 1;
  }
  
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  const reviewData = {
    topic,
    easeFactor,
    interval,
    repetitions,
    lastReview: new Date().toISOString(),
    nextReview: nextReviewDate.toISOString(),
    quality,
  };
  
  reviewSchedule.set(topic, reviewData);
  return reviewData;
}

// Generate quiz questions for a topic
function generateQuizQuestions(subject, topics, difficulty, count = 5) {
  const questions = [];
  const questionTypes = ['multiple_choice', 'true_false', 'fill_blank'];
  
  // Topic-specific question templates
  const topicQuestions = {
    'Variables & Data Types': [
      { q: 'Which of the following is NOT a primitive data type in JavaScript?', options: ['String', 'Number', 'Array', 'Boolean'], correct: 2 },
      { q: 'What keyword is used to declare a constant in JavaScript?', options: ['var', 'let', 'const', 'static'], correct: 2 },
      { q: 'Variables declared with `let` are block-scoped.', type: 'true_false', correct: true },
    ],
    'Functions & Scope': [
      { q: 'What is a closure in JavaScript?', options: ['A syntax error', 'A function that has access to variables from its outer scope', 'A way to close the browser', 'A type of loop'], correct: 1 },
      { q: 'Arrow functions have their own `this` context.', type: 'true_false', correct: false },
      { q: 'What does the `return` statement do?', options: ['Loops through an array', 'Exits the function and returns a value', 'Declares a variable', 'Imports a module'], correct: 1 },
    ],
    'Arrays & Objects': [
      { q: 'Which method adds an element to the end of an array?', options: ['unshift()', 'push()', 'pop()', 'shift()'], correct: 1 },
      { q: 'Objects in JavaScript are passed by reference.', type: 'true_false', correct: true },
      { q: 'What does Object.keys() return?', options: ['An array of values', 'An array of keys', 'An object', 'undefined'], correct: 1 },
    ],
    'Async Programming': [
      { q: 'What does a Promise represent?', options: ['A guaranteed result', 'An eventual completion or failure of an async operation', 'A syntax error', 'A loop'], correct: 1 },
      { q: 'The `await` keyword can only be used inside async functions.', type: 'true_false', correct: true },
      { q: 'Which method is used to handle rejected promises?', options: ['.then()', '.catch()', '.finally()', '.resolve()'], correct: 1 },
    ],
    'default': [
      { q: `What is a key concept in ${subject}?`, options: ['Fundamental understanding', 'Random guessing', 'Ignoring basics', 'Skipping practice'], correct: 0 },
      { q: `Practice is important for mastering ${subject}.`, type: 'true_false', correct: true },
      { q: `Which approach is best for learning ${subject}?`, options: ['Consistent study', 'Cramming', 'No practice', 'Only reading'], correct: 0 },
    ],
  };
  
  const usedQuestionKeys = new Set();
  
  for (let i = 0; i < count; i++) {
    const topic = topics[i % topics.length];
    const availableQuestions = topicQuestions[topic] || topicQuestions['default'];
    
    let questionData;
    let attempts = 0;
    
    do {
      const qIndex = Math.floor(Math.random() * availableQuestions.length);
      questionData = availableQuestions[qIndex];
      attempts++;
    } while (usedQuestionKeys.has(questionData.q) && attempts < 10);
    
    usedQuestionKeys.add(questionData.q);
    
    const question = {
      id: uuidv4(),
      topic,
      question: questionData.q,
      type: questionData.type || 'multiple_choice',
      options: questionData.options || ['True', 'False'],
      correctAnswer: questionData.correct,
      difficulty,
    };
    
    questions.push(question);
  }
  
  return questions;
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Study Planner API is running' });
});

// Generate a new study plan
app.post('/api/study-plans', async (req, res) => {
  try {
    const { subject, duration, goals, difficulty } = req.body;

    if (!subject || !duration || !goals) {
      return res.status(400).json({
        error: 'Missing required fields: subject, duration, and goals are required',
      });
    }

    const planContent = await generateStudyPlan(
      subject,
      duration,
      goals,
      difficulty || 'intermediate'
    );

    const plan = {
      id: uuidv4(),
      subject,
      duration,
      goals,
      difficulty: difficulty || 'intermediate',
      content: planContent,
      createdAt: new Date().toISOString(),
      progress: 0,
    };

    studyPlans.set(plan.id, plan);

    // Create tasks from the daily plan
    planContent.dailyPlan.forEach((day) => {
      const taskId = uuidv4();
      tasks.set(taskId, {
        id: taskId,
        planId: plan.id,
        day: day.day,
        topics: day.topics,
        duration: day.duration,
        activities: day.activities,
        completed: false,
        completedAt: null,
      });
    });

    // Update stats for achievements
    userStats.plansCreated++;
    checkAchievements();

    res.status(201).json(plan);
  } catch (error) {
    console.error('Error generating study plan:', error);
    res.status(500).json({ error: 'Failed to generate study plan' });
  }
});

// Get all study plans
app.get('/api/study-plans', (req, res) => {
  const plans = Array.from(studyPlans.values());
  res.json(plans);
});

// Get a specific study plan
app.get('/api/study-plans/:id', (req, res) => {
  const plan = studyPlans.get(req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Study plan not found' });
  }
  res.json(plan);
});

// Update study plan progress
app.patch('/api/study-plans/:id', (req, res) => {
  const plan = studyPlans.get(req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Study plan not found' });
  }

  const { progress } = req.body;
  if (typeof progress === 'number') {
    plan.progress = Math.min(100, Math.max(0, progress));
  }

  studyPlans.set(req.params.id, plan);
  res.json(plan);
});

// Delete a study plan
app.delete('/api/study-plans/:id', (req, res) => {
  if (!studyPlans.has(req.params.id)) {
    return res.status(404).json({ error: 'Study plan not found' });
  }

  // Delete associated tasks
  for (const [taskId, task] of tasks.entries()) {
    if (task.planId === req.params.id) {
      tasks.delete(taskId);
    }
  }

  studyPlans.delete(req.params.id);
  res.status(204).send();
});

// Get tasks for a study plan
app.get('/api/study-plans/:id/tasks', (req, res) => {
  const planTasks = Array.from(tasks.values()).filter(
    (task) => task.planId === req.params.id
  );
  res.json(planTasks);
});

// Update a task (mark complete/incomplete)
app.patch('/api/tasks/:id', (req, res) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { completed } = req.body;
  if (typeof completed === 'boolean') {
    const wasCompleted = task.completed;
    task.completed = completed;
    task.completedAt = completed ? new Date().toISOString() : null;
    
    // Update stats for achievements
    if (completed && !wasCompleted) {
      userStats.tasksCompleted++;
      updateStreak();
    } else if (!completed && wasCompleted) {
      userStats.tasksCompleted = Math.max(0, userStats.tasksCompleted - 1);
    }
  }

  tasks.set(req.params.id, task);

  // Update plan progress
  const plan = studyPlans.get(task.planId);
  if (plan) {
    const planTasks = Array.from(tasks.values()).filter(
      (t) => t.planId === task.planId
    );
    const completedTasks = planTasks.filter((t) => t.completed).length;
    plan.progress = Math.round((completedTasks / planTasks.length) * 100);
    studyPlans.set(task.planId, plan);
  }

  res.json(task);
});

// ============== ANALYTICS ENDPOINTS ==============

// Get analytics data
app.get('/api/analytics', (req, res) => {
  const plans = Array.from(studyPlans.values());
  const allTasks = Array.from(tasks.values());
  const sessions = Array.from(studySessions.values());
  
  // Calculate daily study time for the last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayTasks = allTasks.filter(t => 
      t.completedAt && t.completedAt.split('T')[0] === dateStr
    );
    
    const dayMinutes = sessions
      .filter(s => s.date.split('T')[0] === dateStr)
      .reduce((sum, s) => sum + s.duration, 0);
    
    last7Days.push({
      date: dateStr,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      tasksCompleted: dayTasks.length,
      studyMinutes: dayMinutes,
    });
  }
  
  // Calculate topic performance
  const topicPerformance = {};
  for (const attempt of quizAttempts.values()) {
    for (const answer of attempt.answers) {
      if (!topicPerformance[answer.topic]) {
        topicPerformance[answer.topic] = { correct: 0, total: 0 };
      }
      topicPerformance[answer.topic].total++;
      if (answer.isCorrect) {
        topicPerformance[answer.topic].correct++;
      }
    }
  }
  
  const topicStats = Object.entries(topicPerformance).map(([topic, stats]) => ({
    topic,
    accuracy: Math.round((stats.correct / stats.total) * 100),
    attempts: stats.total,
  }));
  
  // Calculate completion rate by subject
  const subjectStats = {};
  for (const plan of plans) {
    if (!subjectStats[plan.subject]) {
      subjectStats[plan.subject] = { totalProgress: 0, count: 0 };
    }
    subjectStats[plan.subject].totalProgress += plan.progress;
    subjectStats[plan.subject].count++;
  }
  
  const subjectCompletion = Object.entries(subjectStats).map(([subject, stats]) => ({
    subject,
    avgProgress: Math.round(stats.totalProgress / stats.count),
    planCount: stats.count,
  }));
  
  res.json({
    dailyActivity: last7Days,
    topicPerformance: topicStats,
    subjectCompletion,
    summary: {
      totalPlans: plans.length,
      completedPlans: plans.filter(p => p.progress === 100).length,
      totalTasks: allTasks.length,
      completedTasks: allTasks.filter(t => t.completed).length,
      totalStudyMinutes: userStats.totalStudyMinutes || last7Days.reduce((sum, d) => sum + d.studyMinutes, 0),
      averageAccuracy: topicStats.length > 0 
        ? Math.round(topicStats.reduce((sum, t) => sum + t.accuracy, 0) / topicStats.length)
        : 0,
    },
  });
});

// Log a study session
app.post('/api/study-sessions', (req, res) => {
  const { planId, duration, topics } = req.body;
  
  if (!duration || duration < 1) {
    return res.status(400).json({ error: 'Duration is required and must be positive' });
  }
  
  const session = {
    id: uuidv4(),
    planId,
    duration, // in minutes
    topics: topics || [],
    date: new Date().toISOString(),
  };
  
  studySessions.set(session.id, session);
  userStats.totalStudyMinutes += duration;
  updateStreak();
  
  res.status(201).json(session);
});

// ============== ACHIEVEMENTS ENDPOINTS ==============

// Get all achievements and user progress
app.get('/api/achievements', (req, res) => {
  const achievementsWithStatus = ACHIEVEMENT_DEFINITIONS.map(achievement => ({
    ...achievement,
    unlocked: userStats.unlockedAchievements.includes(achievement.id),
    unlockedAt: userStats.unlockedAchievements.includes(achievement.id) 
      ? new Date().toISOString() // In production, store actual unlock time
      : null,
  }));
  
  res.json({
    achievements: achievementsWithStatus,
    stats: {
      currentStreak: userStats.currentStreak,
      longestStreak: userStats.longestStreak,
      totalAchievements: ACHIEVEMENT_DEFINITIONS.length,
      unlockedAchievements: userStats.unlockedAchievements.length,
      tasksCompleted: userStats.tasksCompleted,
      plansCreated: userStats.plansCreated,
      quizzesCompleted: userStats.quizzesCompleted,
      totalStudyMinutes: userStats.totalStudyMinutes,
    },
  });
});

// ============== SPACED REPETITION ENDPOINTS ==============

// Get review schedule
app.get('/api/reviews', (req, res) => {
  const reviews = Array.from(reviewSchedule.values());
  const now = new Date();
  
  // Separate into due and upcoming
  const dueReviews = reviews.filter(r => new Date(r.nextReview) <= now);
  const upcomingReviews = reviews.filter(r => new Date(r.nextReview) > now);
  
  res.json({
    dueReviews: dueReviews.sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview)),
    upcomingReviews: upcomingReviews.sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview)).slice(0, 10),
    totalTopics: reviews.length,
  });
});

// Submit a review result
app.post('/api/reviews', (req, res) => {
  const { topic, quality } = req.body;
  
  if (!topic || quality === undefined || quality < 0 || quality > 5) {
    return res.status(400).json({ error: 'Topic and quality (0-5) are required' });
  }
  
  const reviewData = calculateNextReview(topic, quality);
  updateStreak();
  
  res.json(reviewData);
});

// Initialize topics for spaced repetition from a study plan
app.post('/api/reviews/init/:planId', (req, res) => {
  const plan = studyPlans.get(req.params.planId);
  if (!plan) {
    return res.status(404).json({ error: 'Study plan not found' });
  }
  
  const topics = plan.content?.dailyPlan?.flatMap(day => day.topics) || [];
  const uniqueTopics = [...new Set(topics)];
  
  const initialized = [];
  for (const topic of uniqueTopics) {
    if (!reviewSchedule.has(topic)) {
      const reviewData = {
        topic,
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        lastReview: null,
        nextReview: new Date().toISOString(),
        quality: null,
      };
      reviewSchedule.set(topic, reviewData);
      initialized.push(topic);
    }
  }
  
  res.json({ initialized, total: reviewSchedule.size });
});

// ============== QUIZ ENDPOINTS ==============

// Generate a quiz for a study plan
app.post('/api/quizzes/generate', (req, res) => {
  const { planId, questionCount } = req.body;
  
  const plan = studyPlans.get(planId);
  if (!plan) {
    return res.status(400).json({ error: 'Valid planId is required' });
  }
  
  const topics = plan.content?.dailyPlan?.flatMap(day => day.topics) || [];
  const uniqueTopics = [...new Set(topics)];
  
  const questions = generateQuizQuestions(
    plan.subject,
    uniqueTopics,
    plan.difficulty,
    questionCount || 5
  );
  
  const quiz = {
    id: uuidv4(),
    planId,
    subject: plan.subject,
    difficulty: plan.difficulty,
    questions,
    createdAt: new Date().toISOString(),
    totalQuestions: questions.length,
  };
  
  quizzes.set(quiz.id, quiz);
  res.status(201).json(quiz);
});

// Get a specific quiz
app.get('/api/quizzes/:id', (req, res) => {
  const quiz = quizzes.get(req.params.id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  // Return quiz without correct answers for taking
  const safeQuiz = {
    ...quiz,
    questions: quiz.questions.map(q => ({
      id: q.id,
      topic: q.topic,
      question: q.question,
      type: q.type,
      options: q.options,
    })),
  };
  
  res.json(safeQuiz);
});

// Submit quiz answers
app.post('/api/quizzes/:id/submit', (req, res) => {
  const quiz = quizzes.get(req.params.id);
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  
  const { answers } = req.body; // { questionId: answerIndex }
  
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Answers object is required' });
  }
  
  let correct = 0;
  const results = quiz.questions.map(q => {
    const userAnswer = answers[q.id];
    const isCorrect = userAnswer === q.correctAnswer;
    if (isCorrect) correct++;
    
    return {
      questionId: q.id,
      topic: q.topic,
      question: q.question,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      options: q.options,
    };
  });
  
  const score = Math.round((correct / quiz.questions.length) * 100);
  
  const attempt = {
    id: uuidv4(),
    quizId: quiz.id,
    planId: quiz.planId,
    answers: results,
    score,
    correct,
    total: quiz.questions.length,
    completedAt: new Date().toISOString(),
  };
  
  quizAttempts.set(attempt.id, attempt);
  
  // Update user stats
  userStats.quizzesCompleted++;
  if (score === 100) {
    userStats.perfectQuizzes++;
  }
  updateStreak();
  
  // Update spaced repetition based on quiz performance
  for (const result of results) {
    const quality = result.isCorrect ? 4 : 2; // 4 for correct, 2 for incorrect
    calculateNextReview(result.topic, quality);
  }
  
  res.json({
    attempt,
    newAchievements: checkAchievements(),
  });
});

// Get quiz history
app.get('/api/quizzes', (req, res) => {
  const allAttempts = Array.from(quizAttempts.values())
    .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
  
  res.json(allAttempts);
});

// AI-powered study recommendations
app.post('/api/recommendations', async (req, res) => {
  const { subject, currentLevel, learningStyle } = req.body;

  if (!subject) {
    return res.status(400).json({ error: 'Subject is required' });
  }

  // Generate recommendations based on input
  const recommendations = {
    subject,
    currentLevel: currentLevel || 'beginner',
    learningStyle: learningStyle || 'visual',
    suggestedResources: [
      { type: 'video', title: `${subject} Fundamentals Course`, platform: 'YouTube' },
      { type: 'book', title: `${subject} - A Comprehensive Guide`, platform: 'Online Library' },
      { type: 'practice', title: `${subject} Practice Problems`, platform: 'Practice Platform' },
      { type: 'interactive', title: `${subject} Interactive Tutorial`, platform: 'Learning App' },
    ],
    studyTechniques: [
      'Pomodoro Technique for focused study sessions',
      'Spaced Repetition for long-term retention',
      'Active Recall through practice quizzes',
      'Mind Mapping for visual learners',
    ],
    estimatedTimeToMaster: currentLevel === 'beginner' ? '3-6 months' : currentLevel === 'intermediate' ? '1-3 months' : '2-4 weeks',
  };

  res.json(recommendations);
});

// ============== AI CHAT TUTOR ==============

// Chat with AI tutor
app.post('/api/ai/chat', async (req, res) => {
  const { message, subject, context } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const chatId = context?.chatId || uuidv4();
  
  // Get or create chat history
  if (!chatHistory.has(chatId)) {
    chatHistory.set(chatId, []);
  }
  const history = chatHistory.get(chatId);

  // Add user message to history
  const userMessage = {
    id: uuidv4(),
    role: 'user',
    content: message,
    timestamp: new Date().toISOString(),
  };
  history.push(userMessage);

  let aiResponse;
  
  if (openai) {
    try {
      const systemPrompt = `You are an expert AI tutor specializing in ${subject || 'various subjects'}. 
You help students understand concepts, answer questions, and provide clear explanations.
Be encouraging, patient, and adapt your explanations to the student's level.
Use examples and analogies when helpful.`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
      ];

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      });

      aiResponse = response.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      aiResponse = generateMockTutorResponse(message, subject);
    }
  } else {
    aiResponse = generateMockTutorResponse(message, subject);
  }

  // Add AI response to history
  const assistantMessage = {
    id: uuidv4(),
    role: 'assistant',
    content: aiResponse,
    timestamp: new Date().toISOString(),
  };
  history.push(assistantMessage);

  res.json({
    chatId,
    message: assistantMessage,
    history: history.slice(-20),
  });
});

// Get chat history
app.get('/api/ai/chat/:chatId', (req, res) => {
  const history = chatHistory.get(req.params.chatId) || [];
  res.json({ chatId: req.params.chatId, history });
});

// Clear chat history
app.delete('/api/ai/chat/:chatId', (req, res) => {
  chatHistory.delete(req.params.chatId);
  res.status(204).send();
});

// Mock tutor response generator
function generateMockTutorResponse(message, subject) {
  const lowerMessage = message.toLowerCase();
  
  // Subject-specific responses
  const responses = {
    explain: `Great question! Let me explain this concept in simple terms.

**Key Points:**
1. Start with the fundamentals - understanding the basics is crucial
2. This concept builds upon previous knowledge
3. Practice is essential for mastery

**Example:**
Think of it like building blocks - each concept supports the next. Would you like me to break this down further or provide more examples?`,
    
    help: `I'm here to help! Here's what I suggest:

📚 **Understanding the Concept:**
- Break it down into smaller parts
- Relate it to something you already know
- Try explaining it in your own words

💡 **Study Tips:**
- Use active recall instead of passive reading
- Take regular breaks
- Practice with problems

What specific aspect would you like me to clarify?`,
    
    example: `Here's a practical example to illustrate:

**Scenario:**
Imagine you're working with ${subject || 'this topic'}...

**Step-by-step:**
1. First, identify the key components
2. Apply the concept to solve the problem
3. Verify your understanding

**Practice Question:**
Try applying this to a similar situation. Would you like me to provide more examples?`,
    
    default: `That's an interesting question about ${subject || 'your studies'}!

Here's what you should know:
- This topic is fundamental to understanding ${subject || 'the subject'}
- Many students find it helpful to visualize the concept
- Practice problems will solidify your understanding

**Next Steps:**
1. Review the core concepts
2. Try some practice problems
3. Come back with specific questions

Is there a particular aspect you'd like me to elaborate on?`,
  };

  if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('what are')) {
    return responses.explain;
  } else if (lowerMessage.includes('help') || lowerMessage.includes('stuck') || lowerMessage.includes("don't understand")) {
    return responses.help;
  } else if (lowerMessage.includes('example') || lowerMessage.includes('show me')) {
    return responses.example;
  }
  
  return responses.default;
}

// ============== AI STUDY COACH ==============

// Get personalized coaching advice
app.post('/api/ai/coach', async (req, res) => {
  const { mood, challenges, goals, studyHours } = req.body;

  // Get user stats for personalized advice
  const stats = {
    currentStreak: userStats.currentStreak,
    tasksCompleted: userStats.tasksCompleted,
    totalStudyMinutes: userStats.totalStudyMinutes,
    quizzesCompleted: userStats.quizzesCompleted,
  };

  let coachingAdvice;

  if (openai) {
    try {
      const prompt = `As a supportive AI study coach, provide personalized advice based on:
- Student's mood: ${mood || 'neutral'}
- Current challenges: ${challenges || 'general studying'}
- Goals: ${goals || 'improve learning'}
- Daily study hours: ${studyHours || 2}
- Current streak: ${stats.currentStreak} days
- Tasks completed: ${stats.tasksCompleted}
- Total study time: ${Math.round(stats.totalStudyMinutes / 60)} hours

Provide:
1. A motivational message
2. 3 specific, actionable tips
3. A recommended study schedule
4. Encouragement based on their progress`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an encouraging, supportive study coach who helps students stay motivated and study effectively.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      coachingAdvice = {
        type: 'ai',
        content: response.choices[0].message.content,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      coachingAdvice = generateMockCoachingAdvice(mood, challenges, goals, stats);
    }
  } else {
    coachingAdvice = generateMockCoachingAdvice(mood, challenges, goals, stats);
  }

  res.json({
    advice: coachingAdvice,
    stats,
    timestamp: new Date().toISOString(),
  });
});

// Mock coaching advice generator
function generateMockCoachingAdvice(mood, challenges, goals, stats) {
  const motivationalQuotes = [
    "Every expert was once a beginner. Keep going!",
    "Small progress is still progress. You're doing great!",
    "The secret to getting ahead is getting started.",
    "Believe in yourself. You've got this!",
    "Success is the sum of small efforts repeated daily.",
  ];

  const tips = {
    motivation: [
      "Set small, achievable goals for each study session",
      "Reward yourself after completing challenging tasks",
      "Study with a friend or join a study group",
      "Visualize your success and end goals",
    ],
    focus: [
      "Use the Pomodoro technique (25 min study, 5 min break)",
      "Remove distractions - put your phone in another room",
      "Create a dedicated study space",
      "Start with the most challenging topic when your energy is highest",
    ],
    retention: [
      "Use active recall - test yourself without looking at notes",
      "Teach the concept to someone else",
      "Create mind maps or visual summaries",
      "Review material before sleeping for better retention",
    ],
  };

  const streakMessage = stats.currentStreak > 0
    ? `🔥 Amazing! You're on a ${stats.currentStreak}-day streak! Keep the momentum going!`
    : "Start a study streak today! Consistency is key to success.";

  return {
    type: 'generated',
    motivation: motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
    streakMessage,
    personalizedTips: [
      tips.motivation[Math.floor(Math.random() * tips.motivation.length)],
      tips.focus[Math.floor(Math.random() * tips.focus.length)],
      tips.retention[Math.floor(Math.random() * tips.retention.length)],
    ],
    schedule: {
      recommended: "Study for 2-3 hours with breaks",
      bestTime: "Morning or early afternoon when focus is highest",
      breakPattern: "25 min study → 5 min break → repeat",
    },
    encouragement: stats.tasksCompleted > 0
      ? `You've already completed ${stats.tasksCompleted} tasks! That's real progress.`
      : "Every journey begins with a single step. Start your first task today!",
  };
}

// ============== AI NOTE SUMMARIZER ==============

// Summarize notes or text
app.post('/api/ai/summarize', async (req, res) => {
  const { text, title, type } = req.body;

  if (!text || text.length < 50) {
    return res.status(400).json({ error: 'Text must be at least 50 characters' });
  }

  let summary;

  if (openai) {
    try {
      const prompt = `Summarize the following ${type || 'study notes'} in a clear, concise manner:

Title: ${title || 'Untitled'}
Content:
${text}

Provide:
1. A brief summary (2-3 sentences)
2. Key points (bullet points)
3. Important terms/concepts
4. Suggested review questions`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert at summarizing and organizing study materials for students.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.5,
      });

      summary = {
        type: 'ai',
        content: response.choices[0].message.content,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      summary = generateMockSummary(text, title);
    }
  } else {
    summary = generateMockSummary(text, title);
  }

  // Save the note with summary
  const noteId = uuidv4();
  const note = {
    id: noteId,
    title: title || 'Untitled Note',
    originalText: text,
    summary,
    createdAt: new Date().toISOString(),
  };
  notes.set(noteId, note);

  res.json(note);
});

// Get all saved notes
app.get('/api/ai/notes', (req, res) => {
  const allNotes = Array.from(notes.values())
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(allNotes);
});

// Get a specific note
app.get('/api/ai/notes/:id', (req, res) => {
  const note = notes.get(req.params.id);
  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }
  res.json(note);
});

// Delete a note
app.delete('/api/ai/notes/:id', (req, res) => {
  if (!notes.has(req.params.id)) {
    return res.status(404).json({ error: 'Note not found' });
  }
  notes.delete(req.params.id);
  res.status(204).send();
});

// Mock summary generator
function generateMockSummary(text, title) {
  const words = text.split(/\s+/);
  const wordCount = words.length;
  
  // Extract potential key terms (capitalized words, longer words)
  const keyTerms = [...new Set(
    words.filter(w => w.length > 5 || /^[A-Z]/.test(w))
      .map(w => w.replace(/[^a-zA-Z]/g, ''))
      .filter(w => w.length > 3)
  )].slice(0, 5);

  // Create sentences for summary
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const summaryLines = sentences.slice(0, 2).map(s => s.trim());

  return {
    type: 'generated',
    briefSummary: summaryLines.join(' ') || `Summary of ${title || 'the provided text'}...`,
    keyPoints: [
      `This document covers ${keyTerms[0] || 'key concepts'}`,
      `Main topic relates to ${keyTerms[1] || 'the subject matter'}`,
      `Contains approximately ${wordCount} words of content`,
      `Discusses ${keyTerms.slice(2).join(', ') || 'various topics'}`,
    ],
    importantTerms: keyTerms.length > 0 ? keyTerms : ['Main concept', 'Key term', 'Important topic'],
    reviewQuestions: [
      `What is the main idea of ${title || 'this text'}?`,
      `How does this concept relate to what you've learned before?`,
      `Can you explain the key points in your own words?`,
      `What questions do you still have about this topic?`,
    ],
    stats: {
      wordCount,
      readingTime: `${Math.ceil(wordCount / 200)} min`,
      difficulty: wordCount > 500 ? 'Comprehensive' : wordCount > 200 ? 'Moderate' : 'Brief',
    },
  };
}

// ============== AI WEAKNESS ANALYZER ==============

// Analyze weaknesses based on quiz performance and study patterns
app.get('/api/ai/analyze-weaknesses', async (req, res) => {
  const allAttempts = Array.from(quizAttempts.values());
  const allPlans = Array.from(studyPlans.values());
  const allTasks = Array.from(tasks.values());

  // Analyze topic performance
  const topicAnalysis = {};
  for (const attempt of allAttempts) {
    for (const answer of attempt.answers) {
      if (!topicAnalysis[answer.topic]) {
        topicAnalysis[answer.topic] = {
          correct: 0,
          incorrect: 0,
          total: 0,
        };
      }
      topicAnalysis[answer.topic].total++;
      if (answer.isCorrect) {
        topicAnalysis[answer.topic].correct++;
      } else {
        topicAnalysis[answer.topic].incorrect++;
      }
    }
  }

  // Calculate weakness scores
  const weaknesses = Object.entries(topicAnalysis)
    .map(([topic, stats]) => ({
      topic,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      attempts: stats.total,
      incorrectCount: stats.incorrect,
      needsWork: stats.correct / stats.total < 0.7,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  // Analyze study patterns
  const completedTasks = allTasks.filter(t => t.completed);
  const incompleteTasks = allTasks.filter(t => !t.completed);
  
  const studyPatterns = {
    taskCompletionRate: allTasks.length > 0 
      ? Math.round((completedTasks.length / allTasks.length) * 100) 
      : 0,
    averagePlanProgress: allPlans.length > 0
      ? Math.round(allPlans.reduce((sum, p) => sum + p.progress, 0) / allPlans.length)
      : 0,
    totalQuizzesTaken: allAttempts.length,
    averageQuizScore: allAttempts.length > 0
      ? Math.round(allAttempts.reduce((sum, a) => sum + a.score, 0) / allAttempts.length)
      : 0,
  };

  // Generate recommendations
  let recommendations;

  if (openai && weaknesses.length > 0) {
    try {
      const prompt = `Based on the following learning analytics, provide specific improvement recommendations:

Weak Topics (lowest accuracy first):
${weaknesses.slice(0, 5).map(w => `- ${w.topic}: ${w.accuracy}% accuracy (${w.attempts} attempts)`).join('\n')}

Study Patterns:
- Task completion rate: ${studyPatterns.taskCompletionRate}%
- Average plan progress: ${studyPatterns.averagePlanProgress}%
- Average quiz score: ${studyPatterns.averageQuizScore}%

Provide:
1. Top 3 priority areas to focus on
2. Specific study strategies for each weak area
3. A recommended weekly study plan
4. Tips for improving overall performance`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert learning analyst who helps students identify and improve their weak areas.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      recommendations = {
        type: 'ai',
        content: response.choices[0].message.content,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      recommendations = generateMockWeaknessRecommendations(weaknesses, studyPatterns);
    }
  } else {
    recommendations = generateMockWeaknessRecommendations(weaknesses, studyPatterns);
  }

  res.json({
    weakTopics: weaknesses.filter(w => w.needsWork),
    strongTopics: weaknesses.filter(w => !w.needsWork),
    studyPatterns,
    recommendations,
    timestamp: new Date().toISOString(),
  });
});

// Mock weakness recommendations generator
function generateMockWeaknessRecommendations(weaknesses, patterns) {
  const weakTopics = weaknesses.filter(w => w.needsWork).slice(0, 3);
  
  return {
    type: 'generated',
    priorityAreas: weakTopics.length > 0
      ? weakTopics.map(w => ({
          topic: w.topic,
          currentAccuracy: w.accuracy,
          targetAccuracy: 80,
          strategy: `Focus on ${w.topic} - Review fundamentals and practice with more examples`,
        }))
      : [{ topic: 'General Practice', strategy: 'Take more quizzes to identify specific weak areas' }],
    studyStrategies: [
      {
        area: 'Low-performing topics',
        strategy: 'Use spaced repetition with increasing intervals',
        timeCommitment: '30 min/day',
      },
      {
        area: 'Quiz performance',
        strategy: 'Review incorrect answers immediately after each quiz',
        timeCommitment: '15 min after each quiz',
      },
      {
        area: 'Task completion',
        strategy: 'Break tasks into smaller, manageable chunks',
        timeCommitment: 'Set daily minimums',
      },
    ],
    weeklyPlan: {
      monday: 'Focus on weakest topic - concept review',
      tuesday: 'Practice problems for weak areas',
      wednesday: 'Mixed review - all topics',
      thursday: 'Deep dive into second weakest topic',
      friday: 'Quiz practice and self-assessment',
      weekend: 'Light review and rest',
    },
    generalTips: [
      patterns.taskCompletionRate < 50 ? 'Try to complete at least one task daily to build momentum' : 'Great task completion rate! Keep it up!',
      patterns.averageQuizScore < 70 ? 'Focus on understanding concepts before taking quizzes' : 'Solid quiz scores! Challenge yourself with harder questions',
      'Review mistakes immediately - they\'re your best learning opportunity',
      'Teach concepts to others to solidify your understanding',
    ],
  };
}

// ============== SYLLABUS UPLOAD & PARSING ==============

// Upload and parse syllabus
app.post('/api/syllabus/upload', upload.single('syllabus'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { subject, semester, professor } = req.body;
    
    if (!subject) {
      return res.status(400).json({ error: 'Subject name is required' });
    }

    let textContent = '';
    
    // Parse file based on type
    if (req.file.mimetype === 'application/pdf') {
      try {
        const pdfData = await pdfParse(req.file.buffer);
        textContent = pdfData.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return res.status(400).json({ error: 'Failed to parse PDF file' });
      }
    } else if (req.file.mimetype === 'text/plain') {
      textContent = req.file.buffer.toString('utf-8');
    } else {
      // For DOC files, we'll store raw text (in production, use a proper parser)
      textContent = req.file.buffer.toString('utf-8');
    }

    // Extract information using AI or mock parser
    const parsedData = await parseSyllabusContent(textContent, subject);

    const syllabusId = uuidv4();
    const syllabus = {
      id: syllabusId,
      subject,
      semester: semester || 'Current',
      professor: professor || 'Unknown',
      fileName: req.file.originalname,
      rawText: textContent.substring(0, 5000), // Store first 5000 chars
      parsedData,
      uploadedAt: new Date().toISOString(),
    };

    syllabi.set(syllabusId, syllabus);

    // Auto-create assignments from parsed data
    if (parsedData.assignments) {
      for (const assignment of parsedData.assignments) {
        const assignmentId = uuidv4();
        assignments.set(assignmentId, {
          id: assignmentId,
          syllabusId,
          subject,
          title: assignment.title,
          description: assignment.description || '',
          dueDate: assignment.dueDate,
          type: assignment.type || 'assignment',
          completed: false,
          reminded: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    res.status(201).json({
      syllabus,
      assignmentsCreated: parsedData.assignments?.length || 0,
    });
  } catch (error) {
    console.error('Syllabus upload error:', error);
    res.status(500).json({ error: 'Failed to process syllabus' });
  }
});

// Parse syllabus content helper
async function parseSyllabusContent(text, subject) {
  if (openai) {
    try {
      const prompt = `Analyze this syllabus for ${subject} and extract:
1. Course topics/units with their order
2. All assignments, exams, and deadlines (with dates if mentioned)
3. Grading breakdown
4. Key dates (exam dates, project deadlines, etc.)
5. Recommended study approach

Syllabus content:
${text.substring(0, 3000)}

Respond with JSON in this format:
{
  "topics": [{"name": "topic", "week": 1, "description": "brief description"}],
  "assignments": [{"title": "name", "type": "assignment/exam/project", "dueDate": "YYYY-MM-DD or null", "description": "brief description", "weight": "percentage if known"}],
  "gradingBreakdown": {"assignments": "30%", "exams": "40%", "participation": "10%", "project": "20%"},
  "keyDates": [{"event": "name", "date": "YYYY-MM-DD"}],
  "studyRecommendations": ["recommendation1", "recommendation2"]
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert at parsing academic syllabi. Always respond with valid JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('OpenAI parsing error:', error);
      return generateMockSyllabusData(text, subject);
    }
  }
  
  return generateMockSyllabusData(text, subject);
}

// Mock syllabus parser
function generateMockSyllabusData(text, subject) {
  const lowerText = text.toLowerCase();
  
  // Try to extract dates from text
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2})/gi;
  const foundDates = text.match(datePattern) || [];
  
  // Generate topics based on subject
  const topicsBySubject = {
    mathematics: ['Algebra Fundamentals', 'Linear Equations', 'Quadratic Functions', 'Calculus Introduction', 'Integration', 'Statistics'],
    physics: ['Mechanics', 'Thermodynamics', 'Waves & Optics', 'Electromagnetism', 'Modern Physics'],
    chemistry: ['Atomic Structure', 'Chemical Bonding', 'Organic Chemistry', 'Reactions & Equations', 'Electrochemistry'],
    biology: ['Cell Biology', 'Genetics', 'Evolution', 'Human Anatomy', 'Ecology'],
    computer: ['Programming Basics', 'Data Structures', 'Algorithms', 'Database Systems', 'Web Development'],
    default: ['Introduction', 'Core Concepts', 'Advanced Topics', 'Practical Applications', 'Review'],
  };
  
  const subjectKey = Object.keys(topicsBySubject).find(key => 
    subject.toLowerCase().includes(key)
  ) || 'default';
  
  const topics = topicsBySubject[subjectKey].map((name, index) => ({
    name,
    week: index + 1,
    description: `Study ${name} concepts and complete related exercises`,
  }));
  
  // Generate mock assignments
  const currentDate = new Date();
  const assignments = [
    {
      title: `${subject} Assignment 1`,
      type: 'assignment',
      dueDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Complete problems from chapters 1-2',
      weight: '10%',
    },
    {
      title: `${subject} Quiz 1`,
      type: 'quiz',
      dueDate: new Date(currentDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Quiz covering initial topics',
      weight: '5%',
    },
    {
      title: `${subject} Midterm Exam`,
      type: 'exam',
      dueDate: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Midterm examination covering first half of course',
      weight: '25%',
    },
    {
      title: `${subject} Assignment 2`,
      type: 'assignment',
      dueDate: new Date(currentDate.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Complete problems from chapters 3-4',
      weight: '10%',
    },
    {
      title: `${subject} Final Project`,
      type: 'project',
      dueDate: new Date(currentDate.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Comprehensive project covering all course topics',
      weight: '20%',
    },
    {
      title: `${subject} Final Exam`,
      type: 'exam',
      dueDate: new Date(currentDate.getTime() + 75 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Final examination covering entire course',
      weight: '30%',
    },
  ];

  return {
    topics,
    assignments,
    gradingBreakdown: {
      assignments: '20%',
      quizzes: '10%',
      midterm: '25%',
      project: '20%',
      final: '25%',
    },
    keyDates: assignments.map(a => ({ event: a.title, date: a.dueDate })),
    studyRecommendations: [
      'Review lecture notes within 24 hours of class',
      'Complete practice problems before each quiz',
      'Form study groups for exam preparation',
      'Start projects early to allow time for revisions',
      'Visit office hours for difficult concepts',
    ],
  };
}

// Get all syllabi
app.get('/api/syllabus', (req, res) => {
  const allSyllabi = Array.from(syllabi.values())
    .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  res.json(allSyllabi);
});

// Get specific syllabus
app.get('/api/syllabus/:id', (req, res) => {
  const syllabus = syllabi.get(req.params.id);
  if (!syllabus) {
    return res.status(404).json({ error: 'Syllabus not found' });
  }
  res.json(syllabus);
});

// Delete syllabus
app.delete('/api/syllabus/:id', (req, res) => {
  if (!syllabi.has(req.params.id)) {
    return res.status(404).json({ error: 'Syllabus not found' });
  }
  
  // Delete associated assignments
  for (const [assignmentId, assignment] of assignments.entries()) {
    if (assignment.syllabusId === req.params.id) {
      assignments.delete(assignmentId);
    }
  }
  
  syllabi.delete(req.params.id);
  res.status(204).send();
});

// Generate study plan from syllabus
app.post('/api/syllabus/:id/generate-plan', async (req, res) => {
  const syllabus = syllabi.get(req.params.id);
  if (!syllabus) {
    return res.status(404).json({ error: 'Syllabus not found' });
  }

  const { startDate, hoursPerDay, difficulty } = req.body;
  
  // Calculate duration based on assignments
  const syllabusAssignments = Array.from(assignments.values())
    .filter(a => a.syllabusId === syllabus.id);
  
  const lastDueDate = syllabusAssignments.length > 0
    ? new Date(Math.max(...syllabusAssignments.map(a => new Date(a.dueDate))))
    : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days default
  
  const start = startDate ? new Date(startDate) : new Date();
  const durationDays = Math.ceil((lastDueDate - start) / (24 * 60 * 60 * 1000));

  // Generate comprehensive study plan
  const planContent = await generateStudyPlanFromSyllabus(syllabus, durationDays, hoursPerDay || 2, difficulty || 'intermediate');

  const plan = {
    id: uuidv4(),
    subject: syllabus.subject,
    duration: durationDays,
    goals: `Master ${syllabus.subject} based on syllabus requirements`,
    difficulty: difficulty || 'intermediate',
    content: planContent,
    syllabusId: syllabus.id,
    createdAt: new Date().toISOString(),
    progress: 0,
  };

  studyPlans.set(plan.id, plan);

  // Create tasks from the daily plan
  planContent.dailyPlan.forEach((day) => {
    const taskId = uuidv4();
    tasks.set(taskId, {
      id: taskId,
      planId: plan.id,
      day: day.day,
      topics: day.topics,
      duration: day.duration,
      activities: day.activities,
      completed: false,
      completedAt: null,
    });
  });

  userStats.plansCreated++;
  checkAchievements();

  res.status(201).json(plan);
});

// Generate study plan from syllabus helper
async function generateStudyPlanFromSyllabus(syllabus, durationDays, hoursPerDay, difficulty) {
  const topics = syllabus.parsedData?.topics || [];
  const syllabusAssignments = Array.from(assignments.values())
    .filter(a => a.syllabusId === syllabus.id)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const dailyPlan = [];
  const topicsPerDay = Math.max(1, Math.ceil(topics.length / durationDays));

  for (let day = 1; day <= Math.min(durationDays, 90); day++) {
    const topicIndex = Math.floor((day - 1) / (durationDays / topics.length));
    const currentTopic = topics[Math.min(topicIndex, topics.length - 1)];
    
    // Check for upcoming assignments
    const upcomingAssignments = syllabusAssignments.filter(a => {
      const daysUntilDue = Math.ceil((new Date(a.dueDate) - new Date()) / (24 * 60 * 60 * 1000));
      return daysUntilDue >= day - 3 && daysUntilDue <= day + 3;
    });

    const activities = [];
    if (day % 7 === 1) activities.push('Weekly review of previous topics');
    if (day % 3 === 0) activities.push('Practice problems');
    activities.push(`Study: ${currentTopic?.name || 'Core concepts'}`);
    
    if (upcomingAssignments.length > 0) {
      activities.push(`Prepare for: ${upcomingAssignments.map(a => a.title).join(', ')}`);
    }

    dailyPlan.push({
      day,
      topics: [currentTopic?.name || `Topic ${topicIndex + 1}`],
      duration: `${hoursPerDay} hours`,
      activities,
      resources: [`${syllabus.subject} textbook`, 'Lecture notes', 'Practice exercises'],
    });
  }

  return {
    overview: `A ${durationDays}-day study plan for ${syllabus.subject} based on your syllabus. This plan covers all ${topics.length} topics and prepares you for ${syllabusAssignments.length} assignments/exams.`,
    dailyPlan,
    tips: syllabus.parsedData?.studyRecommendations || [
      'Review material before each class',
      'Complete assignments early',
      'Form study groups',
    ],
    assessments: syllabusAssignments.map(a => ({
      day: Math.ceil((new Date(a.dueDate) - new Date()) / (24 * 60 * 60 * 1000)),
      type: a.type,
      topics: [a.title],
    })),
  };
}

// ============== ASSIGNMENT REMINDERS ==============

// Get all assignments
app.get('/api/assignments', (req, res) => {
  const { subject, upcoming, completed } = req.query;
  
  let allAssignments = Array.from(assignments.values());
  
  if (subject) {
    allAssignments = allAssignments.filter(a => 
      a.subject.toLowerCase().includes(subject.toLowerCase())
    );
  }
  
  if (upcoming === 'true') {
    const now = new Date();
    allAssignments = allAssignments.filter(a => new Date(a.dueDate) >= now && !a.completed);
  }
  
  if (completed === 'true') {
    allAssignments = allAssignments.filter(a => a.completed);
  } else if (completed === 'false') {
    allAssignments = allAssignments.filter(a => !a.completed);
  }
  
  // Sort by due date
  allAssignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  
  res.json(allAssignments);
});

// Create assignment manually
app.post('/api/assignments', (req, res) => {
  const { subject, title, description, dueDate, type } = req.body;
  
  if (!subject || !title || !dueDate) {
    return res.status(400).json({ error: 'Subject, title, and dueDate are required' });
  }
  
  const assignmentId = uuidv4();
  const assignment = {
    id: assignmentId,
    syllabusId: null,
    subject,
    title,
    description: description || '',
    dueDate,
    type: type || 'assignment',
    completed: false,
    reminded: false,
    createdAt: new Date().toISOString(),
  };
  
  assignments.set(assignmentId, assignment);
  res.status(201).json(assignment);
});

// Update assignment
app.patch('/api/assignments/:id', (req, res) => {
  const assignment = assignments.get(req.params.id);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  
  const { title, description, dueDate, type, completed } = req.body;
  
  if (title) assignment.title = title;
  if (description !== undefined) assignment.description = description;
  if (dueDate) assignment.dueDate = dueDate;
  if (type) assignment.type = type;
  if (typeof completed === 'boolean') {
    assignment.completed = completed;
    assignment.completedAt = completed ? new Date().toISOString() : null;
  }
  
  assignments.set(req.params.id, assignment);
  res.json(assignment);
});

// Delete assignment
app.delete('/api/assignments/:id', (req, res) => {
  if (!assignments.has(req.params.id)) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  assignments.delete(req.params.id);
  res.status(204).send();
});

// Get assignment reminders (due soon)
app.get('/api/assignments/reminders', (req, res) => {
  const now = new Date();
  const allAssignments = Array.from(assignments.values())
    .filter(a => !a.completed)
    .map(a => {
      const dueDate = new Date(a.dueDate);
      const daysUntilDue = Math.ceil((dueDate - now) / (24 * 60 * 60 * 1000));
      return { ...a, daysUntilDue };
    })
    .filter(a => a.daysUntilDue >= -7 && a.daysUntilDue <= 14) // Past week to 2 weeks ahead
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  
  const overdue = allAssignments.filter(a => a.daysUntilDue < 0);
  const dueToday = allAssignments.filter(a => a.daysUntilDue === 0);
  const dueTomorrow = allAssignments.filter(a => a.daysUntilDue === 1);
  const dueThisWeek = allAssignments.filter(a => a.daysUntilDue > 1 && a.daysUntilDue <= 7);
  const dueNextWeek = allAssignments.filter(a => a.daysUntilDue > 7 && a.daysUntilDue <= 14);
  
  res.json({
    overdue,
    dueToday,
    dueTomorrow,
    dueThisWeek,
    dueNextWeek,
    summary: {
      overdueCount: overdue.length,
      dueTodayCount: dueToday.length,
      dueThisWeekCount: dueThisWeek.length + dueToday.length + dueTomorrow.length,
      totalPending: allAssignments.length,
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎓 AI Study Planner API running on port ${PORT}`);
  console.log(`📚 OpenAI Integration: ${openai ? 'Enabled' : 'Disabled (using mock responses)'}`);
});

module.exports = app;
