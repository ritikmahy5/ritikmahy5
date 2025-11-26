import { useState, useEffect } from 'react';
import { analyzeWeaknesses } from '../utils/api';

export default function AIWeaknessAnalyzer() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await analyzeWeaknesses();
      setAnalysis(data);
    } catch (err) {
      setError('Failed to analyze weaknesses. Make sure you have completed some quizzes first.');
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
          <p className="text-gray-600 mt-4">Analyzing your learning patterns...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button onClick={fetchAnalysis} className="btn-primary mt-4">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const hasData = analysis?.weakTopics?.length > 0 || analysis?.strongTopics?.length > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 AI Weakness Analyzer</h1>
        <p className="text-gray-600">Identify areas that need improvement and get personalized recommendations</p>
      </div>

      {/* Study Patterns Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-2xl font-bold text-gray-800">{analysis?.studyPatterns?.taskCompletionRate || 0}%</p>
          <p className="text-sm text-gray-500">Task Completion</p>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-2">📈</div>
          <p className="text-2xl font-bold text-gray-800">{analysis?.studyPatterns?.averagePlanProgress || 0}%</p>
          <p className="text-sm text-gray-500">Avg Progress</p>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-2">📝</div>
          <p className="text-2xl font-bold text-gray-800">{analysis?.studyPatterns?.totalQuizzesTaken || 0}</p>
          <p className="text-sm text-gray-500">Quizzes Taken</p>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-2xl font-bold text-gray-800">{analysis?.studyPatterns?.averageQuizScore || 0}%</p>
          <p className="text-sm text-gray-500">Avg Quiz Score</p>
        </div>
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weak Topics */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              Areas Needing Improvement
            </h2>
            
            {analysis?.weakTopics?.length > 0 ? (
              <div className="space-y-3">
                {analysis.weakTopics.map((topic, index) => (
                  <div key={index} className="bg-red-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">{topic.topic}</span>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        topic.accuracy < 40 ? 'bg-red-200 text-red-800' : 
                        topic.accuracy < 60 ? 'bg-orange-200 text-orange-800' : 
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {topic.accuracy}% accuracy
                      </span>
                    </div>
                    <div className="w-full bg-red-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {topic.incorrectCount} incorrect out of {topic.attempts} attempts
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎉</div>
                <p>No weak areas identified! Keep up the great work!</p>
              </div>
            )}
          </div>

          {/* Strong Topics */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">💪</span>
              Strong Areas
            </h2>
            
            {analysis?.strongTopics?.length > 0 ? (
              <div className="space-y-3">
                {analysis.strongTopics.map((topic, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-800">{topic.topic}</span>
                      <span className="bg-green-200 text-green-800 px-2 py-1 rounded-full text-sm">
                        {topic.accuracy}% accuracy
                      </span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${topic.accuracy}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {topic.attempts} total attempts
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Take more quizzes to identify your strong areas</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data Yet</h3>
          <p className="text-gray-500 mb-4">
            Complete some quizzes to get personalized weakness analysis
          </p>
        </div>
      )}

      {/* Recommendations */}
      {analysis?.recommendations && (
        <div className="mt-8 card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            AI Recommendations
          </h2>

          {analysis.recommendations.type === 'ai' ? (
            <div className="whitespace-pre-wrap text-gray-700">
              {analysis.recommendations.content}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Priority Areas */}
              {analysis.recommendations.priorityAreas?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">🎯 Priority Areas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.recommendations.priorityAreas.map((area, index) => (
                      <div key={index} className="bg-blue-50 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800">{area.topic}</h4>
                        <p className="text-sm text-gray-600 mt-1">{area.strategy}</p>
                        {area.currentAccuracy !== undefined && (
                          <p className="text-sm text-blue-600 mt-2">
                            Target: {area.targetAccuracy}% (currently {area.currentAccuracy}%)
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study Strategies */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">📚 Study Strategies</h3>
                <div className="space-y-3">
                  {analysis.recommendations.studyStrategies?.map((strategy, index) => (
                    <div key={index} className="flex items-start p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-600 mr-3">📌</span>
                      <div>
                        <p className="font-medium text-purple-800">{strategy.area}</p>
                        <p className="text-sm text-gray-600">{strategy.strategy}</p>
                        <p className="text-xs text-purple-600 mt-1">⏱️ {strategy.timeCommitment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Plan */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">📅 Suggested Weekly Plan</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {Object.entries(analysis.recommendations.weeklyPlan || {}).map(([day, activity]) => (
                    <div key={day} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="font-medium text-gray-800 capitalize">{day}</p>
                      <p className="text-xs text-gray-600 mt-1">{activity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Tips */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">✨ Personalized Tips</h3>
                <div className="space-y-2">
                  {analysis.recommendations.generalTips?.map((tip, index) => (
                    <div key={index} className="flex items-start p-3 bg-yellow-50 rounded-lg">
                      <span className="text-yellow-600 mr-3">💡</span>
                      <p className="text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button onClick={fetchAnalysis} className="btn-secondary">
          🔄 Refresh Analysis
        </button>
      </div>

      {/* Info Card */}
      <div className="mt-6 card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">ℹ️ How This Works</h3>
        <ul className="space-y-2 text-blue-700">
          <li>• Analysis is based on your quiz performance and study patterns</li>
          <li>• Take more quizzes to get more accurate weakness identification</li>
          <li>• Topics with less than 70% accuracy are marked as needing improvement</li>
          <li>• Recommendations are personalized based on your specific weak areas</li>
        </ul>
      </div>
    </div>
  );
}
