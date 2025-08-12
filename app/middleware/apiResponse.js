// Backend: Create API response middleware
// Create new file: app/middleware/apiResponse.js

/**
 * Standardized API response middleware
 * Ensures all API responses have consistent format
 */
const apiResponse = {
  success: (res, data = null, message = 'Success', statusCode = 200) => {
    const response = {
      success: true,
      message,
      data
    };
    
    return res.status(statusCode).json(response);
  },

  error: (res, error = 'An error occurred', statusCode = 500, details = null) => {
    const response = {
      success: false,
      error,
      ...(details && { details })
    };
    
    return res.status(statusCode).json(response);
  },

  paginated: (res, data, pagination, message = 'Success') => {
    const response = {
      success: true,
      message,
      data,
      pagination
    };
    
    return res.json(response);
  }
};

module.exports = apiResponse;