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
