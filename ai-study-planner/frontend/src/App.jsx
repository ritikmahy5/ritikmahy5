import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreatePlan from './pages/CreatePlan';
import PlanDetail from './pages/PlanDetail';
import Recommendations from './pages/Recommendations';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreatePlan />} />
            <Route path="/plan/:id" element={<PlanDetail />} />
            <Route path="/recommendations" element={<Recommendations />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-200 mt-auto py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-gray-500 text-sm">
              <p>© 2024 AI Study Planner. Built with ❤️ by Ritik Mahyavanshi</p>
              <p className="mt-1">
                Powered by AI to help you learn smarter, not harder.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
