import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStickyNote } from 'react-icons/fa';

import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import AssignStaffModal from '../components/AssignStaffModal';
import { PageTitle, Text, Subheading, StatText } from '../components/text';
import StaffCard from '../components/StaffCard';
import StaffEditModal from '../components/StaffEditModal';
import { authService } from '../api/authService';

function AdminDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTickets() {
      try {
        setLoading(true);
        const data = await authService.getAdminTickets();
        
        // Map and check staff assignment for each ticket
        const ticketsWithStaff = await Promise.all(data.map(async ticket => {
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

        setTickets(ticketsWithStaff);
      } catch (err) {
        setError('Failed to fetch tickets');
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
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [priorities, setPriorities] = useState([]);
  const [categories, setCategories] = useState([]);

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

  const handleViewTicket = (ticketId) => {
    navigate(`/admin/ticket/${ticketId}`);
  };
  const handleAssignTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setIsAssignModalOpen(true);
  };
  const handleStaffAssignment = async (ticketId, staffId, staffName) => {
    try {
      await authService.assignTicketToStaff(ticketId, staffId);
      
      // Update UI
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === ticketId 
            ? { ...ticket, assignedStaff: { id: staffId, name: staffName }, status: 'In Progress' }
            : ticket
        )
      );
      
      alert(`Ticket ${ticketId} has been assigned to ${staffName}!`);
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      alert('Failed to assign ticket. Please try again.');
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
  const handleDeactivateClick = (staffId) => {
    if (window.confirm("Are you sure you want to deactivate this staff member? This action cannot be undone.")) {
      handleConfirmDeactivate(staffId);
    }
  };
  const handleConfirmDeactivate = (staffId) => {
    // Add your deactivation logic here
    console.log(`Deactivating staff member ${staffId}`);
    setSelectedStaffId(null);
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
    return (
      // Search by ticket ID (as string), subject, username, or email
      ticket.id.toString().includes(searchLower) ||
      (ticket.subject || '').toLowerCase().includes(searchLower) ||
      (ticket.name || '').toLowerCase().includes(searchLower) ||
      (ticket.email || '').toLowerCase().includes(searchLower)
    ) &&
    (filters.priority === 'All priority' || (ticket.priority || '') === filters.priority) &&
    (filters.status === 'All status' || (ticket.status || '') === filters.status) &&
    (filters.category === 'All category' || (ticket.category || '') === filters.category)
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
  return (
    <div className="min-h-screen py-6 sm:py-12 px-4">
      <div className="bg-white p-6 md:p-10 rounded shadow-md max-w-auto mx-auto">
        <div className="max-w-7xl mx-auto">
          <PageTitle 
            title="Admin Dashboard"
            subtitle={
              <>
                Welcome <span className="font-medium text-blue-600">Admin</span>, manage your dashboard here
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
                <Subheading className="text-blue-700">Ticket Management</Subheading>
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
                    <option value="Technical">IT Support</option>
                    <option value="General">General</option>
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
                  <PrimaryButton
                    onClick={handleAddStaff}
                    className="flex items-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    Add Staff
                  </PrimaryButton>
                </div>
                
                {/* Existing staff grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {staffPerformance.map((staff) => (
                    <StaffCard 
                      key={staff.staff_id} 
                      staff={staff} 
                      onDeactivate={() => handleDeactivateClick(staff.staff_id)}
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
    </div>
  );
}

export default AdminDashboard;