import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import checkIcon from '../assets/accept.png';

function SubmitTicketPage() {
  const [formData, setFormData] = useState({
    email: '',
    title: '',
    category: 'General',
    description: ''
  });
  const [ticket, setTicket] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);

    const ticketId = 'TKT-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    const newTicket = {
      ticketId: ticketId,
      title: formData.title,
      createdAt: new Date().toISOString(),
      email: formData.email
    };

    setTicket(newTicket);

    setFormData({
      email: '',
      title: '',
      category: 'General',
      description: ''
    });
  };

  if (ticket) {
    return (
      <div className="min-h-screen bg-blue-100 py-6 sm:py-12 px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-md shadow-md p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
              Ticket Submitted Successfully!
            </h1>
            <div className="flex justify-center mb-6">
              <img src={checkIcon} alt="Success" className="w-16 h-16" />
            </div>
            <div className="bg-gray-100 p-4 rounded-md mb-6">
              <p className="mb-1">Ticket ID: <span className="text-blue-600 font-medium">{ticket.ticketId}</span></p>
              <p className="mb-1">Title: <span className="text-blue-600 font-medium">{ticket.title}</span></p>
              <p className="mb-4">Created at: <span className="font-medium">{new Date(ticket.createdAt).toLocaleString()}</span></p>
              <hr className="my-4 border-gray-300" />
              <p className="mb-1">We'll contact you via</p>
              <p className="mb-1">Email: <span className="text-blue-600 font-medium">{ticket.email}</span></p>
            </div>
            <p className="text-gray-600 text-center mb-6">
              Our support team will review your ticket and respond as soon as possible.
              You will receive updates through your provided contact method.
            </p>
            <p className="text-gray-600 text-center mb-8">
              You can view the status of this ticket and all your other tickets in <a href="/your-tickets" className="text-blue-600 hover:underline">Your Tickets</a>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => setTicket(null)} className="text-center border border-blue-600 text-blue-600 hover:bg-blue-50 py-2 px-4 rounded-md transition-colors">
                Submit another Ticket
              </button>
              <a href="/view-tickets" className="text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors">
                View your Tickets
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-100 py-6 md:py-12 px-4 flex-grow">
      <div className="bg-white p-6 md:p-8 rounded shadow-md max-w-2xl mx-auto">
        <h1 className="text-center text-2xl md:text-3xl font-bold text-gray-800 mb-1">Submit a Ticket</h1>
        <p className="text-center text-gray-600 mb-6">Submit your question or issue below</p>
        <div className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-blue-700 mb-2">Email Address:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div>
            <label htmlFor="title" className="block text-blue-700 mb-2">Ticket Title:</label>
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
            <label htmlFor="category" className="block text-blue-700 mb-2">Category:</label>
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
                <option value="Service">Service</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-blue-700 mb-2">Description:</label>
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
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-700 hover:bg-blue-800 text-white py-3 px-6 sm:px-8 rounded-md text-lg font-medium transition-colors w-full sm:w-auto"
            >
              Submit a Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmitTicketPage;