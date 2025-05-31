import React, { useState, useMemo, useEffect } from 'react';
import { PageTitle, Subheading, Text } from '../components/text';
import SecondaryButton from '../components/buttons/SecondaryButton';
import PrimaryButton from '../components/buttons/PrimaryButton';
import PriorityPill from '../components/PriorityPill';
import Modal from '../components/Modal';
import { authService } from '../api/authService';

// This page shows the shared pool of tickets for staff to claim
function StaffTicketQueuePage({ staffCategory = 'Billing', onClaimTicket }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  // State for actual tickets from backend
  const [tickets, setTickets] = useState([]);
  const [claimedTickets, setClaimedTickets] = useState([]);
  const [assignedTicketCount, setAssignedTicketCount] = useState(0); // Count from backend
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCountLoading, setIsCountLoading] = useState(true); // New loading state for count
  const [error, setError] = useState(null);

  // Fetch ticket pool and assigned ticket count on component mount
  useEffect(() => {
    refreshData();
  }, []);

  // Combined refresh function
  const refreshData = async () => {
    fetchTicketPool();
    fetchAssignedTicketCount();
  };

  // Function to fetch the current count of assigned tickets for the staff
  const fetchAssignedTicketCount = async () => {
    try {
      setIsCountLoading(true);
      // We need to count tickets that are "In Progress" which corresponds to status_id: 2
      const response = await authService.getStaffTickets('status=In Progress');
      if (response && Array.isArray(response)) {
        setAssignedTicketCount(response.length);
        console.log(`Current assigned ticket count: ${response.length}`);
      }
    } catch (err) {
      console.error('Error fetching assigned ticket count:', err);
    } finally {
      setIsCountLoading(false);
    }
  };

  const fetchTicketPool = async () => {
    try {
      setIsLoading(true);
      const response = await authService.getTicketPool();
      
      // Transform backend data to match frontend structure
      const formattedTickets = response.map(ticket => {
        // Map category IDs to display names
        let categoryName = 'General';
        if (ticket.Category) {
          switch (ticket.Category.name) {
            case '1': categoryName = 'General'; break;
            case '2': categoryName = 'Billing'; break;
            case '3': categoryName = 'IT Support/Technical'; break;
            default: categoryName = ticket.Category?.name || 'General'; // Fall back to the name if it's already a string
          }
        }
        
        return {
          id: `TKT-${ticket.id.toString().padStart(3, '0')}`,
          rawId: ticket.id,  // Keep the original ID for API calls
          title: ticket.subject,
          name: ticket.User?.username || 'Unknown',
          email: ticket.User?.email || 'N/A',
          createdAt: ticket.createdAt,
          lastUpdated: ticket.updatedAt || ticket.createdAt,
          category: categoryName,
          priority: ticket.Priority?.name || 'Medium',
          status: 'Pending', // Since these are tickets in the pool, they're all pending
          assignedTo: null
        };
      });
      
      setTickets(formattedTickets);
      setError(null);
    } catch (err) {
      console.error('Error fetching ticket pool:', err);
      setError(`Failed to load ticket pool: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Only show tickets not already claimed by this staff
  const filteredTickets = tickets.filter(ticket => 
    !claimedTickets.some(t => t.id === ticket.id)
  );
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
    return sortConfig.direction === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
  };
  const sortedTickets = useMemo(() => {
    let sortableTickets = [...filteredTickets];
    if (sortConfig.key) {
      sortableTickets.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === 'createdAt') {
          aValue = new Date(aValue);
          bValue = new Date(bValue);
        }
        if (sortConfig.key === 'priority') {
          const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          aValue = priorityOrder[aValue] || 0;
          bValue = priorityOrder[bValue] || 0;
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableTickets;
  }, [filteredTickets, sortConfig]);
  // Utility function for priority pill styling
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
  }  // Claim handler (opens modal)
  const handleClaimClick = (ticket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };  // Confirm claim
  const confirmClaim = async () => {
    if (assignedTicketCount < 5 && selectedTicket) {
      try {
        // Call API to claim the ticket
        const response = await authService.claimTicket(selectedTicket.rawId);
        console.log('Claim response:', response);
        
        // Notify parent component (for dashboard refresh)
        if (onClaimTicket) onClaimTicket(selectedTicket);
        
        // Refresh data to get updated counts and ticket pool
        refreshData();
        
        // Show success notification (could use a toast component instead of alert in a real app)
        alert(`Successfully claimed ticket: ${selectedTicket.id}`);
      } catch (err) {
        console.error('Error claiming ticket:', err);
        alert(`Failed to claim ticket: ${err.response?.data?.message || err.message || 'Unknown error'}`);
      }
    } else if (assignedTicketCount >= 5) {
      alert('You have reached the maximum limit of 5 claimed tickets.');
    }
    setModalOpen(false);
    setSelectedTicket(null);
  };return (
    <div className="bg-white p-6 md:p-10 rounded shadow-md max-w-[1200px] mx-auto mt-8">      <PageTitle title="Ticket Queue" subtitle={`Shared pool of unassigned tickets`} className="mb-8" />
        <div className="flex justify-between items-center mb-4">
        <Text color="gray">
          You have {isCountLoading ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-bianca-primary border-r-transparent align-[-0.125em] ml-1 mr-1"></span>
          ) : (
            <span className="font-bold">{assignedTicketCount}</span>
          )} / 5 active tickets assigned to you
        </Text>        <button 
          onClick={refreshData} 
          className="flex items-center px-4 py-2 bg-bianca-primary text-white rounded hover:bg-bianca-primary/80 transition-colors"
          disabled={isLoading || isCountLoading}
        >
          {isLoading ? (
            <span className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Refresh
        </button>
      </div>
      
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="text-center p-6">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-bianca-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-600">Loading ticket pool...</p>
          </div>
        ) : error ? (
          <div className="text-center p-6">
            <div className="flex items-center justify-center mb-4 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Ticket Pool</h3>
            <p className="text-gray-700 mb-4">{error}</p>            <button 
              onClick={fetchTicketPool} 
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
                <th onClick={() => handleSort('priority')} className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200 cursor-pointer hover:bg-gray-100">Priority {getSortIcon('priority')}</th>
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
                  <td className="p-3 text-sm text-gray-700 whitespace-nowrap">
                    <PriorityPill priority={ticket.priority} />
                  </td>                  <td className="p-3 text-sm whitespace-nowrap">
                    <SecondaryButton
                      onClick={() => handleClaimClick(ticket)}
                      disabled={assignedTicketCount >= 5}
                      className={assignedTicketCount >= 5 ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      {assignedTicketCount >= 5 ? "Max Claimed" : "Claim"}
                    </SecondaryButton>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="p-3 text-sm text-gray-500 text-center">
                    No unassigned tickets in the queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedTicket(null); }}
        title="Are you sure you want to claim this ticket?"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <SecondaryButton onClick={() => { setModalOpen(false); setSelectedTicket(null); }}>
              Cancel
            </SecondaryButton>            <PrimaryButton 
              onClick={confirmClaim} 
              disabled={assignedTicketCount >= 5}
              className={assignedTicketCount >= 5 ? "opacity-50" : ""}
            >
              Yes, Claim
            </PrimaryButton>
          </div>
        }
      >
        {selectedTicket && (
          <div className="space-y-2">
            <Text><span className="font-semibold">ID:</span> {selectedTicket.id}</Text>
            <Text><span className="font-semibold">Title:</span> {selectedTicket.title}</Text>
            <Text><span className="font-semibold">Name:</span> {selectedTicket.name}</Text>
            <Text><span className="font-semibold">Email:</span> {selectedTicket.email}</Text>
            <Text><span className="font-semibold">Created:</span> {new Date(selectedTicket.createdAt).toLocaleString()}</Text>
            <Text><span className="font-semibold">Priority:</span> <PriorityPill priority={selectedTicket.priority} /></Text>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default StaffTicketQueuePage;
