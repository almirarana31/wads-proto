import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TicketProvider } from './context/TicketContext';
import Header from './components/Header';
import Home from './components/Home';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import TicketManagement from './components/TicketManagement';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import AIChat from './components/AIChat';
import ProtectedRoute from './components/ProtectedRoute';
import Unauthorized from './components/Unauthorized';
import './App.css';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <AuthProvider>
      <TicketProvider>
        <Router>
          <div className="app">
            <Header />
            <div className="container">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Protected routes - any authenticated user */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'employee', 'customer']} />}>
                  <Route path="/view-tickets" element={<TicketList />} />
                </Route>
                
                {/* Customer routes */}
                <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
                  <Route path="/submit-ticket" element={<TicketForm />} />
                </Route>
                
                {/* Admin routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>
                
                {/* Staff routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'employee']} />}>
                  <Route path="/manage-tickets" element={<TicketManagement />} />
                </Route>
              </Routes>
            </div>
            {/* Floating Chat Bubble */}
            <div className="chat-bubble" onClick={() => setIsChatOpen(!isChatOpen)}>
              💬
            </div>
            {isChatOpen && <AIChat />}
          </div>
        </Router>
      </TicketProvider>
    </AuthProvider>
  );
}

export default App;