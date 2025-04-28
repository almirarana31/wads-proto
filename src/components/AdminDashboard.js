import React, { useContext, useState, useEffect } from 'react';
import { TicketContext } from '../context/TicketContext';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { tickets, updateTicket, assignTicket } = useContext(TicketContext);
  const { currentUser, users } = useContext(AuthContext);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    cancelled: 0
  });

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTickets, setFilteredTickets] = useState([]);

  // ✅ Move this useEffect ABOVE the conditional return
  useEffect(() => {
    setStats({
      total: tickets.length,
      pending: tickets.filter(t => t.status === 'pending').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length,
      cancelled: tickets.filter(t => t.status === 'cancelled').length
    });

    let filtered = [...tickets];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t =>
        t.category === filterCategory || (!t.category && filterCategory === 'uncategorized')
      );
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(t => t.priority === filterPriority);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.id.toLowerCase().includes(term) ||
        t.title.toLowerCase().includes(term) ||
        t.description.toLowerCase().includes(term) ||
        (t.userName && t.userName.toLowerCase().includes(term))
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredTickets(filtered);
  }, [tickets, filterStatus, filterCategory, filterPriority, searchTerm]);

  // ✅ Early return now safely placed AFTER hook
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  const handleStatusChange = (id, newStatus) => {
    updateTicket(id, { status: newStatus });
  };

  const handlePriorityChange = (id, newPriority) => {
    updateTicket(id, { priority: newPriority });
  };

  const handleCategoryChange = (id, newCategory) => {
    updateTicket(id, { category: newCategory });
  };

  const openAssignModal = (ticketId) => {
    setSelectedTicketId(ticketId);
    setAssignModalOpen(true);
  };

  const closeAssignModal = () => {
    setAssignModalOpen(false);
    setSelectedTicketId(null);
    setSelectedStaffId('');
  };

  const handleAssignTicket = () => {
    if (selectedTicketId && selectedStaffId) {
      assignTicket(selectedTicketId, selectedStaffId);
      const ticket = tickets.find(t => t.id === selectedTicketId);
      if (ticket && ticket.status === 'pending') {
        updateTicket(selectedTicketId, { status: 'in_progress' });
      }
      closeAssignModal();
    }
  };

  const getStaffName = (staffId) => {
    const staffMember = users.find(u => u.id === staffId);
    return staffMember ? staffMember.name : 'Unknown';
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      {/* Ticket Stats */}
      <div className="stats-container">
        {Object.entries(stats).map(([key, value]) => (
          <div className={`stat-box ${key}`} key={key}>
            <h3>{key.replace(/([A-Z])/g, ' $1')}</h3>
            <p className="stat-number">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="ticket-management">
        <h3>Ticket Management</h3>
        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="billing">Billing</option>
            <option value="technical">Technical</option>
            <option value="treatment">Treatment</option>
            <option value="appointment">Appointment</option>
            <option value="uncategorized">Uncategorized</option>
          </select>

          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Ticket Table */}
        <table className="ticket-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Customer</th>
              <th>Contact</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Created</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map(ticket => (
              <tr key={ticket.id} className={ticket.status}>
                <td>{ticket.id}</td>
                <td>{ticket.title}</td>
                <td>{ticket.userName || 'Guest'}</td>
                <td>
                  {ticket.email && <p>Email: {ticket.email}</p>}
                  {ticket.phone && <p>Phone: {ticket.phone}</p>}
                </td>
                <td>
                  <select value={ticket.category || 'general'}
                    onChange={(e) => handleCategoryChange(ticket.id, e.target.value)}>
                    <option value="general">General</option>
                    <option value="billing">Billing</option>
                    <option value="technical">Technical</option>
                    <option value="treatment">Treatment</option>
                    <option value="appointment">Appointment</option>
                  </select>
                </td>
                <td>
                  <select value={ticket.priority || 'medium'}
                    onChange={(e) => handlePriorityChange(ticket.id, e.target.value)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </td>
                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td>
                  <select value={ticket.status}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td>{ticket.assignedTo ? getStaffName(ticket.assignedTo) : 'Unassigned'}</td>
                <td>
                  <Link to={`/staff/ticket/${ticket.id}`} className="btn-small">View</Link>
                  <button onClick={() => openAssignModal(ticket.id)} className="btn-small">Assign</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredTickets.length === 0 && (
          <p className="no-tickets">No tickets match your filters.</p>
        )}
      </div>

      {/* Staff Performance Summary */}
      <div className="performance-summary">
        <h3>Staff Performance</h3>
        <div className="staff-stats-container">
          {users
            .filter(u => u.role === 'employee' || u.role === 'admin')
            .map(user => {
              const assigned = tickets.filter(t => t.assignedTo === user.id);
              const resolved = assigned.filter(t => ['resolved', 'closed'].includes(t.status));
              const rate = assigned.length ? Math.round((resolved.length / assigned.length) * 100) : 0;

              return (
                <div key={user.id} className="staff-stat-card">
                  <h4>{user.name}</h4>
                  <p>Assigned: {assigned.length}</p>
                  <p>Resolved: {resolved.length}</p>
                  <p>Resolution Rate: {rate}%</p>
                </div>
              );
            })}
        </div>
      </div>

      {/* Assignment Modal */}
      {assignModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Assign Ticket</h3>
            <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)}>
              <option value="">-- Select Staff --</option>
              {users
                .filter(u => u.role === 'employee' || u.role === 'admin')
                .map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.role})
                  </option>
                ))}
            </select>
            <div className="modal-actions">
              <button onClick={handleAssignTicket} className="btn btn-primary" disabled={!selectedStaffId}>Assign</button>
              <button onClick={closeAssignModal} className="btn btn-outline">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
