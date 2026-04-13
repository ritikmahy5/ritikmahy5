export default function TaskItem({ task, onToggle }) {
  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-200 ${
        task.completed
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start space-x-3">
        <button
          onClick={() => onToggle(task.id, !task.completed)}
          className={`mt-1 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-blue-500'
          }`}
        >
          {task.completed && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-semibold ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
              Day {task.day}
            </h4>
            <span className="text-sm text-gray-500">⏱️ {task.duration}</span>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Topics:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {task.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Activities:</p>
              <ul className="mt-1 text-sm text-gray-600 list-disc list-inside">
                {task.activities.map((activity, index) => (
                  <li key={index}>{activity}</li>
                ))}
              </ul>
            </div>
          </div>

          {task.completedAt && (
            <p className="text-xs text-green-600 mt-2">
              ✓ Completed on {new Date(task.completedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
