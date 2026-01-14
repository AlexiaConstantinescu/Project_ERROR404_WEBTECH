const API_BASE = process.env.REACT_APP_API_URL || '';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function apiRequest(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...getAuthHeader(), ...(options.headers || {}) };
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }
    if (!res.ok) {
        const err = new Error(data && data.message ? data.message : 'API error');
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return data;
}

export async function login(email, password) {
    return apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
}

export async function register(name, email, password) {
    return apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password })
    });
}

export async function getProfile() {
    return apiRequest('/api/users/profile');
}

export async function fetchNotes(query = '') {
    return apiRequest(`/api/notes${query}`);
}

export async function createNote(payload) {
    return apiRequest('/api/notes', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateNote(id, payload) {
    return apiRequest(`/api/notes/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function deleteNote(id) {
    return apiRequest(`/api/notes/${id}`, { method: 'DELETE' });
}

export async function fetchSubjects() {
    return apiRequest('/api/subjects');
}

export async function createSubject(name, description = '', color = '#3b82f6') {
    return apiRequest('/api/subjects', {
        method: 'POST',
        body: JSON.stringify({ name, description, color })
    });
}

export async function fetchTags() {
    return apiRequest('/api/tags');
}

export async function createTag(name) {
    return apiRequest('/api/tags', {
        method: 'POST',
        body: JSON.stringify({ name })
    });
}

export async function uploadAttachment(file, noteId) {
    const form = new FormData();
    form.append('file', file);
    form.append('noteId', noteId);

    const headers = getAuthHeader();
    const res = await fetch(`${API_BASE}/api/attachments`, { method: 'POST', headers, body: form });
    if (!res.ok) {
        const text = await res.text();
        let data = null;
        try { data = JSON.parse(text); } catch { data = text; }
        const err = new Error(data && data.message ? data.message : 'Upload error');
        err.status = res.status;
        err.data = data;
        throw err;
    }
    return res.json();
}

export async function deleteAttachment(id) {
    return apiRequest(`/api/attachments/${id}`, { method: 'DELETE' });
}

export async function shareNote(noteId) {
    return apiRequest('/api/shares', { method: 'POST', body: JSON.stringify({ noteId }) });
}

export async function getSharedNote(token) {
    return apiRequest(`/api/shares/${token}`);
}

export async function getMyGroups() {
    return apiRequest('/api/groups');
}

export async function createGroup(name, description = '') {
    return apiRequest('/api/groups', {
        method: 'POST',
        body: JSON.stringify({ name, description })
    });
}

export async function searchUserByEmail(email) {
    return apiRequest(`/api/groups/search/users/${email}`);
}

export async function addMemberToGroup(groupId, userId) {
    return apiRequest(`/api/groups/${groupId}/members`, {
        method: 'POST',
        body: JSON.stringify({ userId })
    });
}

export async function removeMemberFromGroup(groupId, userId) {
    return apiRequest(`/api/groups/${groupId}/members/${userId}`, {
        method: 'DELETE'
    });
}

export default { apiRequest };
