import React, { useState, useEffect } from 'react';
import api from '../api/axios';

function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    cancelled: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    priority: 'All priority',
    status: 'All status',
    category: 'All status'
  });

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

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-3xl font-bold text-center mb-2">Admin Dashboard</h1>
      <p className="text-center text-gray-600 mb-8">
        Welcome <span className="font-medium">Admin</span>, manage your dashboard here
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <div className="p-4 bg-gray-50 rounded-lg shadow-sm">
          <h3 className="text-gray-600 mb-2">Total</h3>
          <p className="text-4xl font-bold">{stats.total}</p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg shadow-sm">
          <h3 className="text-yellow-600 mb-2">Pending</h3>
          <p className="text-4xl font-bold">{stats.pending}</p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg shadow-sm">
          <h3 className="text-purple-600 mb-2">In Progress</h3>
          <p className="text-4xl font-bold">{stats.inProgress}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg shadow-sm">
          <h3 className="text-green-600 mb-2">Resolved</h3>
          <p className="text-4xl font-bold">{stats.resolved}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-lg shadow-sm">
          <h3 className="text-red-600 mb-2">Cancelled</h3>
          <p className="text-4xl font-bold">{stats.cancelled}</p>
        </div>
      </div>

      {/* Ticket Management Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Ticket Management</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search ticket by ID, title, description..."
            className="w-full p-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-4 mb-4">
          <select 
            className="p-2 border rounded-md"
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
          >
            <option>All priority</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <select 
            className="p-2 border rounded-md"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option>All status</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Resolved</option>
            <option>Cancelled</option>
          </select>
          <select 
            className="p-2 border rounded-md"
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            <option>All status</option>
            <option>Billing</option>
            <option>Technical</option>
            <option>General</option>
          </select>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Created At</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="border-b">
                  <td className="p-3">{ticket.id}</td>
                  <td className="p-3">{ticket.title}</td>
                  <td className="p-3">{ticket.name}</td>
                  <td className="p-3">{ticket.email}</td>
                  <td className="p-3">{new Date(ticket.createdAt).toLocaleString()}</td>
                  <td className="p-3">{ticket.category}</td>
                  <td className="p-3">{ticket.priority}</td>
                  <td className="p-3">{ticket.status}</td>
                  <td className="p-3">
                    <button className="text-blue-600 hover:underline mr-2">View</button>
                    <button className="text-blue-600 hover:underline">Assign</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Performance Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-blue-700">Staff Performance</h2>
        <div className="grid grid-cols-3 gap-4">
          {staffPerformance.map((staff, index) => (
            <div key={index} className="p-4 bg-white rounded-lg shadow-sm border">
              <h3 className="font-bold mb-2">{staff.name}</h3>
              <p className="text-gray-600">Assigned: {staff.assigned}</p>
              <p className="text-gray-600">Resolved: {staff.resolved}</p>
              <p className="text-gray-600">Resolution Rate: {staff.resolutionRate}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;


