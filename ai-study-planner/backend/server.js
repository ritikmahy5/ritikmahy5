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
    task.completed = completed;
    task.completedAt = completed ? new Date().toISOString() : null;
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
