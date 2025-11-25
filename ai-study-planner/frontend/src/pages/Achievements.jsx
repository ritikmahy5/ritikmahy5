import { useState, useEffect } from 'react';
import { getAchievements } from '../utils/api';

export default function Achievements() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const result = await getAchievements();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to load achievements. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button onClick={fetchAchievements} className="btn-primary mt-4">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const unlockedCount = data?.achievements?.filter(a => a.unlocked).length || 0;
  const totalCount = data?.achievements?.length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Achievements & Streaks</h1>
        <p className="text-gray-600">Track your milestones and maintain your study streak</p>
      </div>

      {/* Streak Card */}
      <div className="card mb-8 bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🔥 Current Streak</h2>
            <p className="text-5xl font-bold">{data?.stats?.currentStreak || 0} days</p>
            <p className="text-orange-100 mt-2">Longest streak: {data?.stats?.longestStreak || 0} days</p>
          </div>
          <div className="text-8xl opacity-30">🔥</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-3xl mb-2">📚</div>
          <p className="text-2xl font-bold text-gray-800">{data?.stats?.plansCreated || 0}</p>
          <p className="text-gray-500 text-sm">Plans Created</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-2xl font-bold text-gray-800">{data?.stats?.tasksCompleted || 0}</p>
          <p className="text-gray-500 text-sm">Tasks Done</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">📝</div>
          <p className="text-2xl font-bold text-gray-800">{data?.stats?.quizzesCompleted || 0}</p>
          <p className="text-gray-500 text-sm">Quizzes Taken</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-2">⏰</div>
          <p className="text-2xl font-bold text-gray-800">{Math.round((data?.stats?.totalStudyMinutes || 0) / 60)}h</p>
          <p className="text-gray-500 text-sm">Study Time</p>
        </div>
      </div>

      {/* Achievement Progress */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Achievement Progress</h2>
          <span className="text-lg font-bold text-blue-600">{unlockedCount}/{totalCount}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.achievements?.map((achievement) => (
          <div 
            key={achievement.id}
            className={`card relative overflow-hidden transition-all duration-300 ${
              achievement.unlocked 
                ? 'border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50' 
                : 'opacity-60 grayscale'
            }`}
          >
            {achievement.unlocked && (
              <div className="absolute top-2 right-2">
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                  UNLOCKED
                </span>
              </div>
            )}
            <div className="flex items-start space-x-4">
              <div className="text-4xl">{achievement.icon}</div>
              <div>
                <h3 className="font-bold text-gray-800">{achievement.name}</h3>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-8 card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Tips to earn more achievements</h3>
        <ul className="space-y-2 text-blue-700">
          <li>• Complete tasks daily to build your streak</li>
          <li>• Take quizzes to test your knowledge</li>
          <li>• Create study plans for different subjects</li>
          <li>• Aim for 100% on quizzes to earn the Quiz Ace badge</li>
        </ul>
      </div>
    </div>
  );
}
