import { useState, useEffect } from 'react';
import { getReviews, submitReview, initializeReviews, getStudyPlans } from '../utils/api';

export default function SpacedRepetition() {
  const [reviews, setReviews] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentReview, setCurrentReview] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reviewData, plansData] = await Promise.all([
        getReviews(),
        getStudyPlans(),
      ]);
      setReviews(reviewData);
      setPlans(plansData);
      setError(null);
    } catch (err) {
      setError('Failed to load data. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async (planId) => {
    try {
      await initializeReviews(planId);
      await fetchData();
    } catch (err) {
      console.error('Failed to initialize reviews:', err);
    }
  };

  const startReview = () => {
    if (reviews?.dueReviews?.length > 0) {
      setCurrentReview(reviews.dueReviews[0]);
      setShowAnswer(false);
    }
  };

  const handleQualitySubmit = async (quality) => {
    if (!currentReview) return;
    
    try {
      await submitReview(currentReview.topic, quality);
      await fetchData();
      
      // Move to next review or finish
      const remainingReviews = reviews?.dueReviews?.filter(r => r.topic !== currentReview.topic) || [];
      if (remainingReviews.length > 0) {
        setCurrentReview(remainingReviews[0]);
        setShowAnswer(false);
      } else {
        setCurrentReview(null);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  const qualityButtons = [
    { value: 0, label: 'Complete Blackout', color: 'bg-red-500 hover:bg-red-600', description: "I couldn't recall anything" },
    { value: 1, label: 'Incorrect', color: 'bg-orange-500 hover:bg-orange-600', description: 'Wrong but remembered when shown' },
    { value: 2, label: 'Difficult', color: 'bg-yellow-500 hover:bg-yellow-600', description: 'Correct with serious difficulty' },
    { value: 3, label: 'Hard', color: 'bg-lime-500 hover:bg-lime-600', description: 'Correct with hesitation' },
    { value: 4, label: 'Good', color: 'bg-green-500 hover:bg-green-600', description: 'Correct with some effort' },
    { value: 5, label: 'Perfect', color: 'bg-emerald-500 hover:bg-emerald-600', description: 'Instant perfect recall' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading reviews...</p>
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

  // Active review mode
  if (currentReview) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card">
          <div className="text-center mb-6">
            <span className="text-sm text-gray-500">Reviewing Topic</span>
            <h2 className="text-2xl font-bold text-gray-800">{currentReview.topic}</h2>
          </div>

          {!showAnswer ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600 mb-8">
                Try to recall everything you know about this topic...
              </p>
              <button 
                onClick={() => setShowAnswer(true)}
                className="btn-primary text-lg px-8 py-3"
              >
                Show Answer
              </button>
            </div>
          ) : (
            <div>
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-blue-800 mb-3">Key Points to Remember:</h3>
                <ul className="space-y-2 text-blue-700">
                  <li>• Core concepts and definitions</li>
                  <li>• Practical applications</li>
                  <li>• Common patterns and best practices</li>
                  <li>• Related topics and connections</li>
                </ul>
              </div>

              <div className="mb-4">
                <p className="text-center text-gray-700 font-medium mb-4">
                  How well did you recall this topic?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {qualityButtons.map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => handleQualitySubmit(btn.value)}
                      className={`${btn.color} text-white rounded-lg p-3 transition-all transform hover:scale-105`}
                    >
                      <div className="font-bold">{btn.label}</div>
                      <div className="text-xs opacity-80">{btn.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button 
              onClick={() => setCurrentReview(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Exit Review Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📈 Spaced Repetition</h1>
        <p className="text-gray-600">Review topics at optimal intervals for better retention</p>
      </div>

      {/* Due Reviews Card */}
      <div className="card mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Due for Review</h2>
            <p className="text-gray-500">Topics that need your attention today</p>
          </div>
          {reviews?.dueReviews?.length > 0 && (
            <button onClick={startReview} className="btn-primary">
              Start Review ({reviews.dueReviews.length})
            </button>
          )}
        </div>

        {reviews?.dueReviews?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {reviews.dueReviews.map((review, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">{review.topic}</span>
                  <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">Due</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Last reviewed: {review.lastReview ? new Date(review.lastReview).toLocaleDateString() : 'Never'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-5xl mb-3">✨</div>
            <p>No topics due for review! You're all caught up.</p>
          </div>
        )}
      </div>

      {/* Upcoming Reviews */}
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📅 Upcoming Reviews</h2>
        {reviews?.upcomingReviews?.length > 0 ? (
          <div className="space-y-2">
            {reviews.upcomingReviews.map((review, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-800">{review.topic}</span>
                <span className="text-sm text-gray-500">
                  {new Date(review.nextReview).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No upcoming reviews scheduled</p>
        )}
      </div>

      {/* Initialize Topics from Plans */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📚 Add Topics from Study Plans</h2>
        <p className="text-gray-600 mb-4">
          Initialize spaced repetition for topics from your study plans
        </p>
        {plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {plans.map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800">{plan.subject}</h3>
                <p className="text-sm text-gray-500 mb-3">{plan.content?.dailyPlan?.length || 0} days</p>
                <button
                  onClick={() => handleInitialize(plan.id)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  + Add topics to review
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Create a study plan first to add topics for review
          </p>
        )}
      </div>

      {/* How it works */}
      <div className="mt-8 card bg-purple-50 border-purple-200">
        <h3 className="text-lg font-semibold text-purple-800 mb-3">🧠 How Spaced Repetition Works</h3>
        <p className="text-purple-700 mb-3">
          Spaced repetition is a learning technique that incorporates increasing intervals of time between 
          subsequent reviews of previously learned material to exploit the psychological spacing effect.
        </p>
        <ul className="space-y-2 text-purple-700">
          <li>• Topics you recall easily are reviewed less frequently</li>
          <li>• Topics you struggle with are reviewed more often</li>
          <li>• The algorithm adapts to your learning pace</li>
        </ul>
      </div>
    </div>
  );
}
