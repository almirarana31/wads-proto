import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTitle, Subheading, StatText } from '../components/text';
import SecondaryButton from '../components/buttons/SecondaryButton';
import StaffTicketQueuePage from './StaffTicketQueuePage';
import PriorityPill from '../components/PriorityPill';
import StatusPill from '../components/StatusPill';
import { authService } from '../api/authService';

function StaffDashPage() {
  const navigate = useNavigate();
  const [staffDetails, setStaffDetails] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });const [filters, setFilters] = useState({
    priority: 'All priority',
    status: 'All status'
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0, // This is used for cancelled tickets
    inProgress: 0,
    resolved: 0
  });
  const [activeTab, setActiveTab] = useState('my-tickets');
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);    const fetchStaffTickets = async (searchTerm = '', filterPriority = '', filterStatus = '') => {
    try {
      setIsLoading(true);
        // Build query parameters for API search
      const queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (filterPriority && filterPriority !== 'All priority') queryParams.append('priority', filterPriority);
      if (filterStatus && filterStatus !== 'All status') queryParams.append('status', filterStatus);
      
      const response = await authService.getStaffTickets(queryParams.toString());
        // Transform backend data to match frontend structure
      const formattedTickets = response.map(ticket => {
        // Map priority IDs to display names
        let priorityName = 'Medium';
        if (ticket.Priority) {
          switch (ticket.Priority.name) {
            case '1': priorityName = 'High'; break;
            case '2': priorityName = 'Medium'; break;
            case '3': priorityName = 'Low'; break;
            default: priorityName = ticket.Priority.name; // Fall back to the name if it's already a string
          }
        }
        
        // Map category IDs to display names
        let categoryName = 'General';
        if (ticket.Category) {
          switch (ticket.Category.name) {
            case '1': categoryName = 'General'; break;
            case '2': categoryName = 'Billing'; break;
            case '3': categoryName = 'IT Support/Technical'; break;
            default: categoryName = ticket.Category.name; // Fall back to the name if it's already a string
          }
        }
        
        return {
          id: `TKT-${ticket.ticket_id.toString().padStart(3, '0')}`,
          title: ticket.subject,
          name: ticket.User?.username || 'Unknown',
          email: ticket.User?.email || 'N/A',
          createdAt: ticket.createdAt,
          lastUpdated: ticket.updatedAt || ticket.createdAt, // Fallback to createdAt if updatedAt is not available
          category: categoryName,
          priority: priorityName,
          status: ticket.Status?.name || 'In Progress',
          assignedTo: 'staff1' // You may need to fetch this separately if needed
        };
      });
      
      setTickets(formattedTickets);
      
      // Calculate stats
      const totalTickets = formattedTickets.length;
      const cancelledTickets = formattedTickets.filter(t => t.status === 'Cancelled').length;
      const inProgressTickets = formattedTickets.filter(t => t.status === 'In Progress').length;
      const resolvedTickets = formattedTickets.filter(t => t.status === 'Resolved').length;
      
      setStats({
        total: totalTickets,
        pending: cancelledTickets, // Using 'pending' state variable for cancelled tickets
        inProgress: inProgressTickets,
        resolved: resolvedTickets
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching staff tickets:', err);
      setError(`Failed to load tickets: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  // Fetch staff details
  const fetchStaffDetails = async () => {
    try {
      const response = await authService.getStaffDetail();
      setStaffDetails(response);
    } catch (err) {
      console.error('Error fetching staff details:', err);
    }
  };

  // Fetch tickets and staff details when component mounts or when active tab changes
  useEffect(() => {
    fetchStaffDetails();
    if (activeTab === 'my-tickets') {
      fetchStaffTickets();
    }
  }, [activeTab]);

  // Handle search with API
  const handleSearch = () => {
    fetchStaffTickets(searchQuery, filters.priority, filters.status);
  };

  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStaffTickets(searchQuery, filters.priority, filters.status);
  };

  const handleViewTicket = (ticketId) => {
    navigate(`/staff/ticket/${ticketId}`);
  };

  // Filter tickets based on search and filters (client-side filtering as a backup)
  const filteredTickets = tickets;
  // Sorting functionality
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    // When we have server-side sorting implemented, we can call the API with sort parameters
    // For now, we'll let client-side sorting handle it
    // fetchStaffTickets(searchQuery, filters.priority, filters.status, key, direction);
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-gray-400">↕</span>;
    }      return sortConfig.direction === 'asc' ? 
      <span className="text-bianca-primary">↑</span> : 
      <span className="text-bianca-primary">↓</span>;
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
        
        // Handle status sorting (Cancelled > In Progress > Resolved)
        if (sortConfig.key === 'status') {
          const statusOrder = { 'Cancelled': 3, 'In Progress': 2, 'Resolved': 1 };
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
  return (
    <div className="min-h-screen py-6 sm:py-12 px-4">
      <div className="bg-white p-6 md:p-10 rounded shadow-md max-w-screen-2xl mx-auto">
        <PageTitle 
          title="Staff Dashboard"          subtitle={
            <>
              Welcome <span className="font-medium text-bianca-primary">{staffDetails?.username || 'Staff'}</span>, manage your assigned tickets here
            </>
          }
          className="mb-8"
        />
        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === 'my-tickets' ? 'border-bianca-primary text-bianca-primary' : 'border-transparent text-gray-500 hover:text-bianca-primary'}`}
            onClick={() => setActiveTab('my-tickets')}
          >
            My Tickets
          </button>          <button
            className={`px-4 py-2 font-semibold border-b-2 transition-colors ${activeTab === 'queue' ? 'border-bianca-primary text-bianca-primary' : 'border-transparent text-gray-500 hover:text-bianca-primary'}`}
            onClick={() => setActiveTab('queue')}
          >
            Ticket Queue
          </button>
        </div>
        {/* Tab Content */}
        {activeTab === 'my-tickets' ? (
          <>            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <StatText label="Total" value={stats.total} valueColor="gray-darker" labelColor="gray-dark" />
              </div>
              <div className="bg-red-100 p-4 rounded-lg shadow-md">
                <StatText label="Cancelled" value={stats.pending} valueColor="red" labelColor="red" />
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
              <div className="flex justify-between items-center mb-4">
                <Subheading size="2xl" color="blue">Ticket Management</Subheading>                <button 
                  onClick={handleRefresh} 
                  className="flex items-center px-4 py-2 bg-bianca-primary text-white rounded hover:bg-bianca-primary/80 transition-colors" 
                  disabled={isRefreshing}
                >
                  {isRefreshing ? (
                    <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  Refresh
                </button>
              </div>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-grow">
                  <input
                    type="text"
                    placeholder="Search ticket by ID, title, name, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bianca-primary/30"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>                <button 
                  onClick={handleSearch} 
                  className="px-4 py-2 bg-bianca-primary text-white rounded hover:bg-bianca-primary/80 transition-colors"
                >
                  Search
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">                <select
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bianca-primary/30 bg-white"
                  value={filters.priority}
                  onChange={(e) => {
                    setFilters({...filters, priority: e.target.value});
                    fetchStaffTickets(searchQuery, e.target.value, filters.status);
                  }}
                >
                  <option value="All priority">All priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>                <select
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bianca-primary/30 bg-white"
                  value={filters.status}
                  onChange={(e) => {
                    setFilters({...filters, status: e.target.value});
                    fetchStaffTickets(searchQuery, filters.priority, e.target.value);
                  }}
                >
                  <option value="All status">All status</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>              
              {/* Tickets Table */}
              <div className="overflow-x-auto w-full">
                {isLoading ? (
                  <div className="text-center p-6">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-bianca-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                    <p className="mt-2 text-gray-600">Loading tickets...</p>
                  </div>                ) : error ? (
                  <div className="text-center p-6">
                    <div className="flex items-center justify-center mb-4 text-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Tickets</h3>
                    <p className="text-gray-700 mb-4">{error}</p>                    <button 
                      onClick={handleRefresh} 
                      className="mt-4 px-4 py-2 bg-bianca-primary text-white rounded hover:bg-bianca-primary/80 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th onClick={() => handleSort('id')} className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100">ID {getSortIcon('id')}</th>
                        <th onClick={() => handleSort('title')} className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100">Title {getSortIcon('title')}</th>
                        <th onClick={() => handleSort('name')} className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100">Name {getSortIcon('name')}</th>
                        <th onClick={() => handleSort('email')} className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100">Email {getSortIcon('email')}</th>
                        <th onClick={() => handleSort('createdAt')} className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100">Created At {getSortIcon('createdAt')}</th>
                        <th onClick={() => handleSort('lastUpdated')} className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100">Last Updated {getSortIcon('lastUpdated')}</th>
                        <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer">Category</th>
                        <th onClick={() => handleSort('priority')} className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100">Priority {getSortIcon('priority')}</th>
                        <th onClick={() => handleSort('status')} className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100">Status {getSortIcon('status')}</th>
                        <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedTickets.length > 0 ? sortedTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50">
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.id}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.title}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.name}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.email}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{new Date(ticket.lastUpdated).toLocaleDateString()}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.category}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                            <PriorityPill priority={ticket.priority} />
                          </td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                            <StatusPill status={ticket.status} />
                          </td>
                          <td className="p-3 text-sm whitespace-nowrap">
                            <SecondaryButton onClick={() => handleViewTicket(ticket.id)} className="mr-3">View</SecondaryButton>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="10" className="p-3 text-sm text-gray-500 text-center">No tickets found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>        ) : (
          <StaffTicketQueuePage 
            staffCategory="Billing" 
            onClaimTicket={() => {
              // When a ticket is claimed, refresh the staff's assigned tickets
              fetchStaffTickets(searchQuery, filters.priority, filters.status);
            }} 
          />
        )}
      </div>
    </div>
  );
}

// Utility functions for styling


export default StaffDashPage;
