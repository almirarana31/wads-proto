import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TicketContext } from '../context/TicketContext';
import { AuthContext } from '../context/AuthContext';
import './SubmitTicket.css';

const SubmitTicket = () => {
  const { currentUser } = useContext(AuthContext);
  const { createTicket } = useContext(TicketContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Initialize form with user data if logged in
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general',
    // Pre-fill contact info if user is logged in
    contactName: currentUser ? currentUser.name : '',
    contactEmail: currentUser ? currentUser.email : '',
    contactPhone: currentUser ? currentUser.phone || '' : '',
    preferredContact: 'email'
  });
  
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    // Validate file size (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const invalidFiles = selectedFiles.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      setFileError('One or more files exceed the 5MB size limit');
      return;
    }
    
    // Validate total number of files (max 5)
    if (files.length + selectedFiles.length > 5) {
      setFileError('Maximum of 5 files allowed');
      return;
    }
    
    setFileError('');
    setFiles([...files, ...selectedFiles]);
  };
  
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    setFileError('');
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    // Contact information validation - require either email OR phone for guests
    if (!currentUser && !formData.contactEmail && !formData.contactPhone) {
      newErrors.contactEmail = 'Either email or phone number is required';
      newErrors.contactPhone = 'Either email or phone number is required';
    }
    
    // Name is required for guests
    if (!currentUser && !formData.contactName.trim()) {
      newErrors.contactName = 'Name is required for guest submissions';
    }
    
    // Email format validation if provided
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    
    // Phone format validation if provided (simple check)
    if (formData.contactPhone && !/^\d{10,}$/.test(formData.contactPhone.replace(/\D/g, ''))) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !fileError;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Create ticket object
      const ticketData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: 'medium', // Default priority, admin can change later
        // If logged in, use user ID and name, otherwise use guest and provided name
        userId: currentUser ? currentUser.id : 'guest',
        userName: currentUser ? currentUser.name : formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        attachments: files.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          // In a real implementation, files would be uploaded to storage
          // and their URLs or IDs would be stored here
          url: URL.createObjectURL(file) // For demo purposes only
        }))
      };
      
      // Create the ticket
      const newTicket = createTicket(ticketData);
      
      // Navigate to confirmation page with ticket details
      navigate('/ticket-confirmation', { 
        state: { 
          ticket: newTicket,
          isGuest: !currentUser
        } 
      });
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  return (
    <div className="submit-ticket-container">
      <div className="submit-ticket-card">
        <h2>Submit a Support Ticket</h2>
        
        <form onSubmit={handleSubmit} className="ticket-form">
          {/* Show name field only for guests */}
          {!currentUser && (
            <div className="form-group">
              <label htmlFor="contactName">Your Name:</label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className={errors.contactName ? 'error' : ''}
              />
              {errors.contactName && <span className="error-message">{errors.contactName}</span>}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="contactEmail">Email Address:</label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              className={errors.contactEmail ? 'error' : ''}
            />
            {errors.contactEmail && <span className="error-message">{errors.contactEmail}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="contactPhone">Phone Number:</label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              className={errors.contactPhone ? 'error' : ''}
              placeholder="e.g., 1234567890"
            />
            {errors.contactPhone && <span className="error-message">{errors.contactPhone}</span>}
            {!currentUser && !errors.contactPhone && !errors.contactEmail && (
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
          
          {/* File Attachment Section */}
          <div className="form-group">
            <label>Attachments:</label>
            <div className="file-upload-area">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                multiple
              />
              <button 
                type="button" 
                onClick={triggerFileInput} 
                className="btn btn-outline"
                disabled={files.length >= 5}
              >
                Select Files
              </button>
              <span className="helper-text">Maximum 5 files, 5MB each (images, PDFs, documents)</span>
              {fileError && <span className="error-message">{fileError}</span>}
            </div>
            
            {files.length > 0 && (
              <div className="selected-files">
                <h4>Selected Files:</h4>
                <ul className="file-list">
                  {files.map((file, index) => (
                    <li key={index} className="file-item">
                      <div className="file-info">
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label>Preferred Contact Method:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="preferredContact"
                  value="email"
                  checked={formData.preferredContact === 'email'}
                  onChange={handleChange}
                />
                Email
              </label>
              <label>
                <input
                  type="radio"
                  name="preferredContact"
                  value="phone"
                  checked={formData.preferredContact === 'phone'}
                  onChange={handleChange}
                />
                Phone
              </label>
              {currentUser && (
                <label>
                  <input
                    type="radio"
                    name="preferredContact"
                    value="inapp"
                    checked={formData.preferredContact === 'inapp'}
                    onChange={handleChange}
                  />
                  In-App
                </label>
              )}
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary">Submit Ticket</button>
        </form>
      </div>
    </div>
  );
};

export default SubmitTicket;