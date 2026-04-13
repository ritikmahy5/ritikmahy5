import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TaskItem from '../components/TaskItem';
import { getStudyPlan, getTasksForPlan, updateTask, deleteStudyPlan } from '../utils/api';

export default function PlanDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPlanData();
  }, [id]);

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      const [planData, tasksData] = await Promise.all([
        getStudyPlan(id),
        getTasksForPlan(id),
      ]);
      setPlan(planData);
      setTasks(tasksData);
      setError(null);
    } catch (err) {
      setError('Failed to load study plan details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId, completed) => {
    try {
      const updatedTask = await updateTask(taskId, { completed });
      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
      
      // Update plan progress
      const completedCount = tasks.filter((t) => 
        t.id === taskId ? completed : t.completed
      ).length;
      const newProgress = Math.round((completedCount / tasks.length) * 100);
      setPlan((prev) => ({ ...prev, progress: newProgress }));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this study plan?')) {
      return;
    }

    try {
      await deleteStudyPlan(id);
      navigate('/');
    } catch (err) {
      alert('Failed to delete study plan');
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || colors.intermediate;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading study plan...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error || 'Study plan not found'}</p>
          <Link to="/" className="btn-primary inline-block mt-4">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link to="/" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            {plan.subject}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyBadge(plan.difficulty)}`}>
              {plan.difficulty}
            </span>
          </h1>
          <p className="text-gray-600 mt-2">{plan.goals}</p>
        </div>
        <button
          onClick={handleDelete}
          className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
        >
          Delete Plan
        </button>
      </div>

      {/* Progress Card */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Overall Progress</h3>
            <p className="text-sm text-gray-500">
              {tasks.filter((t) => t.completed).length} of {tasks.length} tasks completed
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-blue-600">{plan.progress}%</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
            style={{ width: `${plan.progress}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['overview', 'tasks', 'tips'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Plan Overview</h3>
            <p className="text-gray-600">{plan.content?.overview}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center">
              <div className="text-3xl mb-2">📅</div>
              <p className="text-2xl font-bold text-gray-800">{plan.duration}</p>
              <p className="text-gray-500">Days</p>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
              <p className="text-gray-500">Lessons</p>
            </div>
            <div className="card text-center">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-2xl font-bold text-gray-800">
                {tasks.filter((t) => t.completed).length}
              </p>
              <p className="text-gray-500">Completed</p>
            </div>
          </div>

          {plan.content?.assessments?.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Assessments</h3>
              <div className="space-y-3">
                {plan.content.assessments.map((assessment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Day {assessment.day}: {assessment.type}</p>
                      <p className="text-sm text-gray-500">
                        Topics: {assessment.topics.join(', ')}
                      </p>
                    </div>
                    <span className="text-2xl">📝</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tasks found for this study plan.
            </div>
          ) : (
            tasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
            ))
          )}
        </div>
      )}

      {activeTab === 'tips' && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Study Tips</h3>
          <ul className="space-y-3">
            {plan.content?.tips?.map((tip, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-3">💡</span>
                <span className="text-gray-600">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
