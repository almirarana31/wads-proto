import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function StaffDashPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priority: 'All priority',
    status: 'All status',
    category: 'All category'
  });
  const [stats] = useState({
    total: 45,
    pending: 15,
    inProgress: 20,
    resolved: 10
  });

  // Mock data - replace with API call in real app
  const tickets = [
    { 
      id: 'TKT-001', 
      title: 'Payment Failure',
      name: 'User Name',
      email: 'user@example.com',
      createdAt: '2025-04-16T19:11:36.632Z',
      category: 'Billing',
      priority: 'High',
      status: 'Pending',
      assignedTo: 'staff1'
    },
    { 
      id: 'TKT-002',
      title: 'Technical Issue',
      name: 'Another User',
      email: 'another@example.com',
      createdAt: '2025-04-16T19:11:36.632Z',
      category: 'Technical',
      priority: 'Medium',
      status: 'In Progress',
      assignedTo: 'staff1'
    },
    { 
      id: 'TKT-003',
      title: 'Service Request',
      name: 'Third User',
      email: 'third@example.com',
      createdAt: '2025-04-16T19:11:36.632Z',
      category: 'Service',
      priority: 'Low',
      status: 'Resolved',
      assignedTo: 'staff1'
    }
  ];

  const handleViewTicket = (ticketId) => {
    navigate(`/staff/ticket/${ticketId}`);
  };

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (ticket.id.toLowerCase().includes(searchLower) ||
       ticket.title.toLowerCase().includes(searchLower) ||
       ticket.name.toLowerCase().includes(searchLower) ||
       ticket.email.toLowerCase().includes(searchLower)) &&
      (filters.priority === 'All priority' || ticket.priority === filters.priority) &&
      (filters.status === 'All status' || ticket.status === filters.status) &&
      (filters.category === 'All category' || ticket.category === filters.category)
    );
  });

  return (
    <div className="min-h-screen bg-blue-100 py-6 sm:py-12 px-4">
      <div className="bg-white p-6 md:p-10 rounded shadow-md max-w-[1200px] mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Staff Dashboard</h1>
        <p className="text-center text-gray-600 mb-8">
          Welcome <span className="font-medium text-blue-600">Staff</span>, manage your assigned tickets here
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-1">Total</h3>
            <p className="text-4xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-yellow-800 mb-1">Pending</h3>
            <p className="text-4xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-purple-800 mb-1">In Progress</h3>
            <p className="text-4xl font-bold text-purple-700">{stats.inProgress}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-green-800 mb-1">Resolved</h3>
            <p className="text-4xl font-bold text-green-700">{stats.resolved}</p>
          </div>
        </div>

        {/* Ticket Management Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Ticket Management</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search ticket by ID, title, name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
            >
              <option value="All priority">All priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="All status">All status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
            <select
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="All category">All category</option>
              <option value="Billing">Billing</option>
              <option value="Technical">Technical</option>
              <option value="General">General</option>
              <option value="Service">Service</option>
            </select>
          </div>

          {/* Tickets Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['ID', 'Title', 'Name', 'Email', 'Created At', 'Category', 'Priority', 'Status', 'Actions'].map(header => (
                    <th key={header} className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                      {header} <span className="text-gray-400">▼</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.id}</td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.title}</td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.name}</td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.email}</td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.category}</td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                      <span className={getPriorityStyle(ticket.priority)}>{ticket.priority}</span>
                    </td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                      <span className={getStatusStyle(ticket.status)}>{ticket.status}</span>
                    </td>
                    <td className="p-3 text-sm whitespace-nowrap">
                      <button 
                        onClick={() => handleViewTicket(ticket.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" className="p-3 text-sm text-gray-500 text-center">No tickets found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility functions for styling
function getStatusStyle(status) {
  switch (status) {
    case 'Pending':
      return 'px-2 py-1 text-yellow-800 bg-yellow-200 rounded-full';
    case 'In Progress':
      return 'px-2 py-1 text-purple-800 bg-purple-200 rounded-full';
    case 'Resolved':
      return 'px-2 py-1 text-green-800 bg-green-400 rounded-full';
    default:
      return 'px-2 py-1 text-gray-800 bg-gray-200 rounded-full';
  }
}

function getPriorityStyle(priority) {
  switch (priority) {
    case 'High':
      return 'px-2 py-1 text-red-800 bg-red-200 rounded-full';
    case 'Medium':
      return 'px-2 py-1 text-orange-800 bg-orange-200 rounded-full';
    case 'Low':
      return 'px-2 py-1 text-green-800 bg-green-200 rounded-full';
    default:
      return 'px-2 py-1 text-gray-800 bg-gray-200 rounded-full';
  }
}

export default StaffDashPage;
