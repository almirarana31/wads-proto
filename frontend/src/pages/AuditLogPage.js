import React, { useState, useEffect } from 'react';
import { authService } from '../api/authService';
import SecondaryButton from '../components/buttons/SecondaryButton';
import { PageTitle, Label } from '../components/text';

function AuditLogPage() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    action: '',
    user: ''
  });
  // Fetch audit logs
  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        setLoading(true);
        const data = await authService.showAudit({
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          action: filters.action || undefined,
          search: filters.user || undefined
        });
        setAuditLogs(data);
        setError(null);
      } catch (err) {
        setError('Failed to load audit logs');
        console.error('Error fetching audit logs:', err);
      } finally {
        setLoading(false);
      }
    };

    // Debounce the API call to prevent too many requests
    const timeoutId = setTimeout(fetchAuditLogs, 300);
    return () => clearTimeout(timeoutId);
  }, [filters]); // Re-fetch when filters change

  const handleFilterChange = (e, field) => {
    setFilters(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <PageTitle 
            title="System Audit Log"
            subtitle="Track and monitor system activities"
          />

          {/* Action Buttons */}
          <div className="flex justify-end mb-6">
            <SecondaryButton onClick={() => console.log('Export logs')}>
              Export Log
            </SecondaryButton>
          </div>          

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label>Start Date</Label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange(e, 'startDate')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <Label>End Date</Label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange(e, 'endDate')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <Label>Action Type</Label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange(e, 'action')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">All Actions</option>
                <option>Create</option>
                <option>Update</option>
                <option>Delete</option>
              </select>
            </div>
            <div>
              <Label>User</Label>
              <input
                type="text"
                placeholder="Search by user email"
                value={filters.user}
                onChange={(e) => handleFilterChange(e, 'user')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>

          {/* Loading and Error States */}
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading audit logs...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Audit Log Table */}          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {log.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {log["User.email"]}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {log.detail}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* No Results Message */}
          {!loading && !error && auditLogs.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No audit logs found matching the current filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditLogPage;
