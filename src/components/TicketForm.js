import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketContext } from '../context/TicketContext';
import { AuthContext } from '../context/AuthContext';
import './TicketForm.css';

const TicketForm = () => {
  const { addTicket } = useContext(TicketContext);
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: currentUser ? currentUser.name : '',
    email: currentUser ? currentUser.email : '',
    category: '',
    description: '',
    attachment: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, attachment: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addTicket({
      title: `${formData.category} Issue`,
      description: formData.description,
      category: formData.category,
      name: formData.name,
      email: formData.email
      // In a real app, handle file upload separately
    });
    navigate('/view-tickets');
  };

  return (
    <div className="ticket-form-container">
      <h2>Submit a Ticket</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category:</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option value="Scheduling">Scheduling</option>
            <option value="Billing">Billing</option>
            <option value="Treatment">Treatment</option>
            <option value="Website">Website</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="6"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="attachment">Attach File (optional):</label>
          <input
            type="file"
            id="attachment"
            name="attachment"
            onChange={handleFileChange}
          />
        </div>
        
        <button type="submit" className="btn btn-primary">Submit Ticket</button>
      </form>
    </div>
  );
};

export default TicketForm;