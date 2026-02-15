// API Service - Centralized API calls
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
    return localStorage.getItem('smartlib_token');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        const text = await response.text();
        data = { error: text || 'Unknown server error' };
    }

    if (!response.ok) {
        throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
    const token = getAuthToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);
    return handleResponse(response);
};

// Authentication APIs
export const authAPI = {
    login: async (email, password) => {
        return apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    register: async (userData) => {
        return apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    getCurrentUser: async () => {
        return apiRequest('/auth/me');
    },

    logout: async () => {
        return apiRequest('/auth/logout', { method: 'POST' });
    },
};

// User Management APIs
export const userAPI = {
    getAll: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/users${query ? `?${query}` : ''}`);
    },

    getById: async (id) => {
        return apiRequest(`/users/${id}`);
    },

    create: async (userData) => {
        return apiRequest('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    update: async (id, userData) => {
        return apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData),
        });
    },

    delete: async (id) => {
        return apiRequest(`/users/${id}`, { method: 'DELETE' });
    },

    getStats: async () => {
        return apiRequest('/users/stats');
    },
};

// Book Management APIs
export const bookAPI = {
    getAll: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/books${query ? `?${query}` : ''}`);
    },

    getById: async (id) => {
        return apiRequest(`/books/${id}`);
    },

    create: async (bookData) => {
        return apiRequest('/books', {
            method: 'POST',
            body: JSON.stringify(bookData),
        });
    },

    update: async (id, bookData) => {
        return apiRequest(`/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(bookData),
        });
    },

    delete: async (id) => {
        return apiRequest(`/books/${id}`, { method: 'DELETE' });
    },

    getStats: async () => {
        return apiRequest('/books/stats');
    },

    getCategories: async () => {
        return apiRequest('/books/categories');
    },

    uploadBook: async (formData) => {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/upload/book`, {
            method: 'POST',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: formData, // Don't set Content-Type for FormData
        });
        return handleResponse(response);
    },

    deleteBook: async (id) => {
        return apiRequest(`/upload/book/${id}`, { method: 'DELETE' });
    },

    downloadBook: async (digitalUrl) => {
        const token = getAuthToken();
        const fullUrl = digitalUrl.startsWith('http')
            ? digitalUrl
            : `${API_URL.replace('/api', '')}${digitalUrl}`;

        const response = await fetch(fullUrl, {
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            throw new Error('Failed to download book');
        }

        const blob = await response.blob();
        return blob;
    },
};

// Borrowing APIs
export const borrowingAPI = {
    borrow: async (bookId, dueDate) => {
        return apiRequest('/borrowing/borrow', {
            method: 'POST',
            body: JSON.stringify({ bookId, dueDate }),
        });
    },

    returnBook: async (recordId) => {
        return apiRequest(`/borrowing/return/${recordId}`, { method: 'POST' });
    },

    getMyBooks: async (status) => {
        const query = status ? `?status=${status}` : '';
        return apiRequest(`/borrowing/my-books${query}`);
    },

    getAll: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/borrowing/all${query ? `?${query}` : ''}`);
    },

    getOverdue: async () => {
        return apiRequest('/borrowing/overdue');
    },

    updateFine: async (recordId, fineAmount) => {
        return apiRequest(`/borrowing/fine/${recordId}`, {
            method: 'PUT',
            body: JSON.stringify({ fineAmount }),
        });
    },

    processRequest: async (requestId, status) => {
        return apiRequest(`/borrowing/request/${requestId}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },
};

// Analytics APIs
export const analyticsAPI = {
    getDashboard: async () => {
        return apiRequest('/analytics/dashboard');
    },

    getActivities: async (limit = 50) => {
        return apiRequest(`/analytics/activities?limit=${limit}`);
    },

    getPerformance: async () => {
        return apiRequest('/analytics/performance');
    },

    generateReport: async (reportType, startDate, endDate) => {
        return apiRequest('/analytics/report', {
            method: 'POST',
            body: JSON.stringify({ reportType, startDate, endDate }),
        });
    },
};

// Statistics APIs (Advanced Analytics)
export const statisticsAPI = {
    getTrendingBooks: async (limit = 10, period = 30) => {
        return apiRequest(`/statistics/trending-books?limit=${limit}&period=${period}`);
    },

    getCirculationByPeriod: async (period = 'month') => {
        return apiRequest(`/statistics/circulation-by-period?period=${period}`);
    },

    getCategoryAnalytics: async () => {
        return apiRequest('/statistics/category-analytics');
    },

    getSearchTrends: async () => {
        return apiRequest('/statistics/search-trends');
    },

    getUserActivity: async () => {
        return apiRequest('/statistics/user-activity');
    },
};

// System Logs APIs
export const logsAPI = {
    getAll: async (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiRequest(`/logs${query ? `?${query}` : ''}`);
    },

    create: async (action, details) => {
        return apiRequest('/logs', {
            method: 'POST',
            body: JSON.stringify({ action, details }),
        });
    },
};

// System Configuration APIs
export const systemAPI = {
    getSettings: async () => {
        return apiRequest('/system/settings');
    },

    updateSettings: async (settings) => {
        return apiRequest('/system/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    },

    performMaintenance: async (action) => {
        return apiRequest(`/system/maintenance/${action}`, {
            method: 'POST',
        });
    },

    getHealthStats: async () => {
        return apiRequest('/system/health-stats');
    },
};

// Session/Active Users APIs
export const sessionAPI = {
    getActiveSessions: async () => {
        return apiRequest('/sessions/active');
    },

    getActiveStudents: async () => {
        return apiRequest('/sessions/active-students');
    },

    getActiveByRole: async () => {
        return apiRequest('/sessions/active-by-role');
    },
};

// Real-Time Analytics
export const realtimeAPI = {
    getRealtimeStats: async () => {
        return apiRequest('/analytics/dashboard');
    },
};

// Profile APIs
export const profileAPI = {
    getProfile: async () => {
        return apiRequest('/profile');
    },

    updateProfile: async (profileData) => {
        return apiRequest('/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    },

    uploadProfilePicture: async (formData) => {
        const token = getAuthToken();
        const response = await fetch(`${API_URL}/profile/upload-picture`, {
            method: 'POST',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: formData, // Don't set Content-Type for FormData
        });
        return handleResponse(response);
    },

    deleteProfilePicture: async () => {
        return apiRequest('/profile/picture', {
            method: 'DELETE',
        });
    },
};

export default {
    auth: authAPI,
    users: userAPI,
    books: bookAPI,
    borrowing: borrowingAPI,
    analytics: analyticsAPI,
    statistics: statisticsAPI,
    logs: logsAPI,
    system: systemAPI,
    profile: profileAPI,
    sessions: sessionAPI,
    realtime: realtimeAPI,
};
