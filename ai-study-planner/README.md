# 🎓 AI Study Planner

An AI-powered study planner that helps you create personalized study plans, track your progress, and achieve your learning goals.

![AI Study Planner](https://img.shields.io/badge/AI-Study%20Planner-blue?style=for-the-badge&logo=openai)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss)

## ✨ Features

- **🤖 AI-Powered Plan Generation**: Create personalized study plans based on your subject, goals, and difficulty level
- **📊 Progress Tracking**: Track your learning progress with visual indicators
- **✅ Task Management**: Mark tasks as complete and track your daily activities
- **💡 Smart Recommendations**: Get AI-powered study recommendations and resources
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🎨 Modern UI**: Beautiful, intuitive interface built with Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (optional - the app works without it using mock responses)

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
   # Edit .env and add your OpenAI API key (optional)
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
│   ├── server.js           # Main server file
│   ├── .env.example        # Environment variables template
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/study-plans` | Create a new study plan |
| GET | `/api/study-plans` | Get all study plans |
| GET | `/api/study-plans/:id` | Get a specific study plan |
| PATCH | `/api/study-plans/:id` | Update study plan progress |
| DELETE | `/api/study-plans/:id` | Delete a study plan |
| GET | `/api/study-plans/:id/tasks` | Get tasks for a study plan |
| PATCH | `/api/tasks/:id` | Update a task (mark complete) |
| POST | `/api/recommendations` | Get AI study recommendations |

## 🎨 Screenshots

### Dashboard
The main dashboard shows all your study plans with progress indicators.

### Create Study Plan
AI-powered form to generate personalized study plans.

### Plan Details
Detailed view of your study plan with tasks, tips, and progress tracking.

### Recommendations
Get AI-powered study recommendations based on your learning style.

## 🛠️ Tech Stack

### Backend
- **Express.js** - Web framework
- **OpenAI API** - AI-powered plan generation
- **CORS** - Cross-origin resource sharing
- **UUID** - Unique ID generation

### Frontend
- **React 19** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and dev server

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Backend server port (default: 5000) | No |
| `OPENAI_API_KEY` | OpenAI API key for AI features | No |

> Note: The app works without an OpenAI API key using intelligent mock responses.

## 📝 Usage

1. **Create a Study Plan**
   - Navigate to "Create Plan"
   - Enter your subject, duration, and learning goals
   - Select your difficulty level
   - Click "Generate Study Plan"

2. **Track Progress**
   - View your plan details
   - Mark tasks as complete
   - Monitor your overall progress

3. **Get Recommendations**
   - Go to "Recommendations"
   - Enter your subject and learning preferences
   - Get personalized study tips and resources

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
