import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { generateQuiz, getQuiz, submitQuiz, getQuizHistory, getStudyPlans } from '../utils/api';

export default function Quiz() {
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [quizError, setQuizError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansData, historyData] = await Promise.all([
        getStudyPlans(),
        getQuizHistory(),
      ]);
      setPlans(plansData);
      setHistory(historyData);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async (planId, questionCount = 5) => {
    try {
      setGenerating(true);
      setQuizError(null);
      const quiz = await generateQuiz(planId, questionCount);
      setActiveQuiz(quiz);
      setCurrentQuestion(0);
      setAnswers({});
      setResult(null);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      setQuizError('Failed to generate quiz. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmit = async () => {
    try {
      setQuizError(null);
      const response = await submitQuiz(activeQuiz.id, answers);
      setResult(response);
      await fetchData(); // Refresh history
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      setQuizError('Failed to submit quiz. Please try again.');
    }
  };

  const resetQuiz = () => {
    setActiveQuiz(null);
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button onClick={fetchData} className="btn-primary mt-4">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show quiz results
  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card text-center">
          <div className="text-6xl mb-4">
            {result.attempt.score >= 80 ? '🎉' : result.attempt.score >= 60 ? '👍' : '📚'}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
          <p className="text-xl text-gray-600 mb-6">
            You scored <span className="font-bold text-blue-600">{result.attempt.score}%</span>
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-green-100 rounded-lg p-4">
              <p className="text-3xl font-bold text-green-600">{result.attempt.correct}</p>
              <p className="text-sm text-green-700">Correct</p>
            </div>
            <div className="bg-red-100 rounded-lg p-4">
              <p className="text-3xl font-bold text-red-600">{result.attempt.total - result.attempt.correct}</p>
              <p className="text-sm text-red-700">Incorrect</p>
            </div>
          </div>

          {result.newAchievements?.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">🏆 New Achievements Unlocked!</h3>
              <div className="flex justify-center gap-2">
                {result.newAchievements.map((achievement) => (
                  <span key={achievement.id} className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm">
                    {achievement.icon} {achievement.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Review Answers */}
          <div className="text-left mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Review Answers:</h3>
            <div className="space-y-3">
              {result.attempt.answers.map((answer, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <p className="font-medium text-gray-800 mb-2">{answer.question}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={answer.isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {answer.isCorrect ? '✓' : '✗'} Your answer: {answer.options?.[answer.userAnswer] || 'No answer'}
                    </span>
                    {!answer.isCorrect && (
                      <span className="text-green-600">
                        | Correct: {answer.options?.[answer.correctAnswer]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={resetQuiz} className="btn-primary">
              Take Another Quiz
            </button>
            <Link to="/" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active quiz mode
  if (activeQuiz) {
    const question = activeQuiz.questions[currentQuestion];
    const totalQuestions = activeQuiz.questions.length;
    const progress = ((currentQuestion + 1) / totalQuestions) * 100;
    const isAnswered = answers[question.id] !== undefined;

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card">
          {quizError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {quizError}
            </div>
          )}
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Question {currentQuestion + 1} of {totalQuestions}</span>
              <span>{activeQuiz.subject}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-6">
            <span className="text-sm text-blue-600 font-medium">{question.topic}</span>
            <h2 className="text-xl font-semibold text-gray-800 mt-2">{question.question}</h2>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[question.id] === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 ${
                    answers[question.id] === index
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-300'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-gray-800">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
              disabled={currentQuestion === 0}
              className="text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>

            {currentQuestion < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentQuestion(prev => prev + 1)}
                disabled={!isAnswered}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < totalQuestions}
                className="btn-primary bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Quiz
              </button>
            )}
          </div>

          {/* Question dots */}
          <div className="flex justify-center gap-2 mt-6 pt-4 border-t border-gray-200">
            {activeQuiz.questions.map((q, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentQuestion === index
                    ? 'bg-blue-500'
                    : answers[q.id] !== undefined
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <button onClick={resetQuiz} className="mt-4 text-gray-600 hover:text-gray-800">
          ← Exit Quiz
        </button>
      </div>
    );
  }

  // Quiz selection screen
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🧠 AI-Powered Quizzes</h1>
        <p className="text-gray-600">Test your knowledge with auto-generated quizzes based on your study topics</p>
      </div>

      {/* Generate Quiz */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Start a New Quiz</h2>
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <h3 className="font-semibold text-gray-800">{plan.subject}</h3>
                <p className="text-sm text-gray-500 mb-3">
                  {plan.difficulty} • {plan.content?.dailyPlan?.length || 0} days
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerateQuiz(plan.id, 5)}
                    disabled={generating}
                    className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-200 disabled:opacity-50"
                  >
                    5 Questions
                  </button>
                  <button
                    onClick={() => handleGenerateQuiz(plan.id, 10)}
                    disabled={generating}
                    className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 disabled:opacity-50"
                  >
                    10 Questions
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Create a study plan first to generate quizzes</p>
            <Link to="/create" className="btn-primary inline-block mt-4">
              Create Study Plan
            </Link>
          </div>
        )}
        {generating && (
          <div className="mt-4 text-center text-blue-600">
            <div className="animate-spin inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
            Generating quiz...
          </div>
        )}
      </div>

      {/* Quiz History */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📊 Quiz History</h2>
        {history.length > 0 ? (
          <div className="space-y-3">
            {history.slice(0, 10).map((attempt) => (
              <div key={attempt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    {plans.find(p => p.id === attempt.planId)?.subject || 'Unknown Subject'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(attempt.completedAt).toLocaleDateString()} • {attempt.correct}/{attempt.total} correct
                  </p>
                </div>
                <div className={`text-2xl font-bold ${
                  attempt.score >= 80 ? 'text-green-600' : attempt.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {attempt.score}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-8 text-gray-500">
            No quiz history yet. Take a quiz to see your results here!
          </p>
        )}
      </div>

      {/* Tips */}
      <div className="mt-8 card bg-green-50 border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-3">💡 Quiz Tips</h3>
        <ul className="space-y-2 text-green-700">
          <li>• Take quizzes regularly to reinforce learning</li>
          <li>• Review incorrect answers to understand your weak areas</li>
          <li>• Quiz results automatically update your spaced repetition schedule</li>
          <li>• Aim for 100% to unlock the Quiz Ace achievement!</li>
        </ul>
      </div>
    </div>
  );
}
