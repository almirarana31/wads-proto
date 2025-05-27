import React, { useState } from 'react';

function AuditLogPage() {
  // Mock audit log data - replace with API call later
  const [auditLogs] = useState([
    {
      id: 'LOG-001',
      timestamp: '2025-05-27T10:30:00Z',
      action: 'Ticket Status Updated',
      user: 'admin@example.com',
      details: 'Changed ticket TKT-001 status from Pending to In Progress',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: 'LOG-002',
      timestamp: '2025-05-27T10:15:00Z',
      action: 'User Login',
      user: 'staff@example.com',
      details: 'Successful login attempt',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: 'LOG-003',
      timestamp: '2025-05-27T10:00:00Z',
      action: 'Ticket Created',
      user: 'user@example.com',
      details: 'New ticket TKT-003 created',
      ipAddress: '192.168.1.3',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1)'
    }
  ]);

  const [filters] = useState({
    startDate: '',
    endDate: '',
    action: '',
    user: ''
  });

  return (
    <div className="min-h-screen bg-blue-100 py-6 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">System Audit Log</h1>
          <p className="text-gray-600 mb-6">Track and monitor system activities</p>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
              <select className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="">All Actions</option>
                <option>User Login</option>
                <option>Ticket Created</option>
                <option>Ticket Updated</option>
                <option>Ticket Status Changed</option>
                <option>User Created</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <input
                type="text"
                placeholder="Search by user email"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Timestamp', 'Action', 'User', 'Details', 'IP Address', 'User Agent'].map(header => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {log.userAgent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuditLogPage;
