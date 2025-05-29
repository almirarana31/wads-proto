import api from './axios';

export const authService = {
    async login(credentials) {
        // Make sure rememberMe is included in credentials
        const response = await api.post('/user/log-in', {
            ...credentials,
            rememberMe: credentials.rememberMe || false
        });
        return response.data;
    },

    async signup(userData) {
        // Use the correct endpoint as per backend: 'USER/sign-up'
        const response = await api.post('/USER/sign-up', userData);
        return response.data;
    },

    async activate(token) {
        const response = await api.get(`/user/activate/${token}`);
        return response.data;
    }
};
