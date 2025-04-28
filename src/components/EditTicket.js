import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { TicketContext } from '../context/TicketContext';
import { AuthContext } from '../context/AuthContext';
import './EditTicket.css';

const EditTicket = () => {
  const { ticketId } = useParams();
  const { tickets, updateTicket } = useContext(TicketContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  
  useEffect(() => {
    // Find the ticket with the matching ID
    const foundTicket = tickets.find(t => t.id === ticketId);
    setTicket(foundTicket);
    
    if (foundTicket) {
      setFormData({
        title: foundTicket.title,
        description: foundTicket.description,
        category: foundTicket.category || 'general',
      });
    }
    
    setIsLoading(false);
  }, [ticketId, tickets]);
  
  // Show loading indicator while fetching ticket
  if (isLoading) {
    return <div className="loading">Loading ticket information...</div>;
  }
  
  // If ticket doesn't exist, redirect to tickets list
  if (!ticket) {
    return <Navigate to="/view-tickets" />;
  }
  
  // Check if ticket is in 'pending' status
  if (ticket.status !== 'pending') {
    return (
      <div className="edit-ticket-container">
        <div className="edit-ticket-card">
          <h2>Cannot Edit Ticket</h2>
          <p className="error-message">
            Sorry, you can only edit tickets that are in 'Pending' status.
            This ticket is currently marked as '{ticket.status}'.
          </p>
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/ticket/${ticketId}`)}
              className="btn btn-primary"
            >
              Return to Ticket
            </button>
            <button
              type="button"
              onClick={() => navigate('/view-tickets')}
              className="btn btn-outline"
            >
              View All Tickets
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Check if user has permission to edit this ticket
  const hasPermission = 
    currentUser && (
      currentUser.role === 'admin' || 
      (currentUser.role === 'customer' && ticket.userId === currentUser.id)
    );
    
  if (!hasPermission) {
    return <Navigate to="/unauthorized" />;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Update ticket with new information
      updateTicket(ticket.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        updatedAt: new Date().toISOString()
      });
      
      // Navigate back to ticket detail
      navigate(`/ticket/${ticket.id}`);
    }
  };
  
  return (
    <div className="edit-ticket-container">
      <div className="edit-ticket-card">
        <h2>Edit Ticket</h2>
        
        <form onSubmit={handleSubmit} className="edit-ticket-form">
          <div className="form-group">
            <label htmlFor="title">Ticket Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'error' : ''}
              required
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="general">General Inquiry</option>
              <option value="technical">Technical Issue</option>
              <option value="billing">Billing Question</option>
              <option value="appointment">Appointment</option>
              <option value="treatment">Treatment</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'error' : ''}
              rows="6"
              required
            ></textarea>
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save Changes</button>
            <button 
              type="button" 
              onClick={() => navigate(`/ticket/${ticketId}`)} 
              className="btn btn-outline"
            >
              Cancel
            </button>
          </div>
        </form>
        
        <div className="edit-note">
          <p>Note: You can only edit tickets that are in 'Pending' status.</p>
        </div>
      </div>
    </div>
  );
};

export default EditTicket;