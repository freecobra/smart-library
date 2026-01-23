// Librarian-specific API functions
import { bookAPI, userAPI, borrowingAPI, analyticsAPI, logsAPI, systemAPI } from './api';

// Statistics for Librarian Dashboard
export const librarianAPI = {
    // Get librarian dashboard statistics
    getStats: async () => {
        try {
            const [booksResponse, usersResponse, borrowingResponse] = await Promise.all([
                bookAPI.getStats(),
                userAPI.getStats(),
                borrowingAPI.getAll({ limit: 1000 })
            ]);

            // Calculate statistics
            const totalBooks = booksResponse.total || 0;
            const availableBooks = booksResponse.available || 0;
            const borrowedBooks = borrowingResponse.borrowRecords?.filter(r => r.status === 'BORROWED').length || 0;
            const overdueBooks = borrowingResponse.borrowRecords?.filter(r =>
                r.status === 'BORROWED' && new Date(r.dueDate) < new Date()
            ).length || 0;

            const totalMembers = usersResponse.byRole?.student || 0;
            const activeMembers = usersResponse.activeUsers || 0;

            return {
                totalBooks,
                availableBooks,
                borrowedBooks,
                overdueBooks,
                totalMembers,
                activeMembers,
                pendingRequests: 0 // Will be fetched separately
            };
        } catch (error) {
            console.error('Error fetching librarian stats:', error);
            throw error;
        }
    },

    // Get all books with pagination and filtering
    getBooks: async (params = {}) => {
        return bookAPI.getAll(params);
    },

    // Add a new book
    addBook: async (bookData) => {
        return bookAPI.create(bookData);
    },

    // Update book
    updateBook: async (id, bookData) => {
        return bookAPI.update(id, bookData);
    },

    // Delete book
    deleteBook: async (id) => {
        return bookAPI.delete(id);
    },

    // Get library members (students)
    getMembers: async (params = {}) => {
        return userAPI.getAll({ role: 'STUDENT', ...params });
    },

    // Add a new member
    addMember: async (memberData) => {
        return userAPI.create(memberData);
    },

    // Get member details including borrowing history
    getMemberDetails: async (userId) => {
        try {
            const [user, borrowHistory] = await Promise.all([
                userAPI.getById(userId),
                borrowingAPI.getAll({ userId })
            ]);

            return {
                ...user,
                borrowHistory: borrowHistory.records || []
            };
        } catch (error) {
            console.error('Error fetching member details:', error);
            throw error;
        }
    },

    // Get all borrowing records
    getBorrowRecords: async (params = {}) => {
        return borrowingAPI.getAll(params);
    },

    // Get overdue books
    getOverdueBooks: async () => {
        return borrowingAPI.getOverdue();
    },

    // Process book return
    returnBook: async (recordId) => {
        return borrowingAPI.returnBook(recordId);
    },

    // Get recent activity logs
    getRecentActivity: async (limit = 10) => {
        return analyticsAPI.getActivities(limit);
    },

    // Update user (activate/deactivate membership)
    updateMember: async (userId, updates) => {
        return userAPI.update(userId, updates);
    },

    // Process borrow request (Approve/Reject)
    processRequest: async (requestId, status) => {
        return borrowingAPI.processRequest(requestId, status);
    },

    // System Settings
    getSystemSettings: async () => {
        return systemAPI.getSettings();
    },

    updateSystemSettings: async (settings) => {
        return systemAPI.updateSettings(settings);
    },

    performMaintenance: async (action) => {
        return systemAPI.performMaintenance(action);
    },

    getSystemHealthStats: async () => {
        return systemAPI.getHealthStats();
    }
};
