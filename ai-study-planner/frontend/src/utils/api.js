const API_BASE_URL = '/api';

export async function createStudyPlan(planData) {
  const response = await fetch(`${API_BASE_URL}/study-plans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(planData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create study plan');
  }
  
  return response.json();
}

export async function getStudyPlans() {
  const response = await fetch(`${API_BASE_URL}/study-plans`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch study plans');
  }
  
  return response.json();
}

export async function getStudyPlan(id) {
  const response = await fetch(`${API_BASE_URL}/study-plans/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch study plan');
  }
  
  return response.json();
}

export async function updateStudyPlan(id, updates) {
  const response = await fetch(`${API_BASE_URL}/study-plans/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update study plan');
  }
  
  return response.json();
}

export async function deleteStudyPlan(id) {
  const response = await fetch(`${API_BASE_URL}/study-plans/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete study plan');
  }
  
  return true;
}

export async function getTasksForPlan(planId) {
  const response = await fetch(`${API_BASE_URL}/study-plans/${planId}/tasks`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  
  return response.json();
}

export async function updateTask(taskId, updates) {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  
  return response.json();
}

export async function getRecommendations(data) {
  const response = await fetch(`${API_BASE_URL}/recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get recommendations');
  }
  
  return response.json();
}

// ============== ANALYTICS ==============

export async function getAnalytics() {
  const response = await fetch(`${API_BASE_URL}/analytics`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }
  
  return response.json();
}

export async function logStudySession(sessionData) {
  const response = await fetch(`${API_BASE_URL}/study-sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to log study session');
  }
  
  return response.json();
}

// ============== ACHIEVEMENTS ==============

export async function getAchievements() {
  const response = await fetch(`${API_BASE_URL}/achievements`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch achievements');
  }
  
  return response.json();
}

// ============== SPACED REPETITION ==============

export async function getReviews() {
  const response = await fetch(`${API_BASE_URL}/reviews`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch reviews');
  }
  
  return response.json();
}

export async function submitReview(topic, quality) {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ topic, quality }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit review');
  }
  
  return response.json();
}

export async function initializeReviews(planId) {
  const response = await fetch(`${API_BASE_URL}/reviews/init/${planId}`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to initialize reviews');
  }
  
  return response.json();
}

// ============== QUIZZES ==============

export async function generateQuiz(planId, questionCount = 5) {
  const response = await fetch(`${API_BASE_URL}/quizzes/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ planId, questionCount }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate quiz');
  }
  
  return response.json();
}

export async function getQuiz(quizId) {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch quiz');
  }
  
  return response.json();
}

export async function submitQuiz(quizId, answers) {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit quiz');
  }
  
  return response.json();
}

export async function getQuizHistory() {
  const response = await fetch(`${API_BASE_URL}/quizzes`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch quiz history');
  }
  
  return response.json();
}

// ============== AI CHAT TUTOR ==============

export async function sendChatMessage(message, subject, context) {
  const response = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, subject, context }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
}

export async function getChatHistory(chatId) {
  const response = await fetch(`${API_BASE_URL}/ai/chat/${chatId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch chat history');
  }
  
  return response.json();
}

export async function clearChatHistory(chatId) {
  const response = await fetch(`${API_BASE_URL}/ai/chat/${chatId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to clear chat');
  }
  
  return true;
}

// ============== AI STUDY COACH ==============

export async function getCoachingAdvice(data) {
  const response = await fetch(`${API_BASE_URL}/ai/coach`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get coaching advice');
  }
  
  return response.json();
}

// ============== AI NOTE SUMMARIZER ==============

export async function summarizeNotes(text, title, type) {
  const response = await fetch(`${API_BASE_URL}/ai/summarize`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, title, type }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to summarize notes');
  }
  
  return response.json();
}

export async function getSavedNotes() {
  const response = await fetch(`${API_BASE_URL}/ai/notes`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  
  return response.json();
}

export async function deleteNote(noteId) {
  const response = await fetch(`${API_BASE_URL}/ai/notes/${noteId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete note');
  }
  
  return true;
}

// ============== AI WEAKNESS ANALYZER ==============

export async function analyzeWeaknesses() {
  const response = await fetch(`${API_BASE_URL}/ai/analyze-weaknesses`);
  
  if (!response.ok) {
    throw new Error('Failed to analyze weaknesses');
  }
  
  return response.json();
}

// ============== SYLLABUS UPLOAD ==============

export async function uploadSyllabus(file, subject, semester, professor) {
  const formData = new FormData();
  formData.append('syllabus', file);
  formData.append('subject', subject);
  if (semester) formData.append('semester', semester);
  if (professor) formData.append('professor', professor);
  
  const response = await fetch(`${API_BASE_URL}/syllabus/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload syllabus');
  }
  
  return response.json();
}

export async function getSyllabi() {
  const response = await fetch(`${API_BASE_URL}/syllabus`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch syllabi');
  }
  
  return response.json();
}

export async function getSyllabus(id) {
  const response = await fetch(`${API_BASE_URL}/syllabus/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch syllabus');
  }
  
  return response.json();
}

export async function deleteSyllabus(id) {
  const response = await fetch(`${API_BASE_URL}/syllabus/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete syllabus');
  }
  
  return true;
}

export async function generatePlanFromSyllabus(syllabusId, options = {}) {
  const response = await fetch(`${API_BASE_URL}/syllabus/${syllabusId}/generate-plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate plan');
  }
  
  return response.json();
}

// ============== ASSIGNMENTS ==============

export async function getAssignments(filters = {}) {
  const params = new URLSearchParams();
  if (filters.subject) params.append('subject', filters.subject);
  if (filters.upcoming) params.append('upcoming', 'true');
  if (filters.completed !== undefined) params.append('completed', filters.completed);
  
  const url = `${API_BASE_URL}/assignments${params.toString() ? '?' + params.toString() : ''}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch assignments');
  }
  
  return response.json();
}

export async function createAssignment(data) {
  const response = await fetch(`${API_BASE_URL}/assignments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create assignment');
  }
  
  return response.json();
}

export async function updateAssignment(id, updates) {
  const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update assignment');
  }
  
  return response.json();
}

export async function deleteAssignment(id) {
  const response = await fetch(`${API_BASE_URL}/assignments/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete assignment');
  }
  
  return true;
}

export async function getAssignmentReminders() {
  const response = await fetch(`${API_BASE_URL}/assignments/reminders`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch reminders');
  }
  
  return response.json();
}
