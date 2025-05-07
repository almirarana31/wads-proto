import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ViewTicketsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All status');
  
  const tickets = [
    {
      id: 'TKT-001',
      title: 'Payment Failure',
      description: 'I have already paid, yet my appointment was not made.',
      status: 'Pending',
      category: 'Billing',
      created: '2025-04-16T19:11:36.632Z',
      unreadResponses: 0
    },
    {
      id: 'TKT-002',
      title: 'Payment Failure',
      description: 'I have already paid, yet my appointment was not made.',
      status: 'In Progress',
      category: 'Billing',
      created: '2025-04-16T19:11:36.632Z',
      unreadResponses: 1
    },
    {
      id: 'TKT-003',
      title: 'Payment Failure',
      description: 'I have already paid, yet my appointment was not made.',
      status: 'Resolved',
      category: 'Billing',
      created: '2025-04-16T19:11:36.632Z',
      unreadResponses: 0
    }
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  const handleSubmitNewTicket = () => {
    navigate('/submit-ticket');
  };

  const handleViewDetails = (ticketId) => {
    console.log(`View details for ticket ${ticketId}`);
    // In a real app, this would navigate to a ticket details page
    // navigate(`/tickets/${ticketId}`);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-200 text-yellow-800';
      case 'In Progress':
        return 'bg-purple-200 text-purple-800';
      case 'Resolved':
        return 'bg-green-400 text-green-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getBorderStyle = (status) => {
    switch (status) {
      case 'Pending':
        return 'border-l-4 border-yellow-400';
      case 'In Progress':
        return 'border-l-4 border-purple-500';
      case 'Resolved':
        return 'border-l-4 border-green-500';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-blue-100">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-md shadow-md p-4 sm:p-6 md:p-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1">Your Tickets</h1>
          <p className="text-gray-600 text-base sm:text-lg md:text-xl mb-4 sm:mb-6 md:mb-8">Welcome <span className="underline">User</span>, here are your submitted tickets</p>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <input
                type="text"
                placeholder="Search ticket by ID, title, description..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full sm:w-1/2 p-2 border border-gray-300 rounded"
              />
              
              <div className="flex items-center mt-2 sm:mt-0">
                <span className="mr-2 whitespace-nowrap">Filter by status:</span>
                <select
                  value={filterStatus}
                  onChange={handleFilterChange}
                  className="p-2 border border-gray-300 rounded w-full sm:w-auto"
                >
                  <option>All status</option>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={handleSubmitNewTicket}
              className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded w-full sm:w-auto mt-2 sm:mt-0"
            >
              Submit a Ticket
            </button>
          </div>
          
          <div className="grid gap-6">
            {tickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className={`bg-gray-100 p-4 sm:p-6 rounded-md ${getBorderStyle(ticket.status)}`}
              >
                <div className="flex flex-col sm:flex-row justify-between mb-3 gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-blue-800">{ticket.title}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(ticket.status)} inline-block w-fit`}>
                    {ticket.status}
                  </span>
                </div>
                
                <p className="mb-4">{ticket.description}</p>
                
                <div className="text-gray-600 text-sm">
                  <p>Ticket ID: {ticket.id}</p>
                  <p>Category: {ticket.category}</p>
                  <p>Created at: {new Date(ticket.created).toLocaleString()}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-2">
                  <button
                    onClick={() => handleViewDetails(ticket.id)}
                    className="bg-white hover:bg-gray-50 text-blue-700 border border-gray-300 py-2 px-4 rounded w-full sm:w-auto"
                  >
                    View Details
                  </button>
                  
                  <div className="text-sm text-gray-500 mt-2 sm:mt-0">
                    {ticket.unreadResponses > 0 ? (
                      <span>{ticket.unreadResponses} unread responses</span>
                    ) : (
                      <span>No unread responses</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewTicketsPage;