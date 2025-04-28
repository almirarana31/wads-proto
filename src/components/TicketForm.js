import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { TicketContext } from '../context/TicketContext';
import './TicketForm.css';

const TicketForm = () => {
  const { currentUser } = useContext(AuthContext);
  const { addTicket } = useContext(TicketContext);
  const navigate = useNavigate();
  
  // Initial form data - pre-fill with user info if available
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    email: currentUser ? currentUser.email : '',
    phone: '',
    name: currentUser ? currentUser.name : '',
  });
  
  const [errors, setErrors] = useState({});
  
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
    if (!formData.category) newErrors.category = 'Category is required';
    
    // Contact information validation - require either email OR phone
    if (!formData.email && !formData.phone) {
      newErrors.email = 'Either email or phone number is required';
      newErrors.phone = 'Either email or phone number is required';
    }
    
    // If user is not logged in, require name
    if (!currentUser && !formData.name.trim()) {
      newErrors.name = 'Name is required for guest submissions';
    }
    
    // Email format validation if provided
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone format validation if provided (simple check)
    if (formData.phone && !/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create ticket object
      const newTicket = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: 'pending',
        createdAt: new Date().toISOString(),
        contactEmail: formData.email,
        contactPhone: formData.phone,
        submittedBy: currentUser ? currentUser.id : 'guest',
        submitterName: currentUser ? currentUser.name : formData.name,
        isGuestSubmission: !currentUser
      };
      
      // Add ticket to context
      addTicket(newTicket);
      
      // Navigate to confirmation page
      navigate('/ticket-confirmation', { 
        state: { 
          ticket: newTicket,
          isGuest: !currentUser
        } 
      });
    }
  };
  
  return (
    <div className="ticket-form-container">
      <h2>Submit a New Support Ticket</h2>
      
      <form onSubmit={handleSubmit} className="ticket-form">
        {/* Show name field only for guests */}
        {!currentUser && (
          <div className="form-group">
            <label htmlFor="name">Your Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
        )}
        
        <div className="form-group">
          <label htmlFor="email">Email Address:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={errors.phone ? 'error' : ''}
            placeholder="e.g., 1234567890"
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
          {!errors.phone && !errors.email && (
            <span className="helper-text">At least one contact method required</span>
          )}
        </div>
        
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
            className={errors.category ? 'error' : ''}
            required
          >
            <option value="">-- Select Category --</option>
            <option value="technical">Technical Issue</option>
            <option value="billing">Billing Question</option>
            <option value="appointment">Appointment</option>
            <option value="general">General Inquiry</option>
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="priority">Priority:</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
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
        
        <button type="submit" className="btn btn-primary">Submit Ticket</button>
      </form>
    </div>
  );
};

export default TicketForm;