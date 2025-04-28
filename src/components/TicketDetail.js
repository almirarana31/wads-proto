import React, { useContext, useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { TicketContext } from '../context/TicketContext';
import { AuthContext } from '../context/AuthContext';
import './TicketDetail.css';

const TicketDetail = () => {
  const { ticketId } = useParams();
  const { tickets, updateTicket, addResponseToTicket } = useContext(TicketContext);
  const { currentUser } = useContext(AuthContext);
  const [newResponse, setNewResponse] = useState('');
  const [ticket, setTicket] = useState(null);
  
  useEffect(() => {
    // Find the ticket with the matching ID
    const foundTicket = tickets.find(t => t.id === ticketId);
    setTicket(foundTicket);
  }, [ticketId, tickets]);

  // If ticket doesn't exist, redirect to tickets list
  if (!ticket) {
    return <Navigate to="/view-tickets" />;
  }

  // Check if user has permission to view this ticket
  const hasPermission = 
    currentUser && (
      currentUser.role === 'admin' || 
      currentUser.role === 'employee' ||
      (currentUser.role === 'customer' && ticket.userId === currentUser.id)
    );
    
  if (!hasPermission) {
    return <Navigate to="/unauthorized" />;
  }
  
  const handleSubmitResponse = (e) => {
    e.preventDefault();
    if (newResponse.trim() === '') return;
    
    // Add the response to the ticket
    const response = {
      id: Date.now().toString(),
      text: newResponse,
      sender: currentUser.name,
      senderRole: currentUser.role,
      timestamp: new Date().toISOString()
    };
    
    addResponseToTicket(ticket.id, response);
    setNewResponse('');
  };
  
  const handleStatusChange = (newStatus) => {
    updateTicket(ticket.id, { status: newStatus });
  };

  const canEdit = ticket.status === 'pending';
  const canCancel = ticket.status !== 'cancelled' && ticket.status !== 'closed';
  
  return (
    <div className="ticket-detail">
      <div className="ticket-header">
        <h2>Ticket: {ticket.title}</h2>
        <div className="ticket-meta">
          <span className={`status ${ticket.status}`}>{ticket.status}</span>
          <span className="ticket-id">ID: {ticket.id}</span>
          <span className="created-at">Created: {new Date(ticket.createdAt).toLocaleString()}</span>
        </div>
      </div>
      
      <div className="ticket-content">
        <div className="ticket-description">
          <h3>Description</h3>
          <p>{ticket.description}</p>
        </div>
        
        <div className="ticket-actions">
          {canEdit && currentUser && (currentUser.id === ticket.userId) && (
            <button className="btn">Edit Ticket</button>
          )}
          {canCancel && currentUser && (currentUser.id === ticket.userId || currentUser.role === 'admin') && (
            <button 
              className="btn btn-danger"
              onClick={() => handleStatusChange('cancelled')}
            >
              Cancel Ticket
            </button>
          )}
          {currentUser && currentUser.role === 'admin' && (
            <div className="admin-actions">
              <select 
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`status-select ${ticket.status}`}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button className="btn">Assign Staff</button>
            </div>
          )}
        </div>
      </div>
      
      <div className="conversation">
        <h3>Conversation</h3>
        
        <div className="messages">
          {/* Initial ticket submission */}
          <div className="message">
            <div className="message-header">
              <span className="sender">{ticket.userName}</span>
              <span className="timestamp">{new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            <div className="message-body">
              <p>{ticket.description}</p>
            </div>
          </div>
          
          {/* Responses */}
          {ticket.responses && ticket.responses.map(response => (
            <div 
              key={response.id} 
              className={`message ${response.senderRole === 'admin' || response.senderRole === 'employee' ? 'staff' : 'customer'}`}
            >
              <div className="message-header">
                <span className="sender">{response.sender}</span>
                <span className="sender-role">{response.senderRole}</span>
                <span className="timestamp">{new Date(response.timestamp).toLocaleString()}</span>
              </div>
              <div className="message-body">
                <p>{response.text}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* New response form */}
        {ticket.status !== 'closed' && ticket.status !== 'cancelled' && (
          <form className="response-form" onSubmit={handleSubmitResponse}>
            <textarea
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              placeholder="Type your response..."
              rows="4"
              required
            />
            <button type="submit" className="btn btn-primary">
              Send Response
            </button>
          </form>
        )}
        
        {(ticket.status === 'closed' || ticket.status === 'cancelled') && (
          <div className="ticket-closed-message">
            This ticket is {ticket.status}. No further responses can be added.
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketDetail;