import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <div className="welcome-box">
        <h1>Welcome to Bianca Aesthetic Helpdesk</h1>
        <p>Need assistance? Submit a ticket and our team will assist you.</p>
        <div className="button-group">
          <Link to="/submit-ticket" className="btn btn-primary">Submit a Ticket</Link>
          <Link to="/view-tickets" className="btn btn-outline">View Your Tickets</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;