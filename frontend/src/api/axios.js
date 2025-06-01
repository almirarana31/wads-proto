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
    (config) => {        // Try to get token from sessionStorage first, then localStorage
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Request headers:', config.headers); // Debug log
        }
        return config;
    },
    (error) => {
        return Promise.reject(error); // lead to log in page again 
    }
);

// Add a response interceptor for handling errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle specific error cases here
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Clear tokens ONLY on unauthorized (invalid/expired token)
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('user');
                    sessionStorage.removeItem('sessionExpires');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                    break;
                case 403:
                    // Don't clear tokens for forbidden requests
                    console.error('Access forbidden:', error.response.data);
                    // You might want to show an error message to the user here
                    break;
                default:
                    break;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
