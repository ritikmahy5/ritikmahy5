import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:5000/api';

function StudyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // 'month', 'week', 'day'
  const [plans, setPlans] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    type: 'study',
    description: '',
    duration: 60,
  });

  // Load data
  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/study-plans`).then(res => res.json()),
      fetch(`${API_BASE}/assignments`).then(res => res.json()),
    ])
      .then(([plansData, assignmentsData]) => {
        setPlans(plansData);
        setAssignments(assignmentsData);
      })
      .catch(err => console.error('Failed to load data:', err));
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (dateStr) => {
    const events = [];
    
    // Add assignments
    assignments.forEach(assignment => {
      if (assignment.dueDate === dateStr) {
        events.push({
          id: assignment.id,
          title: assignment.title,
          type: assignment.type || 'assignment',
          subject: assignment.subject,
          completed: assignment.completed,
          color: getEventColor(assignment.type || 'assignment'),
        });
      }
    });

    // Add study plan tasks
    plans.forEach(plan => {
      const startDate = new Date(plan.createdAt);
      plan.content?.dailyPlan?.forEach((day, index) => {
        const taskDate = new Date(startDate);
        taskDate.setDate(startDate.getDate() + index);
        if (formatDate(taskDate) === dateStr) {
          events.push({
            id: `${plan.id}-day-${day.day}`,
            title: `${plan.subject} - Day ${day.day}`,
            type: 'study',
            subject: plan.subject,
            topics: day.topics,
            duration: day.duration,
            color: 'bg-blue-500',
          });
        }
      });
    });

    return events;
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'exam': return 'bg-red-500';
      case 'quiz': return 'bg-orange-500';
      case 'assignment': return 'bg-purple-500';
      case 'project': return 'bg-green-500';
      case 'study': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const today = formatDate(new Date());

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      const events = getEventsForDate(dateStr);
      const isToday = dateStr === today;
      const isSelected = selectedDate === dateStr;

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(dateStr)}
          className={`h-32 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-blue-50' : ''
          } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          <div className="space-y-1 overflow-hidden">
            {events.slice(0, 3).map((event, idx) => (
              <div
                key={idx}
                className={`text-xs px-1 py-0.5 rounded truncate text-white ${event.color}`}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {events.length > 3 && (
              <div className="text-xs text-gray-500">+{events.length - 3} more</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = formatDate(date);
      const events = getEventsForDate(dateStr);
      const isToday = dateStr === formatDate(new Date());

      days.push(
        <div key={i} className={`flex-1 border-r border-gray-200 ${isToday ? 'bg-blue-50' : ''}`}>
          <div className={`text-center py-2 border-b border-gray-200 ${isToday ? 'font-bold text-blue-600' : ''}`}>
            <div className="text-xs text-gray-500">
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className="text-lg">{date.getDate()}</div>
          </div>
          <div className="p-2 space-y-2 min-h-96">
            {events.map((event, idx) => (
              <div
                key={idx}
                className={`p-2 rounded text-white text-sm ${event.color}`}
              >
                <div className="font-medium truncate">{event.title}</div>
                {event.duration && (
                  <div className="text-xs opacity-80">{event.duration}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const generateICSFile = () => {
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//AI Study Planner//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];

    // Add assignments
    assignments.forEach(assignment => {
      if (assignment.dueDate) {
        const date = new Date(assignment.dueDate);
        const dateOnlyStr = date.toISOString().split('T')[0].replace(/-/g, '');
        icsContent.push(
          'BEGIN:VEVENT',
          `UID:${assignment.id}@ai-study-planner`,
          `DTSTART;VALUE=DATE:${dateOnlyStr}`,
          `SUMMARY:${assignment.title}`,
          `DESCRIPTION:${assignment.description || assignment.subject}`,
          `CATEGORIES:${assignment.type || 'assignment'}`,
          'END:VEVENT'
        );
      }
    });

    // Add study plan tasks
    plans.forEach(plan => {
      const startDate = new Date(plan.createdAt);
      plan.content?.dailyPlan?.forEach((day, index) => {
        const taskDate = new Date(startDate);
        taskDate.setDate(startDate.getDate() + index);
        const dateOnlyStr = taskDate.toISOString().split('T')[0].replace(/-/g, '');
        
        icsContent.push(
          'BEGIN:VEVENT',
          `UID:${plan.id}-day-${day.day}@ai-study-planner`,
          `DTSTART;VALUE=DATE:${dateOnlyStr}`,
          `SUMMARY:Study: ${plan.subject} - Day ${day.day}`,
          `DESCRIPTION:Topics: ${day.topics?.join(', ')}. Activities: ${day.activities?.join(', ')}`,
          'CATEGORIES:study',
          'END:VEVENT'
        );
      });
    });

    icsContent.push('END:VCALENDAR');
    return icsContent.join('\r\n');
  };

  const downloadICS = () => {
    const icsContent = generateICSFile();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'study-calendar.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  const openGoogleCalendar = () => {
    // Open Google Calendar with add event URL
    const baseUrl = 'https://calendar.google.com/calendar/r';
    window.open(baseUrl, '_blank');
    setShowExportModal(false);
  };

  const openOutlookCalendar = () => {
    // Open Outlook Calendar
    const baseUrl = 'https://outlook.live.com/calendar';
    window.open(baseUrl, '_blank');
    setShowExportModal(false);
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📅 Study Calendar</h1>
          <p className="text-gray-600 mt-1">View and manage your study schedule</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            📤 Export Calendar
          </button>
          <button
            onClick={() => {
              setNewEvent({ ...newEvent, date: selectedDate || formatDate(new Date()) });
              setShowEventModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            ➕ Add Event
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ◀️
            </button>
            <h2 className="text-xl font-semibold text-gray-900 min-w-48 text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ▶️
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              Today
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['month', 'week'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === v
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        {view === 'month' ? (
          <>
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gray-50">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-3 text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {renderMonthView()}
            </div>
          </>
        ) : (
          <div className="flex">
            {renderWeekView()}
          </div>
        )}
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Events for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          {selectedDateEvents.length === 0 ? (
            <p className="text-gray-500">No events scheduled for this day.</p>
          ) : (
            <div className="space-y-3">
              {selectedDateEvents.map((event, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border-l-4 ${event.color.replace('bg-', 'border-')} bg-gray-50`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.subject && <span>📚 {event.subject}</span>}
                        {event.duration && <span className="ml-3">⏱️ {event.duration}</span>}
                      </p>
                      {event.topics && (
                        <p className="text-sm text-gray-500 mt-1">
                          Topics: {event.topics.join(', ')}
                        </p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full text-white ${event.color}`}>
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📌 Event Types</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Study Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-600">Assignments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-600">Quizzes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Exams</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Projects</span>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">📤 Export Calendar</h3>
            
            <div className="space-y-4">
              <button
                onClick={downloadICS}
                className="w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-4"
              >
                <span className="text-3xl">📁</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Download ICS File</p>
                  <p className="text-sm text-gray-500">Import into any calendar app</p>
                </div>
              </button>
              
              <button
                onClick={openGoogleCalendar}
                className="w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-4"
              >
                <span className="text-3xl">📆</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Google Calendar</p>
                  <p className="text-sm text-gray-500">Open Google Calendar</p>
                </div>
              </button>
              
              <button
                onClick={openOutlookCalendar}
                className="w-full p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-4"
              >
                <span className="text-3xl">📧</span>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Outlook Calendar</p>
                  <p className="text-sm text-gray-500">Open Outlook Calendar</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowExportModal(false)}
              className="w-full mt-6 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">➕ Add Study Event</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  placeholder="Event title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="study">Study Session</option>
                  <option value="assignment">Assignment</option>
                  <option value="quiz">Quiz</option>
                  <option value="exam">Exam</option>
                  <option value="project">Project</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  rows="3"
                  placeholder="Event details..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (newEvent.title && newEvent.date) {
                    try {
                      await fetch(`${API_BASE}/assignments`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          subject: 'Study',
                          title: newEvent.title,
                          description: newEvent.description,
                          dueDate: newEvent.date,
                          type: newEvent.type,
                        }),
                      });
                      // Reload assignments
                      const res = await fetch(`${API_BASE}/assignments`);
                      setAssignments(await res.json());
                      setShowEventModal(false);
                      setNewEvent({ title: '', date: '', time: '', type: 'study', description: '', duration: 60 });
                    } catch (err) {
                      console.error('Failed to add event:', err);
                    }
                  }
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudyCalendar;
