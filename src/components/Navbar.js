import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";
import Logo from "../assets/Logo-Bianca-Clinic-Timeless-Beauty-Blue-1270x812.png"

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo-nav">
      <img src={Logo} href="https://www.biancaclinic.com"></img>
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
