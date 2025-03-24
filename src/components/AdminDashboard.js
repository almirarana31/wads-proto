import React, { useContext, useState, useEffect } from 'react';
import { TicketContext } from '../context/TicketContext';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { tickets, updateTicket } = useContext(TicketContext);
  const { currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });
  useEffect(() => {
    setStats({
      total: tickets.length,
      pending: tickets.filter(t => t.status === 'pending').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    });
  }, [tickets]);
  
  // Move early return below hooks
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  const handleStatusChange = (id, newStatus) => {
    updateTicket(id, { status: newStatus });
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div className="stats-container">
        <div className="stat-box">
          <h3>Total Tickets</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-box pending">
          <h3>Pending</h3>
          <p className="stat-number">{stats.pending}</p>
        </div>
        <div className="stat-box in-progress">
          <h3>In Progress</h3>
          <p className="stat-number">{stats.inProgress}</p>
        </div>
        <div className="stat-box resolved">
          <h3>Resolved</h3>
          <p className="stat-number">{stats.resolved}</p>
        </div>
        <div className="stat-box closed">
          <h3>Closed</h3>
          <p className="stat-number">{stats.closed}</p>
        </div>
      </div>
      
      <div className="ticket-management">
        <h3>Ticket Management</h3>
        <table className="ticket-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map(ticket => (
              <tr key={ticket.id}>
                <td>{ticket.id}</td>
                <td>{ticket.title}</td>
                <td>{ticket.category}</td>
                <td>{ticket.createdAt}</td>
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
                  </select>
                </td>
                <td>
                  <button className="btn-small">View</button>
                  <button className="btn-small">Assign</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;