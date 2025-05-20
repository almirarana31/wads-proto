import React, { useState, useEffect } from 'react';
// import api from '../api/axios'; // Assuming you have an API service

function AdminDashboard() {
  const [tickets, setTickets] = useState([
    // Sample Data - Replace with API call
    { id: 'TKT-001', title: 'Payment Failure', name: 'User Name', email: 'user@example.com', createdAt: '2025-04-16T19:11:36.632Z', category: 'Billing', priority: 'Medium', status: 'Pending' },
    { id: 'TKT-002', title: 'Payment Failure', name: 'User Name', email: 'user@example.com', createdAt: '2025-04-16T19:11:36.632Z', category: 'Billing', priority: 'High', status: 'In Progress' },
    { id: 'TKT-003', title: 'Payment Failure', name: 'User Name', email: 'user@example.com', createdAt: '2025-04-16T19:11:36.632Z', category: 'General', priority: 'Low', status: 'Resolved' },
  ]);
  const [stats, setStats] = useState({
    total: 3,
    pending: 1,
    inProgress: 1,
    resolved: 1,
    cancelled: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priority: 'All priority',
    status: 'All status',
    category: 'All category' // Corrected from 'All status'
  });

  // useEffect(() => {
  //   // Fetch tickets and stats from API
  //   const fetchDashboardData = async () => {
  //     try {
  //       // Replace with your actual API calls
  //       // const ticketsResponse = await api.get('/admin/tickets');
  //       // const statsResponse = await api.get('/admin/stats');
  //       // setTickets(ticketsResponse.data);
  //       // setStats(statsResponse.data);
  //     } catch (error) {
  //       console.error("Error fetching dashboard data:", error);
  //     }
  //   };
  //   fetchDashboardData();
  // }, []);

  const staffPerformance = [
    {
      name: 'Admin',
      assigned: 1,
      resolved: 1,
      resolutionRate: '100%'
    },
    {
      name: 'Staff Name',
      assigned: 1,
      resolved: 1,
      resolutionRate: '100%'
    },
    {
      name: 'Staff Name',
      assigned: 1,
      resolved: 1,
      resolutionRate: '100%'
    }
  ];

  // Filtered tickets based on search and filters
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
      <div className="bg-white p-6 md:p-10 rounded shadow-md max-w-auto mx-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">Admin Dashboard</h1>
        <p className="text-center text-gray-600 mb-8">
          Welcome <span className="font-medium text-blue-600">Admin</span>, manage your dashboard here
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
          <div className="bg-red-100 p-4 rounded-lg shadow-md text-center">
            <h3 className="text-xl font-semibold text-red-800 mb-1">Cancelled</h3>
            <p className="text-4xl font-bold text-red-700">{stats.cancelled}</p>
          </div>
        </div>

        {/* Ticket Management Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Ticket Management</h2>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search ticket by ID, title, description..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
              <option value="Cancelled">Cancelled</option>
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
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                      <select defaultValue={ticket.category} className="p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white">
                        <option>Billing</option>
                        <option>Technical</option>
                        <option>General</option>
                        <option>Service</option>
                      </select>
                    </td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                       <select defaultValue={ticket.priority} className="p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white">
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                      <select defaultValue={ticket.status} className="p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white">
                        <option>Pending</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                        <option>Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-800 font-medium hover:underline mr-3">View</button>
                      <button className="text-blue-600 hover:text-blue-800 font-medium hover:underline">Assign</button>
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

        {/* Staff Performance Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-blue-700">Staff Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {staffPerformance.map((staff, index) => (
              <div key={index} className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
                <h3 className="font-bold text-xl text-gray-800 mb-3">{staff.name}</h3>
                <p className="text-gray-600 text-sm">Assigned: <span className="font-medium">{staff.assigned}</span></p>
                <p className="text-gray-600 text-sm">Resolved: <span className="font-medium">{staff.resolved}</span></p>
                <p className="text-gray-600 text-sm">Resolution Rate: <span className="font-medium text-green-600">{staff.resolutionRate}</span></p>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

export default AdminDashboard;


