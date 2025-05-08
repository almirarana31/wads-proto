import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ViewTicketsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All status');
  
  // Mock ticket data - in a real app, this would come from API
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

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter dropdown change
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // Navigate to submit ticket page
  const handleSubmitNewTicket = () => {
    navigate('/submit-ticket');
  };

  // View ticket details
  const handleViewDetails = (ticketId) => {
    console.log(`View details for ticket ${ticketId}`);
    // In a real app, navigate to ticket details page
    // navigate(`/tickets/${ticketId}`);
  };

  // Filter tickets based on search query and status filter
  const filteredTickets = tickets.filter(ticket => {
    // Apply status filter if not "All status"
    if (filterStatus !== 'All status' && ticket.status !== filterStatus) {
      return false;
    }
    
    // Apply search query if any
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ticket.id.toLowerCase().includes(query) ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.category.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Get appropriate styling for different status labels
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

  // Get border color for ticket cards based on status
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
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-md shadow-md p-8">
          {/* Page Header */}
          <h1 className="text-4xl font-bold text-gray-800 mb-1">Your Tickets</h1>
          <p className="text-gray-600 text-xl mb-8">
            Welcome <span className="underline">User</span>, here are your submitted tickets
          </p>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search ticket by ID, title, description..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full md:w-80 p-2 border border-gray-300 rounded"
              />
              
              <div className="flex items-center">
                <span className="mr-2 text-gray-700">Filter by status:</span>
                <select
                  value={filterStatus}
                  onChange={handleFilterChange}
                  className="p-2 border border-gray-300 rounded"
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
              className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded whitespace-nowrap"
            >
              Submit a Ticket
            </button>
          </div>
          
          {/* Ticket List */}
          <div className="space-y-6">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No tickets found matching your criteria.
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id} 
                  className={`bg-gray-100 p-6 rounded-md ${getBorderStyle(ticket.status)}`}
                >
                  <div className="flex flex-col md:flex-row justify-between mb-3 gap-2">
                    <h2 className="text-xl font-bold text-blue-800">{ticket.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${getStatusStyle(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </div>
                  
                  <p className="mb-4 text-gray-700">{ticket.description}</p>
                  
                  <div className="text-gray-600 text-sm">
                    <p>Ticket ID: {ticket.id}</p>
                    <p>Category: {ticket.category}</p>
                    <p>Created at: {new Date(ticket.created).toLocaleString()}</p>
                  </div>
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-3">
                    <button
                      onClick={() => handleViewDetails(ticket.id)}
                      className="bg-white hover:bg-gray-50 text-blue-700 border border-gray-300 py-2 px-4 rounded"
                    >
                      View Details
                    </button>
                    
                    <div className="text-sm text-gray-500">
                      {ticket.unreadResponses > 0 ? (
                        <span>{ticket.unreadResponses} unread {ticket.unreadResponses === 1 ? 'response' : 'responses'}</span>
                      ) : (
                        <span>No unread responses</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewTicketsPage;