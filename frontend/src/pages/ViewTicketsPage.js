import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketCard from '../components/TicketCard';
import PrimaryButton from '../components/buttons/PrimaryButton';
import { PageTitle, Text, Label } from '../components/text';
import { authService } from '../api/authService';

function ViewTicketsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All status');
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('User');
  const [isLoadingUsername, setIsLoadingUsername] = useState(true);
    // Fetch user details and tickets from API when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);        // Fetch user details to get username
        setIsLoadingUsername(true);
        try {
          const userDetails = await authService.getUserDetail();
          if (userDetails && userDetails.username) {
            setUsername(userDetails.username);
          }
        } catch (userErr) {
          console.error('Error fetching user details:', userErr);
          
          // Try to get user info from local storage as fallback
          try {
            const currentUser = localStorage.getItem('currentUser') || sessionStorage.getItem('user');
            if (currentUser) {
              const userData = JSON.parse(currentUser);
              if (userData.username) {
                setUsername(userData.username);
              }
            }
          } catch (parseErr) {
            console.error('Error parsing stored user data:', parseErr);
          }
        } finally {
          setIsLoadingUsername(false);
        }
        
        // Fetch tickets
        const response = await authService.getUserTickets();        // Transform backend data to match frontend structure if needed
        const formattedTickets = response.tickets.map(ticket => {
          const rawId = ticket.id || ticket.ticketId;
          return {
            id: `TKT-${rawId.toString().padStart(3, '0')}`,
            rawId: rawId, // Keep the raw ID for API calls
            title: ticket.subject,
            description: ticket.description,
            status: ticket.Status ? ticket.Status.name : ticket.status,
            category: ticket.Category ? ticket.Category.name : ticket.category,
            created: ticket.createdAt || ticket.created,
            unreadResponses: ticket.unreadResponses || 0
          };
        });
        
        setTickets(formattedTickets);
        setError(null);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('Failed to load tickets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

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
  const handleViewDetails = (ticketId, rawId) => {
    // If rawId is provided, use that for the API call
    // Otherwise, extract the raw ID if the ticket ID is formatted as "TKT-XXX"
    const idForApi = rawId || (ticketId.startsWith('TKT-') ? ticketId.substring(4).replace(/^0+/, '') : ticketId);
    navigate(`/ticket/${idForApi}`);
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
        (ticket.id && ticket.id.toString().toLowerCase().includes(query)) ||
        (ticket.title && ticket.title.toLowerCase().includes(query)) ||
        (ticket.description && ticket.description.toLowerCase().includes(query)) ||
        (ticket.category && ticket.category.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
  
  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-md shadow-md p-8">
          {/* Page Header */}          <PageTitle 
            title="Your Tickets"
            subtitle={
              <>
                Welcome <span className={`underline ${isLoadingUsername ? 'opacity-70' : ''}`}>
                  {isLoadingUsername ? 'User' : username}
                  {isLoadingUsername && (
                    <span className="inline-block w-4 h-4 ml-1 border-t-2 border-blue-500 border-r-2 rounded-full animate-spin"></span>
                  )}
                </span>, here are your submitted tickets
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
                <Label className="mr-2">Filter by status:</Label>
                <select
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
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-10">
              <Text color="text-gray-500">Loading tickets...</Text>
            </div>
          )}
          
          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-10">
              <Text color="text-red-500">{error}</Text>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          )}
          
          {/* Ticket List */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-10 col-span-full">
                  <Text color="text-gray-500">No tickets found matching your criteria.</Text>
                </div>
              ) : (                filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onViewDetails={() => handleViewDetails(ticket.id, ticket.rawId)}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewTicketsPage;