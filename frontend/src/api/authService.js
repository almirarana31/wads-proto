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
        const response = await api.post('/user/sign-up', userData);
        return response.data;
    },

    async activate(token) {
        const response = await api.get(`/user/activate/${token}`);
        console.log("hello gigger");
        return response.data;
    },

    async getUserRoles() {
        const response = await api.get('/user/user-roles');
        console.log("Hello GIGGA");
        return response.data;
    },

    async sendTicket(ticketData) {
        const response = await api.post('/user/tickets', ticketData);
        return response.data;
    },    
    
    async getUserTickets() {
        const response = await api.get('/user/tickets');
        return response.data;
    },
    async getTicketDetail(ticketId) {
        const response = await api.get(`/ticket/${ticketId}`);
        return response.data;
    },

    async editTicket(ticketId, ticketData) {
        const response = await api.put(`/user/tickets/${ticketId}`, ticketData);
        return response.data;
    },
    async cancelTicket(ticketId) {
        const response = await api.patch(`/user/tickets/${ticketId}`);
        return response.data;
    },
    async getUserDetail() {
        const response = await api.get('/user/details');
        return response.data;
    },
    async getStaffDetail() {
        const response = await api.get('/staff/details');
        return response.data;
    },    
    
    async getStaffTickets(queryString = '') {
        const response = await api.get(`/staff/tickets${queryString ? '?' + queryString : ''}`);
        return response.data;
    },    async getTicketPool() {
        const response = await api.get('/staff/tickets/pool');
        return response.data;
    },

    async claimTicket(ticketId) {
        const response = await api.post(`/staff/tickets/claim/${ticketId}`);
        return response.data;
    }
};
