import { Link } from 'react-router-dom';

export default function PlanCard({ plan, onDelete }) {
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || colors.intermediate;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="card hover:shadow-xl transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{plan.subject}</h3>
          <p className="text-sm text-gray-500">Created: {formatDate(plan.createdAt)}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(
            plan.difficulty
          )}`}
        >
          {plan.difficulty}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{plan.goals}</p>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{plan.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${getProgressColor(
              plan.progress
            )}`}
            style={{ width: `${plan.progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <span>📅 {plan.duration} days</span>
        <span>📚 {plan.content?.dailyPlan?.length || 0} lessons</span>
      </div>

      <div className="flex space-x-2">
        <Link
          to={`/plan/${plan.id}`}
          className="flex-1 btn-primary text-center text-sm"
        >
          View Details
        </Link>
        <button
          onClick={() => onDelete(plan.id)}
          className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
