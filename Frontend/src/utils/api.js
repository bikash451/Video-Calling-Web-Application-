import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getProfile: (userId) => api.get(`/auth/profile/${userId}`),
};

export const meetingAPI = {
    create: (data) => api.post('/meetings/create', data),
    get: (meetingId) => api.get(`/meetings/${meetingId}`),
    getScheduled: () => api.get('/meetings/scheduled/all'),
    end: (meetingId) => api.patch(`/meetings/${meetingId}/end`),
    saveChat: (meetingId, data) => api.post(`/meetings/${meetingId}/chat`, data),
};

export default api;
