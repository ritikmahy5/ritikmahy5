import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudyPlan } from '../utils/api';

export default function CreatePlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    duration: 7,
    goals: '',
    difficulty: 'intermediate',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const plan = await createStudyPlan(formData);
      navigate(`/plan/${plan.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create study plan');
    } finally {
      setLoading(false);
    }
  };

  const popularSubjects = [
    'JavaScript', 'Python', 'Data Science', 'Machine Learning',
    'Mathematics', 'Physics', 'Web Development', 'React'
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Create Your Study Plan
        </h1>
        <p className="text-gray-600">
          Let AI create a personalized study plan tailored to your goals and schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="label">
            Subject or Topic *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="input-field"
            placeholder="e.g., JavaScript, Machine Learning, Calculus"
            required
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {popularSubjects.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, subject }))}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-full transition-colors"
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration" className="label">
            Study Duration (days) *
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            max="365"
            className="input-field"
            required
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {[7, 14, 30, 60, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, duration: days }))}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  formData.duration === days
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 hover:bg-blue-100 hover:text-blue-700'
                }`}
              >
                {days} days
              </button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div>
          <label htmlFor="goals" className="label">
            Learning Goals *
          </label>
          <textarea
            id="goals"
            name="goals"
            value={formData.goals}
            onChange={handleChange}
            className="input-field min-h-[120px] resize-none"
            placeholder="Describe what you want to achieve. Be specific about your goals, current level, and any particular areas you want to focus on."
            required
          />
        </div>

        {/* Difficulty */}
        <div>
          <label className="label">Difficulty Level *</label>
          <div className="grid grid-cols-3 gap-4">
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, difficulty: level }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.difficulty === level
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="text-center">
                  <span
                    className={`text-2xl ${
                      level === 'beginner' ? '🌱' : level === 'intermediate' ? '🌿' : '🌳'
                    }`}
                  >
                    {level === 'beginner' ? '🌱' : level === 'intermediate' ? '🌿' : '🌳'}
                  </span>
                  <p className="mt-2 font-medium capitalize">{level}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {level === 'beginner'
                      ? '1-2 hours/day'
                      : level === 'intermediate'
                      ? '2-3 hours/day'
                      : '3-4 hours/day'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Generating with AI...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Generate Study Plan</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
