import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000/api';

function PomodoroTimer() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [todaySessions, setTodaySessions] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    focusTime: 25,
    shortBreakTime: 5,
    longBreakTime: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: true,
    autoStartFocus: false,
    soundEnabled: true,
  });
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);
  const startTimeRef = useRef(null);

  const getModeTime = useCallback((modeType) => {
    switch (modeType) {
      case 'focus':
        return settings.focusTime * 60;
      case 'shortBreak':
        return settings.shortBreakTime * 60;
      case 'longBreak':
        return settings.longBreakTime * 60;
      default:
        return 25 * 60;
    }
  }, [settings]);

  // Load study plans
  useEffect(() => {
    fetch(`${API_BASE}/study-plans`)
      .then(res => res.json())
      .then(data => setPlans(data))
      .catch(err => console.error('Failed to load plans:', err));
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = useCallback(async () => {
    setIsRunning(false);
    
    // Play notification sound
    if (settings.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }

    if (mode === 'focus') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      setTotalFocusTime(prev => prev + settings.focusTime);
      
      // Log the pomodoro session to dedicated endpoint
      try {
        await fetch(`${API_BASE}/pomodoro/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: selectedPlan?.id || null,
            duration: settings.focusTime,
            type: 'focus',
            topics: selectedPlan?.content?.dailyPlan?.[0]?.topics || [],
          }),
        });
      } catch (err) {
        console.error('Failed to log session:', err);
      }

      // Add to today's sessions
      setTodaySessions(prev => [...prev, {
        id: Date.now(),
        duration: settings.focusTime,
        plan: selectedPlan?.subject || 'General Study',
        completedAt: new Date().toISOString(),
      }]);

      // Determine next break type
      if (newSessionsCompleted % settings.sessionsBeforeLongBreak === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreakTime * 60);
        if (settings.autoStartBreaks) {
          setTimeout(() => setIsRunning(true), 1000);
        }
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreakTime * 60);
        if (settings.autoStartBreaks) {
          setTimeout(() => setIsRunning(true), 1000);
        }
      }
    } else {
      // Break completed, switch to focus
      setMode('focus');
      setTimeLeft(settings.focusTime * 60);
      if (settings.autoStartFocus) {
        setTimeout(() => setIsRunning(true), 1000);
      }
    }

    // Browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(mode === 'focus' ? '🎉 Great work!' : '⏰ Break over!', {
        body: mode === 'focus' 
          ? 'Time for a break. You earned it!' 
          : 'Ready to focus again?',
        icon: '/study-icon.svg',
      });
    }
  }, [mode, sessionsCompleted, selectedPlan, settings]);

  const startTimer = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
      setIsRunning(true);
      
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getModeTime(mode));
  };

  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(getModeTime(newMode));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = getModeTime(mode);
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const getModeColor = () => {
    switch (mode) {
      case 'focus':
        return 'from-red-500 to-orange-500';
      case 'shortBreak':
        return 'from-green-500 to-teal-500';
      case 'longBreak':
        return 'from-blue-500 to-indigo-500';
      default:
        return 'from-red-500 to-orange-500';
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'focus':
        return '🎯 Focus Time';
      case 'shortBreak':
        return '☕ Short Break';
      case 'longBreak':
        return '🌴 Long Break';
      default:
        return 'Focus Time';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleiwAHIHO69GqbDsYR5/l+9mzeD8aQaHr8cyqbDwYSaT3/N20fUUaSLX//+WYYjYUOJ7z+sqofEsdRbT///+UXS4SNZXY99KkhEQmT77++9GDRjQpMozk/uLDXxQEN4PZ9+aWYjkdNVqq//7PYh0LJ3rZ+eScaSklNoTi/+K5ThYcL3Ll/+SVYC8" type="audio/wav" />
      </audio>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">⏱️ Pomodoro Timer</h1>
        <p className="text-gray-600">Stay focused and productive with the Pomodoro Technique</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        {['focus', 'shortBreak', 'longBreak'].map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              mode === m
                ? `bg-gradient-to-r ${getModeColor()} text-white shadow-lg`
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {m === 'focus' && '🎯 Focus'}
            {m === 'shortBreak' && '☕ Short Break'}
            {m === 'longBreak' && '🌴 Long Break'}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="bg-white rounded-3xl shadow-xl p-12 mb-8">
        <div className="text-center">
          {/* Progress Ring */}
          <div className="relative inline-block mb-8">
            <svg className="w-72 h-72 transform -rotate-90">
              <circle
                cx="144"
                cy="144"
                r="136"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="144"
                cy="144"
                r="136"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 136}
                strokeDashoffset={2 * Math.PI * 136 * (1 - getProgress() / 100)}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={mode === 'focus' ? '#ef4444' : mode === 'shortBreak' ? '#22c55e' : '#3b82f6'} />
                  <stop offset="100%" stopColor={mode === 'focus' ? '#f97316' : mode === 'shortBreak' ? '#14b8a6' : '#6366f1'} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg text-gray-500 mb-2">{getModeLabel()}</span>
              <span className="text-7xl font-mono font-bold text-gray-900">
                {formatTime(timeLeft)}
              </span>
              {selectedPlan && mode === 'focus' && (
                <span className="text-sm text-gray-500 mt-2">
                  Studying: {selectedPlan.subject}
                </span>
              )}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            {!isRunning ? (
              <button
                onClick={startTimer}
                className={`px-12 py-4 bg-gradient-to-r ${getModeColor()} text-white text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`}
              >
                ▶️ Start
              </button>
            ) : (
              <button
                onClick={pauseTimer}
                className="px-12 py-4 bg-gray-700 text-white text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
              >
                ⏸️ Pause
              </button>
            )}
            <button
              onClick={resetTimer}
              className="px-8 py-4 bg-gray-200 text-gray-700 text-xl font-semibold rounded-2xl hover:bg-gray-300 transition-all"
            >
              🔄 Reset
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="px-8 py-4 bg-gray-200 text-gray-700 text-xl font-semibold rounded-2xl hover:bg-gray-300 transition-all"
            >
              ⚙️
            </button>
          </div>
        </div>
      </div>

      {/* Study Plan Selection & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Select Study Plan */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Study Plan (Optional)</h3>
          <select
            value={selectedPlan?.id || ''}
            onChange={(e) => {
              const plan = plans.find(p => p.id === e.target.value);
              setSelectedPlan(plan || null);
            }}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No specific plan</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.subject} ({plan.progress}% complete)
              </option>
            ))}
          </select>
          {selectedPlan && (
            <div className="mt-4 p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-700 font-medium">{selectedPlan.subject}</p>
              <p className="text-xs text-blue-600 mt-1">
                Today's topics: {selectedPlan.content?.dailyPlan?.[0]?.topics?.join(', ') || 'General study'}
              </p>
            </div>
          )}
        </div>

        {/* Session Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Today's Progress</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <span className="text-3xl font-bold text-red-600">{sessionsCompleted}</span>
              <p className="text-sm text-red-600 mt-1">Sessions</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <span className="text-3xl font-bold text-green-600">{totalFocusTime}</span>
              <p className="text-sm text-green-600 mt-1">Minutes Focused</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress to next long break</span>
              <span>{sessionsCompleted % settings.sessionsBeforeLongBreak}/{settings.sessionsBeforeLongBreak}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                style={{ width: `${(sessionsCompleted % settings.sessionsBeforeLongBreak) / settings.sessionsBeforeLongBreak * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Sessions */}
      {todaySessions.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">✅ Completed Sessions</h3>
          <div className="space-y-3">
            {todaySessions.map((session, index) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍅</span>
                  <div>
                    <p className="font-medium text-gray-900">Session {index + 1}</p>
                    <p className="text-sm text-gray-500">{session.plan}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{session.duration} min</p>
                  <p className="text-sm text-gray-500">
                    {new Date(session.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pomodoro Tips */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Pomodoro Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-medium text-gray-900">Focus on one task</p>
              <p className="text-sm text-gray-600">Avoid multitasking during focus sessions</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">☕</span>
            <div>
              <p className="font-medium text-gray-900">Take real breaks</p>
              <p className="text-sm text-gray-600">Step away from your desk during breaks</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📵</span>
            <div>
              <p className="font-medium text-gray-900">Eliminate distractions</p>
              <p className="text-sm text-gray-600">Put your phone on silent mode</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-medium text-gray-900">Track interruptions</p>
              <p className="text-sm text-gray-600">Note what distracts you to improve</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">⚙️ Timer Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.focusTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, focusTime: parseInt(e.target.value) || 25 }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, shortBreakTime: parseInt(e.target.value) || 5 }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakTime}
                  onChange={(e) => setSettings(prev => ({ ...prev, longBreakTime: parseInt(e.target.value) || 15 }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sessions before long break
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.sessionsBeforeLongBreak}
                  onChange={(e) => setSettings(prev => ({ ...prev, sessionsBeforeLongBreak: parseInt(e.target.value) || 4 }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.autoStartBreaks}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Auto-start breaks</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.autoStartFocus}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoStartFocus: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Auto-start focus after break</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Sound notifications</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setTimeLeft(getModeTime(mode));
                  setShowSettings(false);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply & Reset Timer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PomodoroTimer;
