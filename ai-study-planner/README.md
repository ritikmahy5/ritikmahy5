# 🎓 AI Study Planner

An AI-powered study planner that helps you create personalized study plans, track your progress, and achieve your learning goals.

![AI Study Planner](https://img.shields.io/badge/AI-Study%20Planner-blue?style=for-the-badge&logo=openai)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)
![MongoDB](https://img.shields.io/badge/MongoDB-Optional-47A248?style=flat-square&logo=mongodb)

## ✨ Features

### Core Features
- **🤖 AI-Powered Plan Generation**: Create personalized study plans based on your subject, goals, and difficulty level
- **📊 Progress Tracking**: Track your learning progress with visual indicators
- **✅ Task Management**: Mark tasks as complete and track your daily activities
- **💡 Smart Recommendations**: Get AI-powered study recommendations and resources
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🎨 Modern UI**: Beautiful, intuitive interface built with Tailwind CSS

### Learning & Progress
- **📊 Analytics Dashboard**: Study time charts, task completion trends, and performance visualization
- **🏆 Gamification System**: 12 achievement badges, streak tracking, and progress milestones
- **📈 Spaced Repetition**: SM-2 algorithm for optimal review scheduling
- **🧠 AI-powered Quizzes**: Auto-generated quizzes based on study topics

### Syllabus & Assignment Management
- **📚 Syllabus Upload**: Upload PDF/TXT/DOC syllabi for multiple subjects
- **🤖 AI Syllabus Parsing**: Automatically extract topics, assignments, and due dates
- **📅 Auto-generated Study Plans**: Create plans directly from uploaded syllabi
- **🔔 Assignment Reminders**: Track all assignments with due date alerts

### AI Features
- **🤖 AI Chat Tutor**: Ask questions about your study topics
- **🎯 AI Study Coach**: Personalized motivation and study tips
- **📝 AI Note Summarizer**: Summarize study notes with key points
- **🔍 AI Weakness Analyzer**: Identify areas needing improvement

### Productivity Features
- **⏱️ Pomodoro Timer**: Built-in timer for focused study sessions with customizable intervals
- **📅 Study Calendar**: Visual calendar with all study events and assignments
- **📤 Calendar Export**: Export to Google Calendar, Outlook, or ICS file

### Data Persistence
- **💾 MongoDB Integration**: Optional database storage for persistent data
- **☁️ In-Memory Fallback**: Works without database using in-memory storage

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional - the app works without it using mock responses)
- MongoDB (optional - the app works without it using in-memory storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ritikmahy5/ritikmahy5.git
   cd ritikmahy5/ai-study-planner
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies
   npm run install:all
   
   # Or install individually
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env and add your configuration:
   # - OPENAI_API_KEY (optional) for AI features
   # - MONGODB_URI (optional) for persistent storage
   ```

4. **Start the development servers**
   ```bash
   # From the ai-study-planner directory
   npm run dev
   
   # Or start individually
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
ai-study-planner/
├── backend/                 # Express.js backend
│   ├── config/
│   │   └── database.js     # MongoDB connection
│   ├── models/             # Mongoose models
│   │   ├── StudyPlan.js
│   │   ├── Task.js
│   │   ├── Assignment.js
│   │   ├── StudySession.js
│   │   ├── UserStats.js
│   │   ├── Syllabus.js
│   │   ├── QuizAttempt.js
│   │   └── ReviewSchedule.js
│   ├── server.js           # Main server file
│   ├── .env.example        # Environment variables template
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreatePlan.jsx
│   │   │   ├── PlanDetail.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Achievements.jsx
│   │   │   ├── Quiz.jsx
│   │   │   ├── SpacedRepetition.jsx
│   │   │   ├── SyllabusUpload.jsx
│   │   │   ├── AssignmentReminders.jsx
│   │   │   ├── PomodoroTimer.jsx
│   │   │   ├── StudyCalendar.jsx
│   │   │   ├── AIChatTutor.jsx
│   │   │   ├── AIStudyCoach.jsx
│   │   │   ├── AINoteSummarizer.jsx
│   │   │   └── AIWeaknessAnalyzer.jsx
│   │   ├── styles/        # CSS styles
│   │   ├── utils/         # API utilities
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## 🔌 API Endpoints

### Study Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/study-plans` | Create a new study plan |
| GET | `/api/study-plans` | Get all study plans |
| GET | `/api/study-plans/:id` | Get a specific study plan |
| PATCH | `/api/study-plans/:id` | Update study plan progress |
| DELETE | `/api/study-plans/:id` | Delete a study plan |
| GET | `/api/study-plans/:id/tasks` | Get tasks for a study plan |
| PATCH | `/api/tasks/:id` | Update a task (mark complete) |

### Analytics & Achievements
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get analytics data |
| GET | `/api/achievements` | Get achievements and progress |
| POST | `/api/study-sessions` | Log a study session |

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quizzes/generate` | Generate a quiz |
| GET | `/api/quizzes/:id` | Get a quiz |
| POST | `/api/quizzes/:id/submit` | Submit quiz answers |

### Spaced Repetition
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reviews` | Get review schedule |
| POST | `/api/reviews` | Submit review result |
| POST | `/api/reviews/init/:planId` | Initialize topics |

### Syllabus & Assignments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/syllabus/upload` | Upload syllabus |
| GET | `/api/syllabus` | Get all syllabi |
| POST | `/api/syllabus/:id/generate-plan` | Generate plan from syllabus |
| GET | `/api/assignments` | Get all assignments |
| POST | `/api/assignments` | Create assignment |
| GET | `/api/assignments/reminders` | Get assignment reminders |

### AI Features
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI tutor |
| POST | `/api/ai/coach` | Get coaching advice |
| POST | `/api/ai/summarize` | Summarize notes |
| GET | `/api/ai/analyze-weaknesses` | Analyze weaknesses |

### Productivity
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pomodoro/sessions` | Log pomodoro session |
| GET | `/api/pomodoro/stats` | Get pomodoro statistics |
| GET | `/api/calendar/events` | Get calendar events |
| GET | `/api/calendar/export/ics` | Export calendar as ICS |

## 🎨 Screenshots

### Dashboard
The main dashboard shows all your study plans with progress indicators.

![Dashboard](https://github.com/user-attachments/assets/ff4e97a8-010e-49f2-90e3-47ea493ba01a)

### Create Study Plan
AI-powered form to generate personalized study plans.

![Create Plan](https://github.com/user-attachments/assets/0d79858f-a3f9-4f91-84e2-4f30e97842ea)

### Plan Details
Detailed view of your study plan with tasks, tips, and progress tracking.

![Plan Detail](https://github.com/user-attachments/assets/60745e56-f6fc-46ce-a6a3-84f4973806b2)

### Tasks View
Track your daily tasks and mark them as complete.

![Tasks View](https://github.com/user-attachments/assets/3623fa0b-6b4c-40f1-b383-9bf73c33edf3)

### Analytics Dashboard
View your learning progress and performance trends.

![Analytics](https://github.com/user-attachments/assets/24165b33-6e8f-4fbe-9299-d795395ba209)

## 🛠️ Tech Stack

### Backend
- **Express.js** - Web framework
- **OpenAI API** - AI-powered plan generation
- **MongoDB/Mongoose** - Database (optional)
- **Multer** - File upload handling
- **pdf-parse** - PDF parsing for syllabus upload

### Frontend
- **React 19** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS v4** - Utility-first CSS framework
- **Recharts** - Data visualization
- **Vite** - Build tool and dev server

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port (default: 5000) | No |
| `OPENAI_API_KEY` | OpenAI API key for AI features | No |
| `MONGODB_URI` | MongoDB connection string | No |

> Note: The app works without OpenAI API key using intelligent mock responses, and without MongoDB using in-memory storage.

### MongoDB Setup (Optional)

For persistent data storage, set up MongoDB:

1. **Local MongoDB**:
   ```
   MONGODB_URI=mongodb://localhost:27017/ai-study-planner
   ```

2. **MongoDB Atlas** (Cloud):
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ai-study-planner
   ```

## 📝 Usage

1. **Upload Your Syllabus**
   - Navigate to "Syllabus" page
   - Upload your course syllabus (PDF, TXT, or DOC)
   - AI will extract topics and assignments automatically

2. **Create a Study Plan**
   - Generate from syllabus or create manually
   - Set your subject, duration, and learning goals
   - Get AI-powered personalized study schedule

3. **Use Pomodoro Timer**
   - Start focused study sessions
   - Customize work/break intervals
   - Track your productivity stats

4. **Track Progress**
   - View your calendar for upcoming tasks
   - Check assignment reminders
   - Monitor achievements and streaks

5. **Get AI Help**
   - Chat with AI tutor for questions
   - Get study tips from AI coach
   - Analyze your weak areas

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Ritik Mahyavanshi**
- GitHub: [@ritikmahy5](https://github.com/ritikmahy5)
- LinkedIn: [Ritik Mahyavanshi](https://linkedin.com/in/ritikmahyavanshi)

---

Made with ❤️ for learners everywhere
