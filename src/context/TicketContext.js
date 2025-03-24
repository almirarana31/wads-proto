import React, { createContext, useState, useEffect } from 'react';

export const TicketContext = createContext();

export const TicketProvider = ({ children }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch tickets from API
    const mockTickets = [
      {
        id: 1,
        title: 'Scheduling Issue',
        description: 'My appointment was canceled without notice.',
        category: 'Scheduling',
        status: 'pending',
        createdAt: '2025-03-15',
        updatedAt: '2025-03-15'
      },
      {
        id: 2,
        title: 'Payment Issue',
        description: 'I was charged twice for my treatment.',
        category: 'Billing',
        status: 'in_progress',
        createdAt: '2025-03-16',
        updatedAt: '2025-03-16'
      }
    ];
    setTickets(mockTickets);
    setLoading(false);
  }, []);

  const addTicket = (ticket) => {
    const newTicket = {
      ...ticket,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setTickets([...tickets, newTicket]);
  };

  const updateTicket = (id, updatedTicket) => {
    setTickets(tickets.map(ticket => 
      ticket.id === id ? { ...ticket, ...updatedTicket, updatedAt: new Date().toISOString().split('T')[0] } : ticket
    ));
  };

  const deleteTicket = (id) => {
    setTickets(tickets.filter(ticket => ticket.id !== id));
  };

  return (
    <TicketContext.Provider value={{ tickets, loading, addTicket, updateTicket, deleteTicket }}>
      {children}
    </TicketContext.Provider>
  );
};