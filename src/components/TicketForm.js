import React, { useState } from "react";
import "../styles/TicketForm.css";

const TicketForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    description: "",
    file: null,
  });
  
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    "Medicine Complaint",
    "Doctor Complaint",
    "Scheduling Issue",
    "Payment Issue",
    "Other",
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Here you would normally send the data to your backend
      console.log("Ticket Submitted:", formData);
      
      // Show success message
      setSubmitted(true);
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        category: "",
        description: "",
        file: null,
      });
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }
  };

  return (
    <div className="ticket-container">
      <h2>Submit a Ticket</h2>
      
      {submitted && (
        <div className="form-success">
          Ticket submitted successfully! Our team will contact you shortly.
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name:</label>
        <input 
          type="text" 
          id="name"
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
        />
        {errors.name && <div className="form-error">{errors.name}</div>}

        <label htmlFor="email">Email:</label>
        <input 
          type="email" 
          id="email"
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
        />
        {errors.email && <div className="form-error">{errors.email}</div>}

        <label htmlFor="category">Category:</label>
        <select 
          id="category"
          name="category" 
          value={formData.category} 
          onChange={handleChange}
        >
          <option value="">Select a category</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && <div className="form-error">{errors.category}</div>}

        <label htmlFor="description">Description:</label>
        <textarea 
          id="description"
          name="description" 
          value={formData.description} 
          onChange={handleChange}
        />
        {errors.description && <div className="form-error">{errors.description}</div>}

        <label htmlFor="file">Attach File (optional):</label>
        <input 
          type="file" 
          id="file"
          onChange={handleFileChange} 
        />

        <button type="submit">Submit Ticket</button>
      </form>
    </div>
  );
};

export default TicketForm;