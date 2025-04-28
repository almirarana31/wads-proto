import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import './TicketConfirmation.css';

const TicketConfirmation = () => {
  const location = useLocation();
  const { ticket, isGuest } = location.state || {};

  // Redirect if someone navigates here directly without ticket info
  if (!ticket) {
    return <Navigate to="/" />;
  }

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <h2>Ticket Submitted Successfully!</h2>
          <div className="confirmation-icon">✓</div>
        </div>
        
        <div className="ticket-details">
          <p className="ticket-id">Ticket ID: <span>{ticket.id}</span></p>
          <p className="ticket-title">Title: <span>{ticket.title}</span></p>
          <p className="ticket-status">Status: <span>Pending</span></p>
          
          <div className="contact-info">
            <p>We'll contact you via:</p>
            {ticket.contactEmail && (
              <p className="contact-method">Email: <span>{ticket.contactEmail}</span></p>
            )}
            {ticket.contactPhone && (
              <p className="contact-method">Phone: <span>{ticket.contactPhone}</span></p>
            )}
          </div>
        </div>
        
        <div className="what-next">
          <h3>What's Next?</h3>
          <p>Our support team will review your ticket and respond as soon as possible. You will receive updates through your provided contact method.</p>
          
          {isGuest ? (
            <div className="guest-message">
              <p>As a guest user, you can always check the status of your ticket by using your ticket ID and the contact information you provided.</p>
              <p>Consider <Link to="/login">creating an account</Link> to easily track all your tickets in the future.</p>
            </div>
          ) : (
            <p>You can view the status of this ticket and all your other tickets on your <Link to="/view-tickets">Tickets Dashboard</Link>.</p>
          )}
        </div>
        
        <div className="confirmation-actions">
          <Link to="/" className="btn btn-primary">Return to Home</Link>
          {!isGuest && (
            <Link to="/view-tickets" className="btn btn-outline">View Your Tickets</Link>
          )}
          <Link to="/submit-ticket" className="btn btn-outline">Submit Another Ticket</Link>
        </div>
      </div>
    </div>
  );
};

export default TicketConfirmation;