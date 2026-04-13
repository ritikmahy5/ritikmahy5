import { useState } from 'react';
import { getRecommendations } from '../utils/api';

export default function Recommendations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    currentLevel: 'beginner',
    learningStyle: 'visual',
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
      const data = await getRecommendations(formData);
      setRecommendations(data);
    } catch (err) {
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type) => {
    const icons = {
      video: '🎬',
      book: '📖',
      practice: '✏️',
      interactive: '🎮',
    };
    return icons[type] || '📚';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Study Recommendations
        </h1>
        <p className="text-gray-600">
          Get personalized learning recommendations based on your subject and learning style.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Tell Us About Your Goals
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

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
                placeholder="e.g., Python, Data Structures, Calculus"
                required
              />
            </div>

            <div>
              <label htmlFor="currentLevel" className="label">
                Current Level
              </label>
              <select
                id="currentLevel"
                name="currentLevel"
                value={formData.currentLevel}
                onChange={handleChange}
                className="input-field"
              >
                <option value="beginner">Beginner - Just starting out</option>
                <option value="intermediate">Intermediate - Some experience</option>
                <option value="advanced">Advanced - Strong foundation</option>
              </select>
            </div>

            <div>
              <label htmlFor="learningStyle" className="label">
                Preferred Learning Style
              </label>
              <select
                id="learningStyle"
                name="learningStyle"
                value={formData.learningStyle}
                onChange={handleChange}
                className="input-field"
              >
                <option value="visual">Visual - Videos, diagrams, charts</option>
                <option value="reading">Reading - Books, articles, documentation</option>
                <option value="hands-on">Hands-on - Projects, exercises, coding</option>
                <option value="auditory">Auditory - Podcasts, lectures, discussions</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Getting Recommendations...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Get Recommendations</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Recommendations */}
        <div>
          {recommendations ? (
            <div className="space-y-6">
              {/* Summary Card */}
              <div className="card bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <h3 className="text-xl font-semibold mb-2">
                  {recommendations.subject} Learning Path
                </h3>
                <p className="opacity-90">
                  Level: <span className="capitalize">{recommendations.currentLevel}</span>
                </p>
                <p className="opacity-90">
                  Estimated time to master:{' '}
                  <span className="font-semibold">{recommendations.estimatedTimeToMaster}</span>
                </p>
              </div>

              {/* Resources */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Recommended Resources
                </h3>
                <div className="space-y-3">
                  {recommendations.suggestedResources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-2xl mr-3">{getResourceIcon(resource.type)}</span>
                      <div>
                        <p className="font-medium text-gray-800">{resource.title}</p>
                        <p className="text-sm text-gray-500">{resource.platform}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Techniques */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Study Techniques
                </h3>
                <ul className="space-y-2">
                  {recommendations.studyTechniques.map((technique, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-600">{technique}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <div className="text-6xl mb-4">💡</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Ready to Explore?
              </h3>
              <p className="text-gray-500">
                Fill out the form to get personalized study recommendations powered by AI.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
