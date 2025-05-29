import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketCard from '../components/TicketCard';
import PrimaryButton from '../components/buttons/PrimaryButton';
import DangerButton from '../components/buttons/DangerButton';
import SecondaryButton from '../components/buttons/SecondaryButton';
import Modal from '../components/Modal';
import { PageTitle, Text, Label } from '../components/text';

function ViewTicketsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All status');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Mock ticket data - in a real app, this would come from API
  const [tickets, setTickets] = useState([
    {
      id: 'TKT-001',
      title: 'Payment Failure',
      description: 'I have already paid, yet my appointment was not made.',
      status: 'Pending',
      category: 'Billing',
      created: '2025-04-16T19:11:36.632Z',
      unreadResponses: 0
    },
    {
      id: 'TKT-002',
      title: 'Payment Failure',
      description: 'I have already paid, yet my appointment was not made.',
      status: 'In Progress',
      category: 'Billing',
      created: '2025-04-16T19:11:36.632Z',
      unreadResponses: 1
    },
    {
      id: 'TKT-003',
      title: 'Payment Failure',
      description: 'I have already paid, yet my appointment was not made.',
      status: 'Resolved',
      category: 'Billing',
      created: '2025-04-16T19:11:36.632Z',
      unreadResponses: 0
    },
    {
      id: 'TKT-004',
      title: 'Refund Request',
      description: 'I would like to request a refund for my last appointment.',      status: 'Pending',
      category: 'Service',
      created: '2025-05-17T16:38:25.632Z',
      unreadResponses: 2
    }
  ]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter dropdown change
  const handleFilterChange = (e) => {
    setFilterStatus(e.target.value);
  };

  // Navigate to submit ticket page
  const handleSubmitNewTicket = () => {
    navigate('/submit-ticket');
  };
  // View ticket details
  const handleViewDetails = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };
  // Handle cancel ticket
  const handleCancelTicket = (ticket) => {
    setSelectedTicket(ticket);
    setIsCancelModalOpen(true);
  };

  // Confirm cancel ticket
  const confirmCancelTicket = () => {
    // Update the ticket status to 'Cancelled'
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === selectedTicket.id
          ? { ...ticket, status: 'Cancelled' }
          : ticket
      )
    );
    console.log('Cancelling ticket:', selectedTicket.id);
    setIsCancelModalOpen(false);
    setSelectedTicket(null);
  };

  // Filter tickets based on search query and status filter
  const filteredTickets = tickets.filter(ticket => {
    // Apply status filter if not "All status"
    if (filterStatus !== 'All status' && ticket.status !== filterStatus) {
      return false;
    }
    
    // Apply search query if any
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        ticket.id.toLowerCase().includes(query) ||
        ticket.title.toLowerCase().includes(query) ||
        ticket.description.toLowerCase().includes(query) ||
        ticket.category.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-md shadow-md p-8">          {/* Page Header */}
          <PageTitle 
            title="Your Tickets"
            subtitle={
              <>
                Welcome <span className="underline">User</span>, here are your submitted tickets
              </>
            }
          />
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search ticket by ID, title, description..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full md:w-80 p-2 border border-gray-300 rounded"
              />
                <div className="flex items-center">
                <Label className="mr-2">Filter by status:</Label>                <select
                  value={filterStatus}
                  onChange={handleFilterChange}
                  className="p-2 border border-gray-300 rounded"
                >
                  <option>All status</option>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Resolved</option>
                  <option>Cancelled</option>
                </select>
              </div>
            </div>
            
            <PrimaryButton
              onClick={handleSubmitNewTicket}
            >
              Submit a Ticket
            </PrimaryButton>
          </div>            {/* Ticket List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-10 col-span-full">
                <Text color="text-gray-500">No tickets found matching your criteria.</Text>
              </div>
            ) : (              filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onViewDetails={handleViewDetails}
                  onCancelTicket={handleCancelTicket}
                />
              ))
            )}
          </div>
        </div>
      </div>      

      {/* Cancel Ticket Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Ticket"
        actions={[
          <SecondaryButton key="cancel" onClick={() => setIsCancelModalOpen(false)}>
            Keep Ticket
          </SecondaryButton>,
          <DangerButton key="confirm" onClick={confirmCancelTicket}>
            Cancel Ticket
          </DangerButton>
        ]}
      >
        <Text>
          Are you sure you want to cancel ticket <strong>{selectedTicket?.id}</strong>: "{selectedTicket?.title}"?
        </Text>
        <Text color="text-red-600" className="mt-2">
          This action cannot be undone. The ticket will be marked as cancelled and no further actions can be taken.
        </Text>
      </Modal>
    </div>
  );
}

export default ViewTicketsPage;