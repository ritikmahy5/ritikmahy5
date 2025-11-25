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
