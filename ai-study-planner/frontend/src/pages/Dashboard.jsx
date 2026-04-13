import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlanCard from '../components/PlanCard';
import { getStudyPlans, deleteStudyPlan } from '../utils/api';

export default function Dashboard() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await getStudyPlans();
      setPlans(data);
      setError(null);
    } catch (err) {
      setError('Failed to load study plans. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study plan?')) {
      return;
    }

    try {
      await deleteStudyPlan(id);
      setPlans(plans.filter((plan) => plan.id !== id));
    } catch (err) {
      alert('Failed to delete study plan');
      console.error(err);
    }
  };

  const totalProgress = plans.length > 0
    ? Math.round(plans.reduce((sum, plan) => sum + plan.progress, 0) / plans.length)
    : 0;

  const activePlans = plans.filter((plan) => plan.progress < 100).length;
  const completedPlans = plans.filter((plan) => plan.progress === 100).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to AI Study Planner
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create personalized study plans powered by AI. Organize your learning,
          track your progress, and achieve your goals.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-lg font-medium opacity-90">Total Plans</h3>
          <p className="text-4xl font-bold mt-2">{plans.length}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-lg font-medium opacity-90">Completed</h3>
          <p className="text-4xl font-bold mt-2">{completedPlans}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <h3 className="text-lg font-medium opacity-90">Average Progress</h3>
          <p className="text-4xl font-bold mt-2">{totalProgress}%</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Your Study Plans</h2>
        <Link to="/create" className="btn-primary flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Create New Plan</span>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading your study plans...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchPlans}
              className="mt-4 btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Study Plans Yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first AI-powered study plan to get started!
            </p>
            <Link to="/create" className="btn-primary inline-block">
              Create Your First Plan
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
