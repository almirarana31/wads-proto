import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <a href="https://www.biancaclinic.com" target="_blank" rel="noopener noreferrer">
          Bianca Aesthetic
        </a>
      </div>
      <ul className="nav-links">
      <li><Link to="/">Home</Link></li>
        <li><Link to="/submit-ticket">Submit Ticket</Link></li>
        <li><Link to="/view-tickets">View Tickets</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
