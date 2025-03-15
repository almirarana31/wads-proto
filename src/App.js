import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import TicketForm from "./components/TicketForm";
import UserTickets from "./components/UserTickets";
import "./styles/Global.css"; // Import global styles

const App = () => {
  return (
    <Router>
      <div className="main-background">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/submit-ticket" element={<TicketForm />} />
            <Route path="/view-tickets" element={<UserTickets />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;