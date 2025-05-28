import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTitle, Text, Subheading, StatText } from '../components/text';
import SecondaryButton from '../components/buttons/SecondaryButton';

function StaffDashPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
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
      lastUpdated: '2025-05-26T14:22:36.632Z', // New field
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
      lastUpdated: '2025-05-27T09:45:12.421Z', // New field
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
      lastUpdated: '2025-05-28T08:15:36.789Z', // New field
      category: 'Service',
      priority: 'Low',
      status: 'Resolved',
      assignedTo: 'staff1'
    }
  ];  const handleViewTicket = (ticketId) => {
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

  // Sorting functionality
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="text-blue-600">↑</span> : 
      <span className="text-blue-600">↓</span>;
  };

  const sortedTickets = useMemo(() => {
    let sortableTickets = [...filteredTickets];
    if (sortConfig.key) {
      sortableTickets.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle date sorting
        if (sortConfig.key === 'createdAt') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }

        // Handle priority sorting (High > Medium > Low)
        if (sortConfig.key === 'priority') {
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          aValue = priorityOrder[aValue] || 0;
          bValue = priorityOrder[bValue] || 0;
        }

        // Handle status sorting (Pending > In Progress > Resolved)
        if (sortConfig.key === 'status') {
          const statusOrder = { 'Pending': 3, 'In Progress': 2, 'Resolved': 1 };
          aValue = statusOrder[aValue] || 0;
          bValue = statusOrder[bValue] || 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableTickets;
  }, [filteredTickets, sortConfig]);
  return (    <div className="min-h-screen py-6 sm:py-12 px-4">
      <div className="bg-white p-6 md:p-10 rounded shadow-md max-w-[1200px] mx-auto">
        <PageTitle 
          title="Staff Dashboard" 
          subtitle={
            <>
              Welcome <span className="font-medium text-blue-600">Staff</span>, manage your assigned tickets here
            </>
          }
          className="mb-8"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <StatText label="Total" value={stats.total} valueColor="gray-darker" labelColor="gray-dark" />
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
            <StatText label="Pending" value={stats.pending} valueColor="yellow" labelColor="yellow" />
          </div>
          <div className="bg-purple-100 p-4 rounded-lg shadow-md">
            <StatText label="In Progress" value={stats.inProgress} valueColor="purple" labelColor="purple" />
          </div>
          <div className="bg-green-100 p-4 rounded-lg shadow-md">
            <StatText label="Resolved" value={stats.resolved} valueColor="green" labelColor="green" />
          </div>
        </div>        
        {/* Ticket Management Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <Subheading size="2xl" color="blue" className="mb-4">Ticket Management</Subheading>
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
            <table className="min-w-full table-auto border-collapse border border-gray-200">              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => handleSort('id')}
                    className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  >
                    ID {getSortIcon('id')}
                  </th>
                  <th 
                    onClick={() => handleSort('title')}
                    className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  >
                    Title {getSortIcon('title')}
                  </th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  >
                    Name {getSortIcon('name')}
                  </th>
                  <th 
                    onClick={() => handleSort('email')}
                    className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  >
                    Email {getSortIcon('email')}
                  </th>                  <th 
                    onClick={() => handleSort('createdAt')}
                    className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  >
                    Created At {getSortIcon('createdAt')}
                  </th>
                  <th 
                    onClick={() => handleSort('lastUpdated')}
                    className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  >
                    Last Updated {getSortIcon('lastUpdated')}
                  </th>
                  <th 
                    onClick={() => handleSort('category')}
                    className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  >
                    Category {getSortIcon('category')}
                  </th>
                  <th 
                    onClick={() => handleSort('priority')}
                    className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  >
                    Priority {getSortIcon('priority')}
                  </th>
                  <th 
                    onClick={() => handleSort('status')}
                    className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                  >
                    Status {getSortIcon('status')}
                  </th>
                  <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTickets.length > 0 ? sortedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.id}</td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.title}</td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.name}</td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.email}</td>                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                      {new Date(ticket.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.category}</td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                      <span className={getPriorityStyle(ticket.priority)}>{ticket.priority}</span>
                    </td>
                    <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                      <span className={getStatusStyle(ticket.status)}>{ticket.status}</span>
                    </td>
                    <td className="p-3 text-sm whitespace-nowrap">
                       <SecondaryButton onClick={() => handleViewTicket(ticket.id)}className="mr-3">
                         View
                       </SecondaryButton>
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
