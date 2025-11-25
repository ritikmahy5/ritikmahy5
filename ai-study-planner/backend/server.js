const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

// Start server
app.listen(PORT, () => {
  console.log(`🎓 AI Study Planner API running on port ${PORT}`);
  console.log(`📚 OpenAI Integration: ${openai ? 'Enabled' : 'Disabled (using mock responses)'}`);
});

module.exports = app;
