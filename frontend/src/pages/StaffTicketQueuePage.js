import React, { useState, useMemo } from 'react';
import { PageTitle, Subheading, Text } from '../components/text';
import SecondaryButton from '../components/buttons/SecondaryButton';
import PriorityPill from '../components/PriorityPill';
import Modal from '../components/Modal';

// This page shows the shared pool of tickets for staff to claim
function StaffTicketQueuePage({ staffCategory = 'Billing', onClaimTicket }) {
  // In a real app, fetch these from the backend filtered by staffCategory and unassigned status
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  // Mock tickets for the shared pool
  const tickets = [
    { id: 'TKT-010', title: 'Refund Request', name: 'Alice', email: 'alice@example.com', createdAt: '2025-05-28T10:00:00Z', lastUpdated: '2025-05-29T09:00:00Z', category: 'Billing', priority: 'High', status: 'Pending', assignedTo: null },
    { id: 'TKT-011', title: 'Invoice Error', name: 'Bob', email: 'bob@example.com', createdAt: '2025-05-27T12:00:00Z', lastUpdated: '2025-05-28T15:00:00Z', category: 'Billing', priority: 'Medium', status: 'Pending', assignedTo: null }
  ];
  // Simulate claimed tickets for this staff
  const [claimedTickets, setClaimedTickets] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Only show tickets not already claimed by this staff
  const filteredTickets = tickets.filter(ticket => {
    return (
      ticket.category === staffCategory &&
      !ticket.assignedTo &&
      !claimedTickets.some(t => t.id === ticket.id)
    );
  });
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
  }
  // Claim handler (opens modal)
  const handleClaimClick = (ticket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };
  // Confirm claim
  const confirmClaim = () => {
    if (claimedTickets.length < 2 && selectedTicket) {
      setClaimedTickets([...claimedTickets, selectedTicket]);
      if (onClaimTicket) onClaimTicket(selectedTicket);
    }
    setModalOpen(false);
    setSelectedTicket(null);
  };
  return (
    <div className="bg-white p-6 md:p-10 rounded shadow-md max-w-[1200px] mx-auto mt-8">
      <PageTitle title="Ticket Queue" subtitle={`Shared pool of unassigned ${staffCategory} tickets`} className="mb-8" />
      <div className="mb-4">
        <Text color="gray">You have claimed <span className="font-bold">{claimedTickets.length}</span> / 2 tickets.</Text>
      </div>
      <div className="overflow-x-auto">
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
                </td>
                <td className="p-3 text-sm whitespace-nowrap">
                  <SecondaryButton
                    onClick={() => handleClaimClick(ticket)}
                    disabled={claimedTickets.length >= 2}
                  >
                    Claim
                  </SecondaryButton>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className="p-3 text-sm text-gray-500 text-center">No tickets in the queue.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedTicket(null); }}
        title="Are you sure you want to claim this ticket?"
        actions={
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <SecondaryButton onClick={() => { setModalOpen(false); setSelectedTicket(null); }}>
              Cancel
            </SecondaryButton>
            <SecondaryButton onClick={confirmClaim} disabled={claimedTickets.length >= 2}>
              Yes, Claim
            </SecondaryButton>
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
