import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TicketContext } from '../context/TicketContext';
import { AuthContext } from '../context/AuthContext';
import './ViewTickets.css';

const ViewTickets = () => {
  const { getUserTickets } = useContext(TicketContext);
  const { currentUser } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get user's tickets
  useEffect(() => {
    const userTickets = getUserTickets();
    setTickets(userTickets);
  }, [getUserTickets]);
  
  // Filter tickets based on status and search term
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  // Sort tickets by creation date (newest first)
  const sortedTickets = [...filteredTickets].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_progress': return 'In Progress';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };
  
  return (
    <div className="view-tickets-container">
      <h2>Your Support Tickets</h2>
      
      <div className="ticket-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="status-filter">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Tickets</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <Link to="/submit-ticket" className="btn btn-primary">
          Create New Ticket
        </Link>
      </div>
      
      {sortedTickets.length === 0 ? (
        <div className="no-tickets">
          <p>No tickets found. {searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters.' : ''}</p>
          {tickets.length === 0 && (
            <p>
              Need help? <Link to="/submit-ticket">Submit a new ticket</Link> to get assistance.
            </p>
          )}
        </div>
      ) : (
        <div className="tickets-list">
          {sortedTickets.map(ticket => (
            <div key={ticket.id} className={`ticket-card ${ticket.status}`}>
              <div className="ticket-header">
                <h3>{ticket.title}</h3>
                <span className={`status-badge ${ticket.status}`}>
                  {getStatusLabel(ticket.status)}
                </span>
              </div>
              
              <div className="ticket-info">
                <p className="ticket-id">Ticket ID: {ticket.id}</p>
                <p className="ticket-date">
                  Created: {new Date(ticket.createdAt).toLocaleDateString()}
                </p>
                {ticket.category && (
                  <p className="ticket-category">
                    Category: {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                  </p>
                )}
              </div>
              
              <div className="ticket-preview">
                <p>
                  {ticket.description.length > 150
                    ? `${ticket.description.substring(0, 150)}...`
                    : ticket.description}
                </p>
              </div>
              
              <div className="ticket-responses">
                <p>
                  {ticket.responses && ticket.responses.length > 0
                    ? `${ticket.responses.length} response${ticket.responses.length !== 1 ? 's' : ''}`
                    : 'No responses yet'}
                </p>
              </div>
              
              <div className="ticket-actions">
                <Link to={`/ticket/${ticket.id}`} className="btn btn-primary">
                  View Details
                </Link>
                
                {ticket.status === 'pending' && (
                  <Link to={`/edit-ticket/${ticket.id}`} className="btn btn-outline">
                    Edit
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewTickets;