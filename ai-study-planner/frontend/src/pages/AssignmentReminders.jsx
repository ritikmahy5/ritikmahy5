import { useState, useEffect } from 'react';
import { getAssignments, getAssignmentReminders, createAssignment, updateAssignment, deleteAssignment } from '../utils/api';

export default function AssignmentReminders() {
  const [reminders, setReminders] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('upcoming');
  const [error, setError] = useState(null);
  
  // Form state
  const [newAssignment, setNewAssignment] = useState({
    subject: '',
    title: '',
    description: '',
    dueDate: '',
    type: 'assignment',
  });

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [remindersData, assignmentsData] = await Promise.all([
        getAssignmentReminders(),
        getAssignments({ upcoming: filter === 'upcoming', completed: filter === 'completed' ? 'true' : undefined }),
      ]);
      setReminders(remindersData);
      setAssignments(assignmentsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      await createAssignment(newAssignment);
      setNewAssignment({ subject: '', title: '', description: '', dueDate: '', type: 'assignment' });
      setShowAddForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to add assignment');
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await updateAssignment(id, { completed: !completed });
      fetchData();
    } catch (err) {
      setError('Failed to update assignment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await deleteAssignment(id);
      fetchData();
    } catch (err) {
      setError('Failed to delete assignment');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'quiz': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getUrgencyColor = (daysUntilDue) => {
    if (daysUntilDue < 0) return 'border-red-500 bg-red-50';
    if (daysUntilDue === 0) return 'border-orange-500 bg-orange-50';
    if (daysUntilDue <= 3) return 'border-yellow-500 bg-yellow-50';
    return 'border-gray-200 bg-white';
  };

  const formatDueDate = (daysUntilDue) => {
    if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)} days overdue`;
    if (daysUntilDue === 0) return 'Due today!';
    if (daysUntilDue === 1) return 'Due tomorrow';
    return `Due in ${daysUntilDue} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔔 Assignment Reminders</h1>
          <p className="text-gray-600">Track deadlines and never miss an assignment</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          + Add Assignment
        </button>
      </div>

      {/* Summary Cards */}
      {reminders && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className={`card ${reminders.summary.overdueCount > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
            <div className="text-2xl mb-1">⚠️</div>
            <p className="text-2xl font-bold text-red-600">{reminders.summary.overdueCount}</p>
            <p className="text-sm text-gray-500">Overdue</p>
          </div>
          <div className={`card ${reminders.summary.dueTodayCount > 0 ? 'bg-orange-50 border-orange-200' : 'bg-gray-50'}`}>
            <div className="text-2xl mb-1">🔥</div>
            <p className="text-2xl font-bold text-orange-600">{reminders.summary.dueTodayCount}</p>
            <p className="text-sm text-gray-500">Due Today</p>
          </div>
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="text-2xl mb-1">📅</div>
            <p className="text-2xl font-bold text-yellow-600">{reminders.summary.dueThisWeekCount}</p>
            <p className="text-sm text-gray-500">This Week</p>
          </div>
          <div className="card bg-blue-50 border-blue-200">
            <div className="text-2xl mb-1">📋</div>
            <p className="text-2xl font-bold text-blue-600">{reminders.summary.totalPending}</p>
            <p className="text-sm text-gray-500">Total Pending</p>
          </div>
        </div>
      )}

      {/* Add Assignment Form */}
      {showAddForm && (
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Assignment</h2>
          <form onSubmit={handleAddAssignment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Subject *</label>
              <input
                type="text"
                value={newAssignment.subject}
                onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                placeholder="e.g., Mathematics"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Title *</label>
              <input
                type="text"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                placeholder="e.g., Chapter 5 Homework"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Due Date *</label>
              <input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Type</label>
              <select
                value={newAssignment.type}
                onChange={(e) => setNewAssignment({ ...newAssignment, type: e.target.value })}
                className="input-field"
              >
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
                <option value="exam">Exam</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Description (Optional)</label>
              <textarea
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                placeholder="Additional details..."
                className="input-field"
                rows={2}
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Add Assignment</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        {['upcoming', 'all', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Urgent Reminders */}
      {reminders && (reminders.overdue.length > 0 || reminders.dueToday.length > 0 || reminders.dueTomorrow.length > 0) && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">⚡ Urgent</h2>
          <div className="space-y-3">
            {/* Overdue */}
            {reminders.overdue.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
                urgencyColor="border-red-500 bg-red-50"
                urgencyText={`${Math.abs(assignment.daysUntilDue)} days overdue`}
              />
            ))}
            {/* Due Today */}
            {reminders.dueToday.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
                urgencyColor="border-orange-500 bg-orange-50"
                urgencyText="Due today!"
              />
            ))}
            {/* Due Tomorrow */}
            {reminders.dueTomorrow.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDelete}
                urgencyColor="border-yellow-500 bg-yellow-50"
                urgencyText="Due tomorrow"
              />
            ))}
          </div>
        </div>
      )}

      {/* All Assignments */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {filter === 'upcoming' ? '📅 Upcoming' : filter === 'completed' ? '✅ Completed' : '📋 All'} Assignments
        </h2>
        
        {assignments.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-500">
              {filter === 'completed' ? 'No completed assignments yet' : 'No assignments found'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {filter !== 'completed' && 'Upload a syllabus or add assignments manually'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const daysUntilDue = Math.ceil((new Date(assignment.dueDate) - new Date()) / (24 * 60 * 60 * 1000));
              return (
                <AssignmentCard
                  key={assignment.id}
                  assignment={{ ...assignment, daysUntilDue }}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDelete}
                  urgencyColor={assignment.completed ? 'border-green-300 bg-green-50' : getUrgencyColor(daysUntilDue)}
                  urgencyText={assignment.completed ? 'Completed' : formatDueDate(daysUntilDue)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-8 card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Stay on Track</h3>
        <ul className="space-y-2 text-blue-700">
          <li>• Check this page daily to stay updated on deadlines</li>
          <li>• Start assignments at least 3 days before the due date</li>
          <li>• Upload your syllabi to auto-import all assignments</li>
          <li>• Mark assignments complete to track your progress</li>
        </ul>
      </div>
    </div>
  );
}

// Assignment Card Component
function AssignmentCard({ assignment, onToggleComplete, onDelete, urgencyColor, urgencyText }) {
  const getTypeColor = (type) => {
    switch (type) {
      case 'exam': return 'bg-red-100 text-red-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'quiz': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className={`border-l-4 rounded-lg p-4 ${urgencyColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <input
            type="checkbox"
            checked={assignment.completed}
            onChange={() => onToggleComplete(assignment.id, assignment.completed)}
            className="w-5 h-5 mt-1 mr-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(assignment.type)}`}>
                {assignment.type}
              </span>
              <span className="text-sm text-gray-500">{assignment.subject}</span>
            </div>
            <h3 className={`font-semibold ${assignment.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {assignment.title}
            </h3>
            {assignment.description && (
              <p className="text-sm text-gray-500 mt-1">{assignment.description}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">
            {new Date(assignment.dueDate).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })}
          </p>
          <p className={`text-xs mt-1 ${
            assignment.daysUntilDue < 0 ? 'text-red-600' : 
            assignment.daysUntilDue === 0 ? 'text-orange-600' : 
            assignment.daysUntilDue <= 3 ? 'text-yellow-600' : 'text-gray-500'
          }`}>
            {urgencyText}
          </p>
          <button
            onClick={() => onDelete(assignment.id)}
            className="text-red-500 hover:text-red-700 text-xs mt-2"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
