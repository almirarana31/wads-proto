import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStickyNote } from 'react-icons/fa';

import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import AssignStaffModal from '../components/AssignStaffModal';
import { PageTitle, Text, Subheading, StatText } from '../components/text';
import StaffCard from '../components/StaffCard';
import StaffEditModal from '../components/StaffEditModal';
import SuccessModal from '../components/SuccessModal';
import { authService } from '../api/authService';

function AdminDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true);
        setError(null);
        const data = await authService.getAdminTickets();
        
        // Map and check staff assignment for each ticket
        const ticketsWithStaff = await Promise.all(data.map(async ticket => {
          let assignedStaff = null;
          let staffError = null;

          try {
            const staffData = await authService.getStaffForTicket(ticket.ticket_id);
            if (staffData && staffData.length > 0) {
              assignedStaff = {
                id: staffData[0].staff_id,
                name: staffData[0].staff_name
              };
            }
          } catch (err) {
            console.error(`Error fetching staff for ticket ${ticket.ticket_id}:`, err);
            staffError = `Failed to load assigned staff: ${err.message}`;
          }

          return {
            id: ticket.ticket_id,
            subject: ticket.subject,
            createdAt: ticket.createdAt,
            lastUpdated: ticket.updatedAt || ticket.createdAt,
            note: ticket.note,
            category: ticket.Category?.name || '',
            status: ticket.Status?.name || '',
            priority: ticket.Priority || null,
            name: ticket.User?.username || '',
            email: ticket.User?.email || '',
            assignedStaff,
            staffError
          };
        }));

        // Update tickets state
        setTickets(ticketsWithStaff);

        // Check if any staff lookup errors occurred
        const staffErrors = ticketsWithStaff
            .filter(t => t.staffError)
            .map(t => `Ticket ${t.id}: ${t.staffError}`);

        if (staffErrors.length > 0) {
            console.warn('Some staff lookups failed:', staffErrors);
            // Only show error if ALL staff lookups failed
            if (staffErrors.length === ticketsWithStaff.length) {
                setError('Failed to load staff assignments. Please try refreshing.');
            }
        }

      } catch (err) {
        console.error('Failed to fetch tickets:', err);
        setError('Failed to load tickets. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchTickets();
  }, []);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    cancelled: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setStatsLoading(true);
        const data = await authService.getAdminStatusSummary();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch status summary:', err);
        // Set default values in case of error
        setStats({
          total: 0,
          pending: 0,
          inProgress: 0,
          resolved: 0,
          cancelled: 0
        });
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const [staffPerformance, setStaffPerformance] = useState([]);

  useEffect(() => {
    async function fetchStaffPerformance() {
      try {
        const data = await authService.getAdminStaffPerformance();
        setStaffPerformance(data);
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchStaffPerformance();
  }, []);

  const [filters, setFilters] = useState({
    search: '',
    priority: 'All priority',
    status: 'All status',
    category: 'All category'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState('');  const [activeTab, setActiveTab] = useState('tickets');
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });

  useEffect(() => {
    async function fetchPriorities() {
      try {
        const data = await authService.getPriorities();
        setPriorities(data);
      } catch (err) {
        setPriorities([]);
      }
    }
    fetchPriorities();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await authService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const getAdminUsername = async () => {
      try {
        const userDetails = await authService.getUserDetail();
        setAdminUsername(userDetails.username || 'Admin');
      } catch (err) {
        console.error('Failed to fetch admin username:', err);
        setAdminUsername('Admin'); // Fallback value
      }
    };
    getAdminUsername();
  }, []);

  const handleViewTicket = async (ticketId) => {
    try {
      const formattedId = ticketId.toString().replace('TKT-', '');
      // Use the admin route instead of staff route
      navigate(`/admin/ticket/${formattedId}`);
    } catch (error) {
      console.error('Error navigating to ticket:', error);
      setError('Failed to view ticket details. Please try again.');
    }
  };
  const handleAssignTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setIsAssignModalOpen(true);
  };  const handleStaffAssignment = async (ticketId, staffId, staffName) => {
    try {
      // Remove TKT- prefix if present
      const rawTicketId = ticketId.startsWith('TKT-') ? ticketId.replace('TKT-', '') : ticketId;
      
      console.log(`🔄 Assigning staff ${staffId} (${staffName}) to ticket ${rawTicketId}`);
      
      // Show loading state in the UI
      setLoading(true);
      
      const assignResult = await authService.assignTicketToStaff(rawTicketId, staffId);
      
      if (!assignResult.success || !assignResult.ticket) {
        throw new Error(assignResult.message || 'Failed to assign staff');
      }
      
      // Validate the assignment result
      if (assignResult.ticket.staff_id !== staffId) {
        throw new Error('Server returned mismatched staff ID');
      }
      
      // Wait for database to sync (backend might need time to process)
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fetch fresh data to ensure we have the latest state
      const [updatedTickets, statsData] = await Promise.all([
        authService.getAdminTickets(),
        authService.getAdminStatusSummary()
      ]);
      
      // Map and check staff assignment for each ticket
      const ticketsWithStaff = await Promise.all(updatedTickets.map(async ticket => {
        let assignedStaff = null;
        try {
          const staffData = await authService.getStaffForTicket(ticket.ticket_id);
          if (staffData && staffData.length > 0) {
            assignedStaff = {
              id: staffData[0].staff_id,
              name: staffData[0].staff_name
            };
          }
        } catch (err) {
          console.error(`Error fetching staff for ticket ${ticket.ticket_id}:`, err);
        }

        return {
          id: ticket.ticket_id,
          subject: ticket.subject,
          createdAt: ticket.createdAt,
          lastUpdated: ticket.updatedAt || ticket.createdAt,
          note: ticket.note,
          category: ticket.Category?.name || '',
          status: ticket.Status?.name || '',
          priority: ticket.Priority || null,
          name: ticket.User?.username || '',
          email: ticket.User?.email || '',
          assignedStaff: assignedStaff
        };
      }));

      // Verify the assigned ticket is in our updated data
      const updatedTicket = ticketsWithStaff.find(t => t.id === rawTicketId);
      if (!updatedTicket || !updatedTicket.assignedStaff || updatedTicket.assignedStaff.id !== staffId) {
        throw new Error('Failed to verify assignment in updated data');
      }

      setTickets(ticketsWithStaff);
      setStats(statsData);
      
      // Show success modal
      setSuccessModal({
        isOpen: true,
        title: "Staff Assignment Successful",
        message: `Ticket ${ticketId} has been assigned to ${staffName}!`
      });

      // Close the assign modal
      handleCloseAssignModal();
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      // Show detailed error message
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Failed to assign ticket: ${errorMessage}. Please try again.`);
    } finally {
      setLoading(false);
      // Always refresh tickets to ensure consistent state
      handleRefresh();
    }
  };
  const handleCloseAssignModal = () => {
    setIsAssignModalOpen(false);
    setSelectedTicketId('');
  };
  const handleAddStaff = () => {
    setSelectedStaff(null); // Ensures we're in "add" mode
    setIsAddStaffModalOpen(true);
  };
  const handleEditStaff = (staff) => {
    setSelectedStaff(staff); // staff.staff_id is used
    setIsAddStaffModalOpen(true);
  };
  const handleSaveStaff = async (updatedStaffData) => {
    try {
      if (selectedStaff) {
        console.log('Editing staff:', updatedStaffData);
        
        // Only update is_guest status
        setStaffPerformance(prevStaff => 
          prevStaff.map(staff => 
            staff.staff_id === updatedStaffData.staff_id
              ? {
                  ...staff,
                  is_guest: updatedStaffData.is_guest
                }
              : staff
          )
        );
        
        setIsAddStaffModalOpen(false);
        setSelectedStaff(null);
      }
    } catch (error) {
      console.error('Error updating staff:', error);
    }
  };


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
    return sortConfig.direction === 'asc' ?      <span className="text-bianca-primary">↑</span> : 
      <span className="text-bianca-primary">↓</span>;
  };

  // Filter tickets based on search and filters
  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = (
        ticket.id.toString().includes(searchLower) ||
        (ticket.subject || '').toLowerCase().includes(searchLower) ||
        (ticket.name || '').toLowerCase().includes(searchLower) ||
        (ticket.email || '').toLowerCase().includes(searchLower)
    );

    const matchesPriority = 
        filters.priority === 'All priority' || 
        (ticket.priority?.name || '') === filters.priority;

    const matchesStatus = 
        filters.status === 'All status' || 
        ticket.status === filters.status;

    const matchesCategory = 
        filters.category === 'All category' || 
        ticket.category === filters.category;

    return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
});

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

        // Handle status sorting (Pending > In Progress > Resolved > Cancelled)
        if (sortConfig.key === 'status') {
          const statusOrder = { 'Pending': 4, 'In Progress': 3, 'Resolved': 2, 'Cancelled': 1 };
          aValue = statusOrder[aValue] || 0;
          bValue = statusOrder[bValue] || 0;
        }

        // Handle assigned staff sorting (assigned first, then by name)
        if (sortConfig.key === 'assignedStaff') {
          aValue = a.assignedStaff ? a.assignedStaff.name : '';
          bValue = b.assignedStaff ? b.assignedStaff.name : '';
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
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setLoading(true);
      setStatsLoading(true);

      // Fetch both tickets and stats in parallel
      const [ticketsData, statsData] = await Promise.all([
        authService.getAdminTickets(),
        authService.getAdminStatusSummary()
      ]);

      // Process tickets
      const ticketsWithStaff = await Promise.all(ticketsData.map(async ticket => {
        let assignedStaff = null;
        try {
          const staffData = await authService.getStaffForTicket(ticket.ticket_id);
          if (staffData && staffData.length > 0) {
            assignedStaff = {
              id: staffData[0].staff_id,
              name: staffData[0].staff_name
            };
          }
        } catch (err) {
          console.error(`Error fetching staff for ticket ${ticket.ticket_id}:`, err);
        }

        return {
          id: ticket.ticket_id,
          subject: ticket.subject,
          createdAt: ticket.createdAt,
          lastUpdated: ticket.updatedAt || ticket.createdAt,
          note: ticket.note,
          category: ticket.Category?.name || '',
          status: ticket.Status?.name || '',
          priority: ticket.Priority || null,
          name: ticket.User?.username || '',
          email: ticket.User?.email || '',
          assignedStaff: assignedStaff
        };
      }));

      // Update both states
      setTickets(ticketsWithStaff);
      setStats(statsData);

    } catch (error) {
      console.error('Failed to refresh data:', error);
      setError('Failed to refresh data. Please try again later.');
    } finally {
      setLoading(false);
      setStatsLoading(false);
      setIsRefreshing(false);
    }
  };

  // First, add a new handler function for refreshing staff data
  const handleStaffRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await authService.getAdminStaffPerformance();
      setStaffPerformance(data);
    } catch (error) {
      console.error('Failed to refresh staff data:', error);
      setError('Failed to refresh staff data. Please try again later.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen py-6 sm:py-12 px-4">
      <div className="bg-white p-6 md:p-10 rounded shadow-md">
        <div className="mx-auto">
          <PageTitle 
            title="Admin Dashboard"
            subtitle={
              <>
                Welcome <span className="font-medium text-blue-600">{adminUsername}</span>, manage your dashboard here
              </>
            }
          />

          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            <button
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'tickets' ? 'border-bianca-primary text-bianca-primary' : 'border-transparent text-gray-500 hover:text-bianca-primary'
              }`}
              onClick={() => setActiveTab('tickets')}
            >
              Tickets
            </button>
            <button
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'staffs' ? 'border-bianca-primary text-bianca-primary' : 'border-transparent text-gray-500 hover:text-bianca-primary'
              }`}
              onClick={() => setActiveTab('staffs')}
            >
              Staffs
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'tickets' ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                {statsLoading ? (
                  // Loading state
                  Array(5).fill(0).map((_, index) => (
                    <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md animate-pulse h-24"></div>
                  ))
                ) : (
                  <>
                    <div className="bg-white p-4 rounded-lg shadow-md text-center">
                      <StatText value={stats.total} label="Total" />
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
                      <StatText 
                        label="Pending" 
                        value={stats.pending} 
                        valueColor="yellow" 
                        labelColor="yellow" 
                      />
                    </div>
                    <div className="bg-purple-100 p-4 rounded-lg shadow-md">
                      <StatText 
                        label="In Progress" 
                        value={stats.inProgress} 
                        valueColor="purple" 
                        labelColor="purple" 
                      />
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg shadow-md">
                      <StatText 
                        label="Resolved" 
                        value={stats.resolved} 
                        valueColor="green" 
                        labelColor="green" 
                      />
                    </div>
                    <div className="bg-red-100 p-4 rounded-lg shadow-md">
                      <StatText 
                        value={stats.cancelled} 
                        label="Cancelled" 
                        valueColor="red" 
                        labelColor="red" 
                      />
                    </div>
                  </>
                )}
              </div>              
              
              {/* Ticket Management Section */}
              <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <div className="flex justify-between items-center mb-4">
                  <Subheading className="text-blue-700">Ticket Management</Subheading>
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
                    {priorities.map(priority => (
                      <option key={priority.id} value={priority.name}>
                        {priority.name}
                      </option>
                    ))}
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
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>               
                {/* Tickets Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse border border-gray-200">
                    <thead className="bg-gray-50">
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
                        </th>                        <th 
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
                        <th 
                          onClick={() => handleSort('assignedStaff')}
                          className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100"
                        >
                          Assigned Staff {getSortIcon('assignedStaff')}
                        </th>
                        <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedTickets.length > 0 ? sortedTickets.map((ticket) => (
                        <tr key={ticket.id} className={`hover:bg-gray-50 ${ticket.note ? 'bg-blue-50' : ''}`}>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap flex items-center gap-2">
                            {ticket.id}
                            {ticket.note && (
                              <span className="relative group cursor-pointer">
                                <FaStickyNote className="text-blue-500" />
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 z-10 hidden group-hover:block bg-white border border-gray-300 rounded shadow-md px-3 py-2 text-xs text-gray-800 min-w-[180px] max-w-xs">
                                  {ticket.note}
                                </span>
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.subject}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.name}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.email}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{new Date(ticket.lastUpdated).toLocaleDateString()}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.category}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                            <select
                              value={ticket.priority?.name || ''}
                              onChange={async (e) => {
                                // Map priority name to id
                                const priorityMap = { High: 1, Medium: 2, Low: 3 };
                                const selectedName = e.target.value;
                                const newPriorityId = priorityMap[selectedName] || null;
                                try {
                                  if (newPriorityId) {
                                    await authService.updateAdminTicketPriority(ticket.id, newPriorityId);
                                    // Update local state to reflect the new priority
                                    setTickets(prev =>
                                      prev.map(t =>
                                        t.id === ticket.id
                                          ? { ...t, priority: { name: selectedName } }
                                          : t
                                      )
                                    );
                                  }
                                } catch (err) {
                                  alert('Failed to update priority');
                                }
                              }}
                              className="p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                            >
                              <option value="">None</option>
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                          </td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.status}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                            {loading ? (
                              <div className="animate-pulse bg-gray-200 h-6 w-24 rounded"></div>
                            ) : ticket.assignedStaff ? (
                              <div className="flex flex-col">
                                <Text weight="medium" size="sm">{ticket.assignedStaff.name}</Text>
                                <Text color="text-gray-500" size="xs">ID: {ticket.assignedStaff.id}</Text>
                              </div>
                            ) : (
                              <PrimaryButton
                                onClick={() => handleAssignTicket(ticket.id)}
                                className="text-xs px-2 py-1"
                              >
                                Assign
                              </PrimaryButton>
                            )}
                          </td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                            <SecondaryButton
                              onClick={() => handleViewTicket(ticket.id)}
                              className="mr-3"
                            >
                              View
                            </SecondaryButton>
                            {ticket.assignedStaff && (
                              <PrimaryButton
                                onClick={() => handleAssignTicket(ticket.id)}
                                className="text-xs"
                              >
                                Reassign
                              </PrimaryButton>
                            )}
                          </td>
                        </tr>                      )) : (
                        <tr>
                          <td colSpan="10" className="p-3 text-center">
                            <Text color="text-gray-500" size="sm">No tickets found.</Text>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Staff Section */}
              <div className="mt-6">
                {/* Add this container for the header and button */}
                <div className="flex justify-between items-center mb-6">
                  <Subheading className="text-blue-700">Staff Management</Subheading>
                  <div className="flex gap-2">
                    <button 
                      onClick={handleStaffRefresh} 
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
                    <PrimaryButton
                      onClick={handleAddStaff}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xl">+</span>
                      Add Staff
                    </PrimaryButton>
                  </div>
                </div>
                
                {/* Existing staff grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {staffPerformance.map((staff) => (
                    <StaffCard 
                      key={staff.staff_id} 
                      staff={staff} 
                      onEdit={handleEditStaff}
                    />
                  ))}
                </div>
              </div>
              
              {/* Placeholder for the modal - we'll work on this later */}
              {isAddStaffModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-lg">
                    <h2>Add Staff Modal</h2>
                    <button onClick={() => setIsAddStaffModalOpen(false)}>Close</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Assign Staff Modal */}
      <AssignStaffModal
        isOpen={isAssignModalOpen}
        onClose={handleCloseAssignModal}
        onAssign={handleStaffAssignment}
        staffList={staffPerformance}
        ticketId={selectedTicketId}
      />

      {/* Staff Edit Modal */}
      <StaffEditModal
        isOpen={isAddStaffModalOpen}
        mode={selectedStaff ? "edit" : "add"}
        onClose={() => {
          setIsAddStaffModalOpen(false);
          setSelectedStaff(null);
        }}
        onSave={handleSaveStaff}
        staffData={selectedStaff}
      />      
      
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Success Modal for staff assignment */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
      />
    </div>
  );
}

export default AdminDashboard;