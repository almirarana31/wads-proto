import api from './axios';

export const authService = {
    async login(credentials) {
        // Make sure rememberMe is included in credentials
        const response = await api.post('/user/log-in', {
            ...credentials,
            rememberMe: credentials.rememberMe || false
        });
        return response.data;
    },    async signup(userData) {
        console.log('Signing up user...', userData);
        try {
            // The /api prefix is added by the interceptor
            const response = await api.post('/user/sign-up', userData);
            console.log('Signup successful', response.data);
            return response.data;
        } catch (error) {
            console.error('Signup failed:', error);
            throw error;
        }
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
    },    
    
    async getTicketPool() {
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
        const response = await api.get(`/conversation/ticket/${ticketId}/history?sortBy=${sortBy}`);
        return response.data;
    },

    async closeConversation(conversationId) {
        const response = await api.patch(`/conversation/${conversationId}`);
        return response.data;
    },

    async createConversation(ticketId) {
        const response = await api.post(`/conversation/ticket/${ticketId}`);
        if (response.data && !response.data.id) {
            // if don't have an ID in the response, try to fetch the latest conversation
            const conversations = await this.getConversationHistory(ticketId);
            if (conversations && conversations.length > 0) {
                // get most recent conversation
                const latestConversation = conversations[0];
                return { id: latestConversation.id };
            }
        }
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
    },    async showAudit(params = {}) {
        const queryParams = new URLSearchParams();
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        if (params.action) queryParams.append('action', params.action);
        if (params.search) queryParams.append('search', params.search);
        
        const queryString = queryParams.toString();
        const response = await api.get(`/audit/log${queryString ? '?' + queryString : ''}`);
        return response.data;
    }, 
    async getAdminTickets() {
        // GET /admin/all-tickets
        const response = await api.get('/admin/all-tickets');
        return response.data;
    },

    async getAdminStatusSummary() {
        const response = await api.get('/admin/status-summary');
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
                default:
                    console.warn(`Unknown status type: ${item.name}`);
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

    async updateTicketPriority(ticketId, priority_id) {
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
    },    async getStaffForTicket(ticketId) {
        try {
            if (!ticketId) {
                console.warn('getStaffForTicket called without ticketId');
                return [];
            }

            console.log(`🔍 Fetching staff for ticket ${ticketId}`);
            const response = await api.get(`/admin/staff/ticket/${ticketId}`);
            
            if (!response.data) {
                console.log(`No staff data returned for ticket ${ticketId}`);
                return [];
            }

            return Array.isArray(response.data) ? response.data : [response.data];
        } catch (error) {
            console.error('Error fetching staff for ticket:', error);
            return [];
        }
    },    async assignTicketToStaff(ticketId, staffId) {
        if (!ticketId || !staffId) {
            throw new Error('Both ticketId and staffId are required');
        }

        console.log(`📤 Assigning ticket ${ticketId} to staff ${staffId}`);
        try {
            const response = await api.patch(`/admin/tickets/${ticketId}/staff`, {
                id: staffId
            });

            // Clear any cached staff data for this ticket
            sessionStorage.removeItem(`ticket_staff_${ticketId}`);

            console.log(`📥 Assignment successful:`, response.data);
            return response.data;
        } catch (error) {
            console.error(`❌ Assignment failed:`, error.response?.data || error.message);
            
            // Provide detailed error information
            const errorMessage = error.response?.data?.message || error.message;
            throw new Error(`Failed to assign ticket: ${errorMessage}`);
        }
    },

    async getAdminStaffActivationStatus(staffId) {
        try {
            const response = await api.get(`/admin/account/${staffId}/activation-status`);
            return response.data;
        } catch (error) {
            console.error('Error fetching staff activation status:', error);
            throw error;
        }
    },

    async getAdminTicketDetails(ticketId) {
        try {
            // Add admin flag to indicate admin access
            const response = await api.get(`/admin/tickets/${ticketId}`, {
              headers: {
                'X-User-Role': 'ADM' // Add role header to bypass category restrictions
              }
            });
            return response.data;
          } catch (error) {
            if (error.response?.status === 401) {
              // Handle session expiration explicitly
              throw new Error('Session expired. Please log in again.');
            }
            throw error;
          }
    },
    
    async forgetPassword(email) {
        try {
            const response = await api.post('/user/forget-password', { email });
            return response.data;
        } catch (error) {
            console.error('Error in forgetPassword:', error);
            throw error;
        }
    },    
    
    async enterNewPassword(token, password) {
        try {
            const response = await api.post(`/user/enter-new-password/${token}`, { password });
            return response.data;
        } catch (error) {
            console.error('Error in enterNewPassword:', error);
            throw error;
        }    },    async validResetLink(token) {
        try {
            const response = await api.get(`/user/verify-reset-link/${token}`);
            return response.data;
        } catch (error) {
            console.error('Error in validResetLink:', error);
            throw error;
        }
    },

    async sendChatMessage(message, conversationHistory = []) {
        try {
            const response = await api.post('/chatbot/message', {
                message,
                conversationHistory
            });
            return response.data;
        } catch (error) {
            console.error('Error in sendChatMessage:', error);
            throw error;
        }
    }
};
