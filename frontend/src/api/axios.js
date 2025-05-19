import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000/api',  // Your backend URL from .env
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor for handling tokens
api.interceptors.request.use(
    (config) => {
        // Try to get token from sessionStorage first, then localStorage
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle specific error cases here
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            switch (error.response.status) {
                case 401:
                    // Clear tokens on unauthorized response
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('user');
                    sessionStorage.removeItem('sessionExpires');
                    localStorage.removeItem('token');
                    break;
                case 403:
                    // Also clear tokens on forbidden response (token expired)
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('user');
                    sessionStorage.removeItem('sessionExpires');
                    localStorage.removeItem('token');
                    break;
                default:
                    break;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
