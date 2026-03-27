/**
 * API Configuration
 * Automatically uses environment variables if available, falls back to localhost for development
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || `https://end-of-the-year-jarhi.onrender.com:5000`;

export default API_BASE_URL;
