import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { getAnalytics } from '../utils/api';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getAnalytics();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError('Failed to load analytics. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button onClick={fetchAnalytics} className="btn-primary mt-4">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Analytics Dashboard</h1>
        <p className="text-gray-600">Track your learning progress and performance trends</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Total Plans</h3>
          <p className="text-3xl font-bold mt-1">{analytics?.summary?.totalPlans || 0}</p>
        </div>
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Tasks Completed</h3>
          <p className="text-3xl font-bold mt-1">{analytics?.summary?.completedTasks || 0}</p>
        </div>
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Study Time</h3>
          <p className="text-3xl font-bold mt-1">{Math.round((analytics?.summary?.totalStudyMinutes || 0) / 60)}h</p>
        </div>
        <div className="card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <h3 className="text-sm font-medium opacity-90">Avg Accuracy</h3>
          <p className="text-3xl font-bold mt-1">{analytics?.summary?.averageAccuracy || 0}%</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Activity Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Daily Study Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.dailyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="studyMinutes" name="Study Minutes" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tasks Completed Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">✅ Tasks Completed This Week</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.dailyActivity || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tasksCompleted" 
                  name="Tasks" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject Completion & Topic Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Completion */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📚 Progress by Subject</h3>
          {analytics?.subjectCompletion?.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.subjectCompletion}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ subject, avgProgress }) => `${subject}: ${avgProgress}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="avgProgress"
                  >
                    {analytics.subjectCompletion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Create study plans to see subject progress</p>
            </div>
          )}
        </div>

        {/* Topic Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 Topic Performance</h3>
          {analytics?.topicPerformance?.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {analytics.topicPerformance.map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{topic.topic}</p>
                    <p className="text-sm text-gray-500">{topic.attempts} attempts</p>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className={`h-2 rounded-full ${topic.accuracy >= 70 ? 'bg-green-500' : topic.accuracy >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray-700 w-12 text-right">{topic.accuracy}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>Complete quizzes to see topic performance</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
