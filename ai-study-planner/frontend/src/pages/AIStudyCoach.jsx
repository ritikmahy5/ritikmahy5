import { useState, useEffect } from 'react';
import { getCoachingAdvice, getAchievements } from '../utils/api';

export default function AIStudyCoach() {
  const [advice, setAdvice] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mood, setMood] = useState('motivated');
  const [challenges, setChallenges] = useState('');
  const [goals, setGoals] = useState('');
  const [studyHours, setStudyHours] = useState(2);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const data = await getAchievements();
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleGetAdvice = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCoachingAdvice({
        mood,
        challenges,
        goals,
        studyHours,
      });
      setAdvice(data.advice);
      setStats(data.stats);
    } catch (err) {
      setError('Failed to get coaching advice. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const moodOptions = [
    { value: 'motivated', emoji: '💪', label: 'Motivated' },
    { value: 'tired', emoji: '😴', label: 'Tired' },
    { value: 'stressed', emoji: '😰', label: 'Stressed' },
    { value: 'confused', emoji: '🤔', label: 'Confused' },
    { value: 'confident', emoji: '😎', label: 'Confident' },
    { value: 'bored', emoji: '😐', label: 'Bored' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 AI Study Coach</h1>
        <p className="text-gray-600">Get personalized motivation and study tips based on your needs</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-orange-500 to-red-500 text-white">
            <div className="text-3xl mb-1">🔥</div>
            <p className="text-2xl font-bold">{stats.currentStreak}</p>
            <p className="text-sm opacity-80">Day Streak</p>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <div className="text-3xl mb-1">✅</div>
            <p className="text-2xl font-bold">{stats.tasksCompleted}</p>
            <p className="text-sm opacity-80">Tasks Done</p>
          </div>
          <div className="card bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
            <div className="text-3xl mb-1">⏰</div>
            <p className="text-2xl font-bold">{Math.round(stats.totalStudyMinutes / 60)}h</p>
            <p className="text-sm opacity-80">Study Time</p>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <div className="text-3xl mb-1">📝</div>
            <p className="text-2xl font-bold">{stats.quizzesCompleted}</p>
            <p className="text-sm opacity-80">Quizzes</p>
          </div>
        </div>
      )}

      {/* Input Form */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Tell me about yourself</h2>
        
        {/* Mood Selector */}
        <div className="mb-6">
          <label className="label">How are you feeling today?</label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setMood(option.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  mood === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="text-xs text-gray-600">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Challenges */}
        <div className="mb-4">
          <label className="label">What challenges are you facing?</label>
          <textarea
            value={challenges}
            onChange={(e) => setChallenges(e.target.value)}
            placeholder="e.g., Difficulty staying focused, struggling with a specific topic..."
            className="input-field h-24"
          />
        </div>

        {/* Goals */}
        <div className="mb-4">
          <label className="label">What are your current goals?</label>
          <input
            type="text"
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
            placeholder="e.g., Pass my exam, learn a new skill..."
            className="input-field"
          />
        </div>

        {/* Study Hours */}
        <div className="mb-6">
          <label className="label">How many hours can you study daily?</label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="8"
              value={studyHours}
              onChange={(e) => setStudyHours(parseInt(e.target.value))}
              className="flex-1"
            />
            <span className="font-semibold text-blue-600 w-20">{studyHours} hours</span>
          </div>
        </div>

        <button
          onClick={handleGetAdvice}
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? 'Getting advice...' : '✨ Get Personalized Coaching'}
        </button>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Coaching Advice */}
      {advice && (
        <div className="space-y-6">
          {/* Motivation */}
          <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <div className="text-4xl mb-3">💪</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Today's Motivation</h3>
            <p className="text-lg text-gray-700">
              {advice.type === 'ai' ? advice.content : advice.motivation}
            </p>
          </div>

          {advice.type === 'generated' && (
            <>
              {/* Streak Message */}
              <div className="card bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                <div className="flex items-center">
                  <div className="text-4xl mr-4">🔥</div>
                  <p className="text-lg text-gray-700">{advice.streakMessage}</p>
                </div>
              </div>

              {/* Personalized Tips */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Your Personalized Tips</h3>
                <div className="space-y-3">
                  {advice.personalizedTips.map((tip, index) => (
                    <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                      <span className="text-blue-600 mr-3">💡</span>
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-800 mb-4">⏰ Recommended Schedule</h3>
                <div className="space-y-2">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Daily Study Time</span>
                    <span className="text-blue-600">{advice.schedule.recommended}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Best Time to Study</span>
                    <span className="text-blue-600">{advice.schedule.bestTime}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Break Pattern</span>
                    <span className="text-blue-600">{advice.schedule.breakPattern}</span>
                  </div>
                </div>
              </div>

              {/* Encouragement */}
              <div className="card bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center">
                  <div className="text-4xl mr-4">🌟</div>
                  <p className="text-lg text-gray-700">{advice.encouragement}</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Quick Tips Card */}
      {!advice && (
        <div className="card bg-purple-50 border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">✨ Quick Study Tips</h3>
          <ul className="space-y-2 text-purple-700">
            <li>• Start your study session at the same time each day</li>
            <li>• Break large tasks into smaller, manageable chunks</li>
            <li>• Use active recall instead of passive reading</li>
            <li>• Take regular breaks to maintain focus</li>
            <li>• Celebrate small wins to stay motivated</li>
          </ul>
        </div>
      )}
    </div>
  );
}
