// Logger Utility
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Log user actions to the database
 * @param {string} userId - User ID performing the action
 * @param {string} action - Action being performed
 * @param {string} details - Additional details about the action
 */
async function logAction(userId, action, details = '') {
    try {
        await prisma.systemLog.create({
            data: {
                userId,
                action,
                details
            }
        });
    } catch (error) {
        console.error('Failed to log action:', error);
    }
}

/**
 * Log system events (no user associated)
 * @param {string} action - Action being performed
 * @param {string} details - Additional details about the action
 */
async function logSystemEvent(action, details = '') {
    try {
        await prisma.systemLog.create({
            data: {
                action,
                details
            }
        });
    } catch (error) {
        console.error('Failed to log system event:', error);
    }
}

/**
 * Log errors
 * @param {string} error - Error object or message
 * @param {string} context - Context where the error occurred
 */
function logError(error, context = '') {
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : error;
    const stack = error instanceof Error ? error.stack : '';

    console.error(`[${timestamp}] ERROR in ${context}:`, errorMessage);
    if (stack) {
        console.error('Stack trace:', stack);
    }
}

/**
 * Log info messages
 * @param {string} message - Info message
 * @param {object} data - Additional data to log
 */
function logInfo(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO:`, message);
    if (data) {
        console.log('Data:', JSON.stringify(data, null, 2));
    }
}

module.exports = {
    logAction,
    logSystemEvent,
    logError,
    logInfo
};
