import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import checkIcon from '../assets/accept.png';
import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import { PageTitle, Text, Label, Heading } from '../components/text';
import { authService } from '../api/authService';

function SubmitTicketPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    title: '',
    category: 'General',
    description: ''
  });
  const [ticket, setTicket] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status when component mounts
  useEffect(() => {
    const checkAuthStatus = () => {
      // Check multiple sources for authentication state
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const currentUser = localStorage.getItem('currentUser');
      
      // Consider user authenticated if either token exists or user is stored
      setIsAuthenticated(!!(token || currentUser));
    };

    checkAuthStatus();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      // Call backend to submit ticket (for guests, no token is sent)
      const ticketData = {
        email: formData.email,
        title: formData.title,
        category_id:
          formData.category === 'General' ? 1 :
          formData.category === 'Billing' ? 2 :
          formData.category === 'Technical' || formData.category === 'IT Support' ? 3 : 1,
        description: formData.description
      };
      const res = await authService.sendTicket(ticketData);
      setTicket({
        ticketId: res.ticket_id || res.id || 'TKT-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        title: res.title || formData.title,
        createdAt: res.created_at || res.createdAt || new Date().toISOString(),
        email: res.email || formData.email
      });
      setFormData({
        email: '',
        title: '',
        category: 'General',
        description: ''
      });
    } catch (error) {
      if (error.response?.data?.message === 'Email is verified. Please log in') {
        alert('This email is already registered. Please log in to submit a ticket.');
        return;
      }
      alert(
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to submit ticket.'
      );
    }
  };  if (ticket) {
    return (
      <div className="min-h-screen py-6 sm:py-12 px-4 sm:px-6">
        <div className="w-full max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
          <div className="bg-white rounded-md shadow-md p-5 sm:p-6 md:p-8">
            <Heading level={1} center className="mb-4 sm:mb-6 text-xl sm:text-2xl md:text-3xl break-words">
              Ticket Submitted Successfully!
            </Heading>
            <div className="flex justify-center mb-4 sm:mb-6">
              <img src={checkIcon} alt="Success" className="w-12 h-12 sm:w-16 sm:h-16" />
            </div>            {isAuthenticated ? (
              <div className="bg-gray-100 p-3 sm:p-4 rounded-md mb-4 sm:mb-6 break-words">
                <p className="mb-1 text-sm sm:text-base">Ticket ID: <span className="text-blue-600 font-medium">{ticket.ticketId}</span></p>
                <p className="mb-1 text-sm sm:text-base">Title: <span className="text-blue-600 font-medium">{ticket.title}</span></p>
                <p className="mb-2 sm:mb-4 text-sm sm:text-base">Created at: <span className="font-medium">{new Date(ticket.createdAt).toLocaleString()}</span></p>
              </div>
            ) : (
              <div className="bg-gray-100 p-3 sm:p-4 rounded-md mb-4 sm:mb-6 break-words">
                <p className="mb-1 text-sm sm:text-base">Ticket ID: <span className="text-blue-600 font-medium">{ticket.ticketId}</span></p>
                <p className="mb-1 text-sm sm:text-base">Title: <span className="text-blue-600 font-medium">{ticket.title}</span></p>
                <p className="mb-2 text-sm sm:text-base">Created at: <span className="font-medium">{new Date(ticket.createdAt).toLocaleString()}</span></p>
                <hr className="my-3 sm:my-4 border-gray-300" />
                <p className="mb-1 text-sm sm:text-base">We'll contact you via</p>
                <p className="mb-1 text-sm sm:text-base">Email: <span className="text-blue-600 font-medium break-all">{ticket.email}</span></p>
              </div>
            )}            {isAuthenticated ? (
              <>
                <Text center className="mb-4 sm:mb-6 text-sm sm:text-base">
                  Our support team will review your ticket and respond as soon as possible.
                  A staff member or admin will assist you through the conversation system in your ticket details.
                </Text>
                <Text center className="mb-6 sm:mb-8 text-sm sm:text-base">
                  View this ticket and start conversations with our support team in <a href="/view-tickets" className="text-blue-600 hover:underline font-medium">Your Tickets</a> section or use the button below.
                </Text>
                <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                  <SecondaryButton onClick={() => setTicket(null)} className="w-full sm:w-auto">
                    Submit another Ticket
                  </SecondaryButton>
                  <PrimaryButton onClick={() => navigate('/view-tickets')} className="w-full sm:w-auto">
                    View your Tickets
                  </PrimaryButton>
                </div>
              </>
            ) : (
              <>
                <Text center className="mb-4 sm:mb-6 text-sm sm:text-base">
                  Our support team will review your ticket and respond as soon as possible.
                  You will receive our response and any updates via email to the address provided above.
                </Text>
                <div className="bg-blue-50 p-3 sm:p-4 rounded-md mb-4 sm:mb-6 border border-blue-200">
                  <Text center className="mb-2 text-sm sm:text-base" color="text-blue-800">
                    <strong>Want a better experience?</strong>
                  </Text>
                  <Text center color="text-blue-700" size="sm" className="text-xs sm:text-sm">
                    Register for an account to track your tickets in real-time, participate in live conversations with our support team, and manage all your tickets in one convenient dashboard.
                  </Text>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                  <SecondaryButton onClick={() => setTicket(null)} className="w-full sm:w-auto">
                    Submit another Ticket
                  </SecondaryButton>
                  <PrimaryButton onClick={() => navigate('/signup')} className="w-full sm:w-auto">
                    Create Account
                  </PrimaryButton>
                </div>
              </>
            )}          
            </div>
        </div>
      </div>
    );
  }
  return (    <div className="py-6 md:py-12 px-4 sm:px-6 flex-grow">
      <div className="bg-white p-5 sm:p-6 md:p-8 rounded shadow-md w-full max-w-2xl mx-auto">
        <PageTitle title="Submit a Ticket" subtitle="Submit your question or issue below" className="mb-4 sm:mb-6" />
        <div className="space-y-6">
          <div>
            <Label htmlFor="email">Email Address:</Label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />          </div>
          <div>
            <Label htmlFor="title">Ticket Title:</Label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <Label htmlFor="category">Category:</Label>
            <div className="relative">
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="appearance-none w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="General">General</option>
                <option value="Technical">Technical</option>
                <option value="Billing">Billing</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description:</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="6"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            ></textarea>
          </div>
          <div className="flex justify-center pt-4">
            <PrimaryButton
              onClick={handleSubmit}
              fullWidth
            >
              Submit a Ticket
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmitTicketPage;