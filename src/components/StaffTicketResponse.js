import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { TicketContext } from '../context/TicketContext';
import { AuthContext } from '../context/AuthContext';
import './StaffTicketResponse.css';

const StaffTicketResponse = () => {
  const { ticketId } = useParams();
  const { tickets, updateTicket, addResponseToTicket } = useContext(TicketContext);
  const { currentUser, users } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newResponse, setNewResponse] = useState('');
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  
  // Find the ticket and set it
  useEffect(() => {
    const foundTicket = tickets.find(t => t.id === ticketId);
    setTicket(foundTicket);
    setLoading(false);
  }, [ticketId, tickets]);
  
  // Check authorization first
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'employee')) {
    return <Navigate to="/unauthorized" />;
  }
  
  if (loading) {
    return <div className="loading">Loading ticket information...</div>;
  }
  
  // If ticket not found
  if (!ticket) {
    return (
      <div className="not-found-container">
        <h2>Ticket Not Found</h2>
        <p>The ticket you are looking for does not exist or has been removed.</p>
        <button onClick={() => navigate('/manage-tickets')} className="btn btn-primary">
          Return to Tickets
        </button>
      </div>
    );
  }
  
  // Check if staff has access to this ticket (assigned to them or is admin)
  const hasAccess = 
    currentUser.role === 'admin' || 
    ticket.assignedTo === currentUser.id || 
    (currentUser.role === 'employee' && !ticket.assignedTo);
    
  if (!hasAccess) {
    return (
      <div className="not-authorized-container">
        <h2>Not Authorized</h2>
        <p>You don't have permission to view this ticket as it's assigned to another staff member.</p>
        <button onClick={() => navigate('/manage-tickets')} className="btn btn-primary">
          Return to Tickets
        </button>
      </div>
    );
  }
  
  const handleSendResponse = (e) => {
    e.preventDefault();
    
    if (newResponse.trim() === '') return;
    
    // Create the response
    const response = {
      id: `resp-${Date.now()}`,
      text: newResponse,
      sender: currentUser.name,
      senderRole: currentUser.role,
      timestamp: new Date().toISOString()
    };
    
    // Add response to ticket
    addResponseToTicket(ticket.id, response);
    
    // If ticket was in pending status, update to in_progress
    if (ticket.status === 'pending') {
      updateTicket(ticket.id, { 
        status: 'in_progress',
        assignedTo: currentUser.id // Auto-assign to the responding staff if not already assigned
      });
    }
    
    // Clear response field
    setNewResponse('');
  };
  
  const handleAssignToMe = () => {
    updateTicket(ticket.id, { 
      assignedTo: currentUser.id,
      status: ticket.status === 'pending' ? 'in_progress' : ticket.status
    });
  };
  
  const openStatusConfirm = (status) => {
    setNewStatus(status);
    setShowStatusConfirm(true);
  };
  
  const confirmStatusChange = () => {
    updateTicket(ticket.id, { status: newStatus });
    setShowStatusConfirm(false);
    
    // If resolving or closing, add an automatic system response
    if (newStatus === 'resolved' || newStatus === 'closed') {
      const systemMessage = {
        id: `sys-${Date.now()}`,
        text: `Ticket marked as ${newStatus} by ${currentUser.name}.`,
        sender: 'System',
        senderRole: 'system',
        timestamp: new Date().toISOString()
      };
      
      addResponseToTicket(ticket.id, systemMessage);
    }
  };
  
  const cancelStatusChange = () => {
    setShowStatusConfirm(false);
    setNewStatus('');
  };
  
  // Get assigned staff name if any
  const getAssignedStaffName = () => {
    if (!ticket.assignedTo) return 'Unassigned';
    
    const staff = users.find(u => u.id === ticket.assignedTo);
    return staff ? staff.name : 'Unknown Staff';
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <div className="staff-ticket-container">
      <div className="ticket-header">
        <div className="ticket-title-section">
          <h2>{ticket.title}</h2>
          <span className={`status-badge ${ticket.status}`}>
            {ticket.status === 'in_progress' ? 'In Progress' : 
             ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </span>
        </div>
        
        <div className="ticket-meta">
          <div className="meta-item">
            <span className="meta-label">Ticket ID:</span>
            <span className="meta-value">{ticket.id}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Created:</span>
            <span className="meta-value">{formatDate(ticket.createdAt)}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Category:</span>
            <span className="meta-value">{ticket.category || 'General'}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Priority:</span>
            <span className={`meta-value priority ${ticket.priority || 'medium'}`}>
              {ticket.priority ? ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1) : 'Medium'}
            </span>
          </div>
        </div>
      </div>
      
      <div className="customer-info">
        <h3>Customer Information</h3>
        <div className="customer-details">
          <div className="detail-item">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{ticket.userName || 'Guest'}</span>
          </div>
          
          {ticket.userId !== 'guest' ? (
            <div className="detail-item">
              <span className="detail-label">Account:</span>
              <span className="detail-value">Registered User</span>
            </div>
          ) : (
            <div className="detail-item">
              <span className="detail-label">Account:</span>
              <span className="detail-value">Guest</span>
            </div>
          )}
          
          {ticket.contactEmail && (
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{ticket.contactEmail}</span>
            </div>
          )}
          
          {ticket.contactPhone && (
            <div className="detail-item">
              <span className="detail-label">Phone:</span>
              <span className="detail-value">{ticket.contactPhone}</span>
            </div>
          )}
          
          <div className="detail-item">
            <span className="detail-label">Assigned To:</span>
            <span className="detail-value">
              {ticket.assignedTo === currentUser.id ? 
                'You' : getAssignedStaffName()}
            </span>
          </div>
        </div>
        
        {!ticket.assignedTo && (
          <button 
            className="btn btn-primary"
            onClick={handleAssignToMe}
          >
            Assign to Me
          </button>
        )}
      </div>
      
      <div className="ticket-content">
        <h3>Original Request</h3>
        <div className="original-message">
          <p>{ticket.description}</p>
        </div>
      </div>
      
      <div className="conversation-section">
        <h3>Conversation History</h3>
        
        <div className="conversation-thread">
          {ticket.responses && ticket.responses.length > 0 ? (
            ticket.responses.map(response => (
              <div 
                key={response.id} 
                className={`message ${
                  response.senderRole === 'admin' || response.senderRole === 'employee' 
                    ? 'staff-message' 
                    : response.senderRole === 'system' 
                      ? 'system-message' 
                      : 'customer-message'
                }`}
              >
                <div className="message-header">
                  <div className="message-sender">
                    <span className="sender-name">{response.sender}</span>
                    <span className="sender-role">
                      {response.senderRole === 'admin' ? 'Administrator' : 
                       response.senderRole === 'employee' ? 'Staff' :
                       response.senderRole === 'system' ? 'System' : 'Customer'}
                    </span>
                  </div>
                  <span className="message-time">{formatDate(response.timestamp)}</span>
                </div>
                <div className="message-text">
                  <p>{response.text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="no-responses">
              <p>No responses yet. Be the first to respond to this ticket.</p>
            </div>
          )}
        </div>
        
        {ticket.status !== 'closed' && ticket.status !== 'cancelled' && (
          <div className="response-section">
            <h3>Your Response</h3>
            <form onSubmit={handleSendResponse}>
              <textarea
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                placeholder="Type your response here..."
                rows="4"
                required
              />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Send Response
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="ticket-actions">
          <h3>Ticket Actions</h3>
          <div className="action-buttons">
            {ticket.status === 'pending' && (
              <button 
                className="btn btn-primary"
                onClick={() => openStatusConfirm('in_progress')}
              >
                Mark In Progress
              </button>
            )}
            
            {(ticket.status === 'pending' || ticket.status === 'in_progress') && (
              <button 
                className="btn btn-success"
                onClick={() => openStatusConfirm('resolved')}
              >
                Mark Resolved
              </button>
            )}
            
            {ticket.status === 'resolved' && (
              <button 
                className="btn btn-secondary"
                onClick={() => openStatusConfirm('closed')}
              >
                Close Ticket
              </button>
            )}
            
            {(ticket.status !== 'cancelled' && ticket.status !== 'closed') && (
              <button 
                className="btn btn-danger"
                onClick={() => openStatusConfirm('cancelled')}
              >
                Cancel Ticket
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Status Change Confirmation Modal */}
      {showStatusConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Status Change</h3>
            <p>
              Are you sure you want to change this ticket's status to 
              <strong> {newStatus === 'in_progress' ? 'In Progress' : 
                newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
              </strong>?
              
              {(newStatus === 'resolved' || newStatus === 'closed') && (
                <span className="status-note">
                  This will mark the ticket as complete and notify the customer.
                </span>
              )}
              
              {newStatus === 'cancelled' && (
                <span className="status-note">
                  This will cancel the ticket and no further responses will be possible.
                </span>
              )}
            </p>
            
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={confirmStatusChange}
              >
                Confirm
              </button>
              <button 
                className="btn btn-outline"
                onClick={cancelStatusChange}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTicketResponse;