const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

/**
 * Helper to build auth headers
 */
function getHeaders(isFormData = false) {
  const token = localStorage.getItem('campus_ai_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register(name, email, password, role = 'student', department = 'General') {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, email, password, role, department })
    });
    return handleResponse(res);
  },

  async demoLogin(role = 'student') {
    const res = await fetch(`${BASE_URL}/auth/demo-login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ role })
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  // Chat & RAG
  async askQuestion(question, conversationId, category = 'All', department = 'All') {
    const res = await fetch(`${BASE_URL}/chat/query`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question, conversationId, category, department })
    });
    return handleResponse(res);
  },

  async getConversations() {
    const res = await fetch(`${BASE_URL}/chat/conversations`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getMessages(conversationId) {
    const res = await fetch(`${BASE_URL}/chat/conversations/${conversationId}`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async deleteConversation(conversationId) {
    const res = await fetch(`${BASE_URL}/chat/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async submitFeedback(messageId, conversationId, rating, reason = '', comment = '') {
    const res = await fetch(`${BASE_URL}/chat/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ messageId, conversationId, rating, reason, comment })
    });
    return handleResponse(res);
  },

  // Documents (Knowledge Base)
  async getDocuments() {
    const res = await fetch(`${BASE_URL}/documents`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getDocumentChunks(docId) {
    const res = await fetch(`${BASE_URL}/documents/${docId}/chunks`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async uploadDocument(formData) {
    const res = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData
    });
    return handleResponse(res);
  },

  async deleteDocument(docId) {
    const res = await fetch(`${BASE_URL}/documents/${docId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async summarizeDocument(docId) {
    const res = await fetch(`${BASE_URL}/documents/${docId}/summarize`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async generateDocumentFAQs(docId) {
    const res = await fetch(`${BASE_URL}/documents/${docId}/generate-faqs`, {
      method: 'POST',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async compareDocuments(docId1, docId2) {
    const res = await fetch(`${BASE_URL}/documents/compare`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ docId1, docId2 })
    });
    return handleResponse(res);
  },

  // Analytics & Settings
  async getAnalyticsOverview() {
    const res = await fetch(`${BASE_URL}/analytics/overview`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async getUnresolvedQueries() {
    const res = await fetch(`${BASE_URL}/analytics/unresolved`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async resolveQuery(id, resolutionNotes) {
    const res = await fetch(`${BASE_URL}/analytics/unresolved/${id}/resolve`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ resolutionNotes })
    });
    return handleResponse(res);
  },

  async getSettings() {
    const res = await fetch(`${BASE_URL}/analytics/settings`, {
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  async updateSettings(settings) {
    const res = await fetch(`${BASE_URL}/analytics/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
    return handleResponse(res);
  },

  async downloadAuditReport() {
    const res = await fetch(`${BASE_URL}/analytics/export`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to export audit report');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campus_ai_rag_audit_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  // Health
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return handleResponse(res);
  }
};
