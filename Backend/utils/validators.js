// Input Validation Utilities

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate ISBN-10 or ISBN-13 format
 * @param {string} isbn - ISBN to validate
 * @returns {boolean} - True if valid
 */
function isValidISBN(isbn) {
    if (!isbn) return true; // ISBN is optional

    // Remove hyphens and spaces
    const cleanISBN = isbn.replace(/[-\s]/g, '');

    // Check if it's ISBN-10 or ISBN-13
    if (cleanISBN.length === 10) {
        return /^\d{9}[\dX]$/.test(cleanISBN);
    } else if (cleanISBN.length === 13) {
        return /^\d{13}$/.test(cleanISBN);
    }

    return false;
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, message: string }
 */
function validatePassword(password) {
    if (!password || password.length < 6) {
        return {
            valid: false,
            message: 'Password must be at least 6 characters long.'
        };
    }

    // Optional: Add more strict validation
    // if (!/[A-Z]/.test(password)) {
    //   return {
    //     valid: false,
    //     message: 'Password must contain at least one uppercase letter.'
    //   };
    // }

    return { valid: true, message: 'Password is valid.' };
}

/**
 * Validate date format and ensure it's valid
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - True if valid
 */
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

/**
 * Validate user role
 * @param {string} role - Role to validate
 * @returns {boolean} - True if valid
 */
function isValidRole(role) {
    const validRoles = ['ADMIN', 'LIBRARIAN', 'STUDENT'];
    return validRoles.includes(role);
}

/**
 * Sanitize string input (remove special characters)
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string
 */
function sanitizeString(input) {
    if (typeof input !== 'string') return input;

    // Remove potentially dangerous characters
    return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate pagination parameters
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {object} - { page: number, limit: number }
 */
function validatePagination(page, limit) {
    const validPage = Math.max(1, parseInt(page) || 1);
    const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));

    return { page: validPage, limit: validLimit };
}

module.exports = {
    isValidEmail,
    isValidISBN,
    validatePassword,
    isValidDate,
    isValidRole,
    sanitizeString,
    validatePagination
};
