import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const TicketContext = createContext();

// Initial demo tickets
const initialTickets = [
  {
    id: 'TKT-1001',
    title: 'Appointment Scheduling Issue',
    description: 'I need to reschedule my facial treatment appointment from Tuesday to Thursday.',
    category: 'appointment',
    priority: 'medium',
    status: 'pending',
    createdAt: '2025-04-10T14:30:00Z',
    userId: 'user1',
    userName: 'Jane Smith',
    contactEmail: 'jane.smith@example.com',
    contactPhone: '555-123-4567',
    assignedTo: null,
    responses: []
  },
  {
    id: 'TKT-1002',
    title: 'Billing Question',
    description: 'I was charged twice for my last visit. Can you please check this and issue a refund?',
    category: 'billing',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2025-04-12T09:15:00Z',
    userId: 'user1',
    userName: 'Jane Smith',
    contactEmail: 'jane.smith@example.com',
    contactPhone: '555-123-4567',
    assignedTo: 'staff1',
    responses: [
      {
        id: 'resp1',
        text: 'I am reviewing your billing history now. Could you please confirm the date of the appointment in question?',
        sender: 'Sarah Johnson',
        senderRole: 'employee',
        timestamp: '2025-04-12T11:30:00Z'
      }
    ]
  },
  {
    id: 'TKT-1003',
    title: 'Treatment Information Request',
    description: 'I am interested in the new microneedling treatment. Can you provide more information about the procedure, recovery time, and cost?',
    category: 'treatment',
    priority: 'medium',
    status: 'resolved',
    createdAt: '2025-04-08T16:45:00Z',
    userId: 'user2',
    userName: 'Michael Johnson',
    contactEmail: 'michael.j@example.com',
    contactPhone: '555-987-6543',
    assignedTo: 'admin1',
    responses: [
      {
        id: 'resp2',
        text: 'Thank you for your interest in our microneedling treatment. This procedure uses fine needles to create tiny punctures in the top layer of the skin, which triggers the body to create new collagen and elastin. Recovery time is typically 24-48 hours with some redness and minor swelling. The cost is $299 per session, with package discounts available.',
        sender: 'Dr. Emily Chen',
        senderRole: 'admin',
        timestamp: '2025-04-09T10:15:00Z'
      },
      {
        id: 'resp3',
        text: 'Thank you for the information! I would like to schedule a consultation to discuss this further.',
        sender: 'Michael Johnson',
        senderRole: 'customer',
        timestamp: '2025-04-09T14:30:00Z'
      },
      {
        id: 'resp4',
        text: 'Great! I haveve scheduled a consultation for you next Tuesday at 2:00 PM. Please arrive 15 minutes early to complete any necessary paperwork.',
        sender: 'Dr. Emily Chen',
        senderRole: 'admin',
        timestamp: '2025-04-09T16:00:00Z'
      }
    ]
  }
];

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState(() => {
    // Load tickets from localStorage if available
    const savedTickets = localStorage.getItem('tickets');
    return savedTickets ? JSON.parse(savedTickets) : initialTickets;
  });
  
  const { currentUser } = useContext(AuthContext);
  
  // Save tickets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tickets', JSON.stringify(tickets));
  }, [tickets]);
  
  // Generate a new unique ticket ID
  const generateTicketId = () => {
    const lastTicket = tickets[tickets.length - 1];
    const lastId = lastTicket ? parseInt(lastTicket.id.split('-')[1]) : 1000;
    return `TKT-${lastId + 1}`;
  };
  
  // Create a new ticket
  const createTicket = (ticketData) => {
    const newTicket = {
      id: generateTicketId(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      responses: [],
      ...ticketData
    };
    
    setTickets([...tickets, newTicket]);
    return newTicket;
  };
  
  // Update an existing ticket
  const updateTicket = (ticketId, updatedData) => {
    setTickets(tickets.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, ...updatedData } 
        : ticket
    ));
  };
  
  // Add a response to a ticket
  const addResponseToTicket = (ticketId, response) => {
    setTickets(tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          responses: [...(ticket.responses || []), response]
        };
      }
      return ticket;
    }));
  };
  
  // Assign a ticket to a staff member
  const assignTicket = (ticketId, staffId) => {
    updateTicket(ticketId, { assignedTo: staffId });
  };
  
  // Get tickets for the current user based on their role
  const getUserTickets = () => {
    if (!currentUser) return [];
    
    // Admins can see all tickets
    if (currentUser.role === 'admin') {
      return tickets;
    }
    
    // Staff can see tickets assigned to them and unassigned tickets
    if (currentUser.role === 'employee') {
      return tickets.filter(ticket => 
        ticket.assignedTo === currentUser.id || ticket.assignedTo === null
      );
    }
    
    // Customers can only see their own tickets
    return tickets.filter(ticket => ticket.userId === currentUser.id);
  };
  
  // Cancel a ticket (change status to cancelled)
  const cancelTicket = (ticketId) => {
    updateTicket(ticketId, { status: 'cancelled' });
  };

  return (
    <TicketContext.Provider
      value={{
        tickets,
        getUserTickets,
        createTicket,
        updateTicket,
        addResponseToTicket,
        assignTicket,
        cancelTicket
      }}
    >
      {children}
    </TicketContext.Provider>
  );
};

export default TicketProvider;