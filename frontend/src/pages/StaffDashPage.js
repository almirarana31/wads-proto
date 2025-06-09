import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom'; // Add this import
import { PageTitle, Subheading, StatText } from '../components/text';
import SecondaryButton from '../components/buttons/SecondaryButton';
import StaffTicketQueuePage from './StaffTicketQueuePage';
import PriorityPill from '../components/PriorityPill';
import StatusPill from '../components/StatusPill';
import { authService } from '../api/authService';
import { FaStickyNote } from 'react-icons/fa';

// tooltip, now uses react portal
const NoteTooltipPortal = ({ note, show, position }) => {
  if (!show) return null;
  
  return createPortal(
    <div 
      className="fixed bg-white border-2 border-blue-300 rounded-lg shadow-xl p-4 z-[9999]"
      style={{
        width: '300px',
        top: `${position.y}px`,
        left: `${position.x}px`,
        pointerEvents: 'none',
      }}
    >
      <p className="font-medium text-blue-700 mb-2">Staff Note:</p>
      <p className="text-gray-700 text-sm">{note}</p>
    </div>,
    document.body // renders tooltip to body to avoid overflow (because it kept getting cut off)
  );
};

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
    pending: 0,
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
      
      // gets the initial tickets list
      const initialResponse = await authService.getStaffTickets(queryParams.toString());
      
      // fetches extra info with notes per ticket
      const detailedTickets = await Promise.all(
        initialResponse.map(async (ticket) => {
          try {
            // Get detailed ticket info including notes
            const detailResponse = await authService.getTicketDetail(ticket.ticket_id);
            return {
              ...ticket,
              note: detailResponse.note || ''
            };
          } catch (err) {
            console.error(`Error fetching details for ticket ${ticket.ticket_id}:`, err);
            return ticket; // return no notes if no details
          }
        })
      );
      
      // format tickets with additional details
      const formattedTickets = detailedTickets.map(ticket => {
        // map specific priority IDs to display names
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
            case '3': categoryName = 'IT Support'; break;
            default: categoryName = ticket.Category.name; // Fall back to the name if it's already a string
          }
        }
        
        return {
          id: ticket.ticket_id,
          displayId: `TKT-${ticket.ticket_id.toString().padStart(3, '0')}`,
          title: ticket.subject,
          name: ticket.User?.username || 'Unknown',
          email: ticket.User?.email || 'N/A',
          createdAt: ticket.createdAt,
          lastUpdated: ticket.updatedAt || ticket.createdAt,
          category: categoryName,
          priority: priorityName,
          status: ticket.Status?.name || 'In Progress',
          assignedTo: staffDetails?.username || 'You',
          note: ticket.note || ''
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
    // If ticketId includes the prefix, remove it
    const rawId = typeof ticketId === 'string' && ticketId.startsWith('TKT-') 
      ? ticketId.replace('TKT-', '') 
      : ticketId;
    
    navigate(`/staff/ticket/${rawId}`);
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
  const [tooltipState, setTooltipState] = useState({ 
    show: false, 
    note: '',
    position: { x: 0, y: 0 }
  });
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
        {/*Tab Navigation*/}
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
        {/*Tab Content*/}
        {activeTab === 'my-tickets' ? (
          <>            
            {/*Stats Cards*/}
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
            {/*Ticket Management Section*/}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <div className="flex justify-between items-center mb-4">
                <Subheading size="2xl" color="blue">Ticket Management</Subheading>
                <button 
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <select
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
              {/*Tickets Table*/}
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
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button 
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
                        <tr key={ticket.id} className={`hover:bg-gray-50 ${ticket.note ? 'bg-blue-50/30' : ''}`}>
                          <td className="p-3 text-sm whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-blue-700">
                                {ticket.displayId || `TKT-${ticket.id.toString().padStart(3, '0')}`}
                              </span>
                              {ticket.note && (
                                <span 
                                  className="relative cursor-pointer"
                                  onMouseEnter={(e) => {
                                    // Set state to show tooltip and calculate position
                                    setTooltipState({
                                      show: true, 
                                      note: ticket.note,
                                      position: { 
                                        x: e.clientX + 10,
                                        y: e.clientY + 10
                                      }
                                    });
                                  }}
                                  onMouseLeave={() => {
                                    setTooltipState({ show: false, note: '', position: { x: 0, y: 0 } });
                                  }}
                                >
                                  <FaStickyNote className="text-blue-500" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-sm font-medium text-gray-800 whitespace-nowrap">{ticket.title}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.name}</td>
                          <td className="p-3 text-sm text-gray-500 whitespace-nowrap">{ticket.email}</td>
                          <td className="p-3 text-sm text-gray-500 whitespace-nowrap">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-sm text-gray-500 whitespace-nowrap">{new Date(ticket.lastUpdated).toLocaleDateString()}</td>
                          <td className="p-3 text-sm whitespace-nowrap">
                            <span className="px-2 py-1 bg-gray-100 rounded-md text-gray-600 text-xs font-medium">
                              {ticket.category}
                            </span>
                          </td>
                          <td className="p-3 text-sm whitespace-nowrap">
                            <PriorityPill priority={ticket.priority} />
                          </td>
                          <td className="p-3 text-sm whitespace-nowrap">
                            <StatusPill status={ticket.status} />
                          </td>
                          <td className="p-3 text-sm whitespace-nowrap">
                            <SecondaryButton 
                              onClick={() => handleViewTicket(ticket.id)} 
                              className="px-3 py-1 text-sm"
                            >
                              View
                            </SecondaryButton>
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
      <NoteTooltipPortal 
        note={tooltipState.note}
        show={tooltipState.show}
        position={tooltipState.position}
      />
    </div>
  );
}

export default StaffDashPage;
