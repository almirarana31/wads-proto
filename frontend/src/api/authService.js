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
        const response = await api.patch(`/staff/tickets`, { ticket_id: ticketId });
        return response.data;
    },    
    
    async staffCancelTicket(ticketId) {
        const response = await api.patch(`/staff/tickets/${ticketId}/cancel`);
        return response.data;
    },    
    
    async staffResolveTicket(ticketId) {
        const response = await api.patch(`/staff/tickets/${ticketId}/resolve`);
        return response.data;
    },
      
    async updateTicketNote(ticketId, note) {
        const response = await api.patch(`/staff/tickets/${ticketId}/note`, { note });
        return response.data;
    },
      async getConversationHistory(ticketId, sortBy = 'newest') {
        const response = await api.get(`/conversation/${ticketId}/history?sortBy=${sortBy}`);
        return response.data;
    },

    async closeConversation(conversationId) {
        const response = await api.patch(`/conversation/${conversationId}`);
        return response.data;
    },

    async createConversation(ticketId) {
        const response = await api.post(`/conversation/${ticketId}`);
        return response.data;
    },

    async sendMessage(conversationId, message) {
        const response = await api.post(`/conversation/${conversationId}/message`, { content: message });
        return response.data;
    },    
      async getConversation(conversationId) {
        const response = await api.get(`/conversation/${conversationId}`);
       
        if (Array.isArray(response.data) && !response.data.metadata) {
           
            const responseData = [...response.data];
            
            const sequenceNumber = sessionStorage.getItem(`conversation_number_${conversationId}`);
            
            // Check for the new closed attribute in the API response
            const closedItem = responseData.find(item => item.closed !== undefined);
            const isClosed = closedItem ? closedItem.closed : false;

            responseData.metadata = {
                sequenceNumber: sequenceNumber ? parseInt(sequenceNumber) : null,
                isOpen: !isClosed
            };
            
            return responseData;
        }
        return response.data;
    },

    async showAudit() {
        const response = await api.get('/audit/log');
        return response.data;
    }, 
    async getAdminTickets() {
        // GET /admin/all-tickets
        const response = await api.get('/admin/all-tickets');
        return response.data;
    },

    async getAdminStatusSummary() {
        const response = await api.get('/admin/status-summary');
        // Transform the response data to match the expected format
        const summary = {
            total: 0,
            pending: 0,
            inProgress: 0,
            resolved: 0,
            cancelled: 0
        };
        
        // Map the backend response to our frontend structure
        response.data.forEach(item => {
            switch(item.name?.toLowerCase()) {
                case 'pending':
                    summary.pending = parseInt(item.count);
                    break;
                case 'in progress':
                    summary.inProgress = parseInt(item.count);
                    break;
                case 'resolved':
                    summary.resolved = parseInt(item.count);
                    break;
                case 'cancelled':
                    summary.cancelled = parseInt(item.count);
                    break;
            }
        });
        
        // Calculate total
        summary.total = summary.pending + summary.inProgress + summary.resolved + summary.cancelled;
        
        return summary;
    },

    async getAdminStaffPerformance() {
        // GET /admin/staff-performance
        const response = await api.get('/admin/staff-performance');
        return response.data;
    },

    async getAdminStaffDetail(staffId) {
        // GET /admin/staff-detail/:id
        const response = await api.get(`/admin/staff-detail/${staffId}`);
        return response.data;
    },

    async createAdminStaff(staffData) {
        // POST /admin/staff
        const response = await api.post('/admin/staff', staffData);
        return response.data;
    },

    async editAdminStaff(staffId, staffData) {
        // PATCH /admin/staff-detail/:id
        const response = await api.patch(`/admin/staff-detail/${staffId}`, staffData);
        return response.data;
    },

    async updateAdminTicketPriority(ticketId, priority_id) {
        const response = await api.patch(`/admin/tickets/${ticketId}`, { priority_id });
        return response.data;
    },

    async getPriorities() {
        // Adjust the endpoint as per your backend route
        const response = await api.get('/ticket/priorities');
        return response.data;
    },

    async getCategories() {
        const response = await api.get('/ticket/categories');
        return response.data;
    },

    async getStaffForTicket(ticketId) {
        try {
            // Add error checking for ticketId
            if (!ticketId) {
                throw new Error('Ticket ID is required');
            }

            const response = await api.get(`/admin/staff/${ticketId}`);
            console.log('Raw API Response:', response);
            console.log('API Response data:', response.data);

            // Ensure we have an array response
            if (!response.data) {
                throw new Error('No data received from server');
            }

            // If response.data is not an array, wrap it in an array
            const staffData = Array.isArray(response.data) ? response.data : [response.data];
            return staffData;

        } catch (error) {
            console.error('Staff fetch error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            throw new Error(`Failed to fetch staff: ${error.message}`);
        }
    },

    async assignTicketToStaff(ticketId, staffId) {
        const response = await api.patch(`/admin/tickets/${ticketId}/staff`, {
            id: staffId
        });
        return response.data;
    },

    async getAdminStaffActivationStatus(staffId) {
        try {
            const response = await api.get(`/admin/${staffId}/activation-status`);
            return response.data;
        } catch (error) {
            console.error('Error fetching staff activation status:', error);
            throw error;
        }
    }
};
