import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStickyNote } from 'react-icons/fa';

import PrimaryButton from '../components/buttons/PrimaryButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import AssignStaffModal from '../components/AssignStaffModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { PageTitle, Text, Subheading, StatText } from '../components/text';
import StaffCard from '../components/StaffCard';
import StaffEditModal from '../components/StaffEditModal';

function AdminDashboard() {
  const navigate = useNavigate();  const [tickets, setTickets] = useState([
    {
      id: 'TKT-001',
      title: 'Payment Failure',
      name: 'John Doe',
      email: 'john@example.com',
      createdAt: '2025-05-27T10:30:00Z',
      lastUpdated: '2025-05-27T15:45:22.123Z',
      category: 'Billing',
      priority: 'High',
      status: 'Pending',
      assignedStaff: null,
      note: 'Follow up with billing team about payment confirmation.' // <-- Example note for tooltip
    },
    {
      id: 'TKT-002',
      title: 'Technical Issue',
      name: 'Jane Smith',
      email: 'jane@example.com',
      createdAt: '2025-05-26T14:20:00Z',
      lastUpdated: '2025-05-28T09:12:34.456Z',
      category: 'Technical',
      priority: 'Medium',
      status: 'In Progress',
      assignedStaff: null
    },
    {      id: 'TKT-003',
      title: 'Service Request',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      createdAt: '2025-05-25T09:15:00Z',
      lastUpdated: '2025-05-27T11:30:15.789Z',
      category: 'Service',
      priority: 'Low',
      status: 'Resolved',
      assignedStaff: { id: 'STF001', name: 'John Smith' }
    }
  ]);

  const [stats] = useState({
    total: 10,
    pending: 2,
    inProgress: 5,
    resolved: 2,
    cancelled: 1
  });  const [staffPerformance] = useState([
    {
      id: 'STF001',
      name: 'John Smith',
      assigned: 45,
      resolved: 38,
      activelyAssigned: true,
      resolutionRate: '84%'
    },
    {
      id: 'STF002',
      name: 'Sarah Johnson',
      assigned: 52,
      resolved: 45,
      activelyAssigned: true,
      resolutionRate: '87%'
    },
    {
      id: 'STF003',
      name: 'Mike Wilson',
      assigned: 38,
      resolved: 35,
      activelyAssigned: false,
      resolutionRate: '92%'
    },
    {
      id: 'STF004',
      name: 'Emily Chen',
      assigned: 28,
      resolved: 26,
      activelyAssigned: true,
      resolutionRate: '93%'
    },
    {
      id: 'STF005',
      name: 'David Rodriguez',
      assigned: 33,
      resolved: 31,
      activelyAssigned: false,
      resolutionRate: '94%'
    }
  ]);

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

  const handleViewTicket = (ticketId) => {
    navigate(`/admin/ticket/${ticketId}`);
  };
  const handleAssignTicket = (ticketId) => {
    setSelectedTicketId(ticketId);
    setIsAssignModalOpen(true);
  };
  const handleStaffAssignment = (ticketId, staffId, staffName) => {
    // Update the tickets state with the assigned staff
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === ticketId 
          ? { ...ticket, assignedStaff: { id: staffId, name: staffName } }
          : ticket
      )
    );
    
    console.log(`Assigned ticket ${ticketId} to staff ${staffName} (ID: ${staffId})`);
    alert(`Ticket ${ticketId} has been assigned to ${staffName}!`);
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
    setSelectedStaff(staff); // Store selected staff data
    setIsAddStaffModalOpen(true);
  };
  const handleSaveStaff = (formData) => {
    // TODO: When implementing backend:
    // 1. Determine if this is an add or edit operation
    // 2. Make appropriate API call (POST for new, PUT for edit)
    // 3. Update local state accordingly
    if (selectedStaff) {
      // Edit existing staff
      console.log('Editing staff:', formData);
    } else {
      // Add new staff
      console.log('Adding new staff:', formData);
    }
    setIsAddStaffModalOpen(false);
    setSelectedStaff(null);
  };
  const handleDeactivateClick = (staffId) => {
    setSelectedStaffId(staffId);
    setIsDeactivateModalOpen(true);
  };
  const handleConfirmDeactivate = () => {
    // Add your deactivation logic here
    console.log(`Deactivating staff member ${selectedStaffId}`);
    setIsDeactivateModalOpen(false);
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
    return sortConfig.direction === 'asc' ? 
      <span className="text-blue-600">↑</span> : 
      <span className="text-blue-600">↓</span>;
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
                activeTab === 'tickets' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-600'
              }`}
              onClick={() => setActiveTab('tickets')}
            >
              Tickets
            </button>
            <button
              className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                activeTab === 'staffs' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-600'
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
                <div className="bg-white p-4 rounded-lg shadow-md text-center">
                  <StatText value={stats.total} label="Total" />
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
                <div className="bg-red-100 p-4 rounded-lg shadow-md">
                  <StatText value={stats.cancelled} label="Cancelled" valueColor="red" labelColor="red" />
                </div>
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
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.title}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.name}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.email}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{new Date(ticket.lastUpdated).toLocaleDateString()}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.category}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                            <select defaultValue={ticket.priority} className="p-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white">
                              <option>High</option>
                              <option>Medium</option>
                              <option>Low</option>
                            </select>
                          </td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">{ticket.status}</td>
                          <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                            {ticket.assignedStaff ? (
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
                      key={staff.id} 
                      staff={staff} 
                      onDeactivate={handleDeactivateClick}
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

      {/* Confirmation Modal for Deactivation */}
      <ConfirmationModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onConfirm={handleConfirmDeactivate}
        title="Deactivate Staff Member"
        message="Are you sure you want to deactivate this staff member? This action cannot be undone."
      />

      {/* Staff Edit Modal */}
      <StaffEditModal
        isOpen={isAddStaffModalOpen}
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


