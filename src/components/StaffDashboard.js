import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TicketContext } from '../context/TicketContext';
import { AuthContext } from '../context/AuthContext';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const { tickets, updateTicket } = useContext(TicketContext);
  const { currentUser } = useContext(AuthContext);
  
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get tickets assigned to this staff member or unassigned tickets
  useEffect(() => {
    let staffTickets = [];
    
    if (currentUser.role === 'admin') {
      // Admins can see all tickets
      staffTickets = [...tickets];
    } else {
      // Staff can see tickets assigned to them and unassigned pending tickets
      staffTickets = tickets.filter(ticket => 
        ticket.assignedTo === currentUser.id || 
        (ticket.assignedTo === null && ticket.status === 'pending')
      );
    }
    
    // Apply filters
    let filtered = [...staffTickets];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filterStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(ticket => 
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    setFilteredTickets(filtered);
  }, [tickets, currentUser, filterStatus, searchTerm]);
  
  const handleStatusChange = (ticketId, newStatus) => {
    updateTicket(ticketId, { status: newStatus });
  };
  
  const handleAssignToMe = (ticketId) => {
    updateTicket(ticketId, { 
      assignedTo: currentUser.id,
      status: 'in_progress' 
    });
  };
  
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
    <div className="staff-dashboard">
      <h2>Staff Ticket Dashboard</h2>
      
      <div className="dashboard-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search tickets by ID, title, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="status-filter">
          <label htmlFor="status-filter">Status:</label>
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
      </div>
      
      {filteredTickets.length === 0 ? (
        <div className="no-tickets">
          <p>No tickets found. {searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters.' : ''}</p>
        </div>
      ) : (
        <div className="tickets-table-container">
          <table className="tickets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Created</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className={ticket.status}>
                  <td>{ticket.id}</td>
                  <td>{ticket.title}</td>
                  <td>{ticket.category || 'General'}</td>
                  <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select 
                      value={ticket.status}
                      onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                      className={`status-select ${ticket.status}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    {ticket.assignedTo ? 
                      (ticket.assignedTo === currentUser.id ? 'You' : 'Another Staff') : 
                      'Unassigned'}
                  </td>
                  <td className="action-buttons">
                    <Link to={`/staff/ticket/${ticket.id}`} className="btn-small">View</Link>

                    {!ticket.assignedTo && (
                      <button 
                        className="btn-small btn-primary"
                        onClick={() => handleAssignToMe(ticket.id)}
                      >
                        Assign to Me
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="staff-summary">
        <h3>Your Summary</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Assigned to You:</span>
            <span className="stat-value">
              {tickets.filter(t => t.assignedTo === currentUser.id).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">In Progress:</span>
            <span className="stat-value">
              {tickets.filter(t => t.assignedTo === currentUser.id && t.status === 'in_progress').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Resolved:</span>
            <span className="stat-value">
              {tickets.filter(t => t.assignedTo === currentUser.id && t.status === 'resolved').length}
            </span>
          </div>
        </div>
      </div>
    </div>
  ); 
};
export default StaffDashboard;