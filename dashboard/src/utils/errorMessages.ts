// src/utils/errorMessages.ts
// Utility functions for handling and displaying error messages

/**
 * Check if an error is a security rejection from the grading service
 * Security rejections occur when code contains prohibited patterns like eval(), infinite loops, or file system operations
 */
export const isSecurityRejection = (error: string | null): boolean => {
  if (!error) return false;
  return error.includes('Code contains prohibited patterns') ||
         error.includes('prohibited patterns') ||
         error.includes('security violation');
};

/**
 * Get a user-friendly message for security rejections
 * This hides the technical details about what patterns are being blocked
 */
export const getSecurityErrorMessage = (): string => {
  return 'Your code contains patterns that aren\'t allowed. Please avoid using eval(), infinite loops, or file system operations.';
};

/**
 * Format an execution error for display
 * If it's a security rejection, return the user-friendly message instead
 */
export const formatExecutionError = (error: string | null): string => {
  if (!error) return '';
  if (isSecurityRejection(error)) {
    return getSecurityErrorMessage();
  }
  return error;
};
