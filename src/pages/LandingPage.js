import React from "react";
import { Link } from "react-router-dom";
import "../styles/LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="hero-section">
        <h1>Welcome to Bianca Aesthetic Helpdesk</h1>
        <p>Need assistance? Submit a ticket and our team will assist you.</p>
        <div className="button-group">
          <Link to="/submit-ticket" className="btn btn-primary">Submit a Ticket</Link>
          <Link to="/view-tickets" className="btn btn-secondary">View Your Tickets</Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
