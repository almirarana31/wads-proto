import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import SubmitTicket from './components/SubmitTicket';
import ViewTickets from './components/ViewTickets';
import TicketDetail from './components/TicketDetail';
import TicketConfirmation from './components/TicketConfirmation';
import AdminDashboard from './components/AdminDashboard';
import StaffDashboard from './components/StaffDashboard';
import Unauthorized from './components/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import AIChat from './components/AIChat';
import { AuthProvider } from './context/AuthContext';
import { TicketProvider } from './context/TicketContext';
import  StaffTicketResponse  from './components/StaffTicketResponse';
import './App.css';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <AuthProvider>
      <TicketProvider>
        <Router>
          <div className="app">
            <Header />
            
            <main className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/submit-ticket" element={<SubmitTicket />} />
                <Route path="/ticket-confirmation" element={<TicketConfirmation />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Protected routes - Require authentication */}
                <Route element={<ProtectedRoute allowedRoles={['customer', 'employee', 'admin']} />}>
                  <Route path="/view-tickets" element={<ViewTickets />} />
                  <Route path="/ticket/:ticketId" element={<TicketDetail />} />
                </Route>
                
                {/* Admin routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
                
                {/* Staff routes */}
                <Route element={<ProtectedRoute allowedRoles={['employee', 'admin']} />}>
                  <Route path="/manage-tickets" element={<StaffDashboard />} />
                  <Route path="/staff/ticket/:ticketId" element={<StaffTicketResponse />} />
                </Route>
                
                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            
            {/* AI Chat Feature */}
            <div className="chat-bubble" onClick={toggleChat}>
              <i className="chat-icon">💬</i>
            </div>
            
            {isChatOpen && <AIChat isOpen={isChatOpen} />}
          </div>
        </Router>
      </TicketProvider>
    </AuthProvider>
  );
}

export default App;