import React, { useState, useMemo, useEffect } from 'react';
import Modal from './Modal';
import PrimaryButton from './buttons/PrimaryButton';
import SecondaryButton from './buttons/SecondaryButton';
import { Text, Label } from './text';
import { authService } from '../api/authService';

function AssignStaffModal({ isOpen, onClose, onAssign, ticketId }) {
  const [selectedStaff, setSelectedStaff] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available staff when modal opens
  useEffect(() => {
    async function fetchEligibleStaff() {
      if (!isOpen || !ticketId) return;
      
      try {
        setLoading(true);
        setError(null);
        setStaffList([]);
          const ticketDetails = await authService.getTicketDetail(ticketId);
        const allStaffData = await authService.getAdminStaffPerformance();
        
        // Get the currently assigned staff ID for this ticket to exclude later
        const currentlyAssignedStaffId = ticketDetails.staff_id;
          console.log('Raw ticket details:', ticketDetails);
        console.log('All staff data:', allStaffData);
        console.log('Currently assigned staff ID:', currentlyAssignedStaffId);
        
        const staffDetails = await Promise.all(
          allStaffData.map(async (staff) => {
            const details = await authService.getAdminStaffDetail(staff.staff_id);
            console.log(`Staff ${staff.staff_id} details:`, details);
            return {
              ...staff,
              field_name: details[0]?.field_name,
              field_id: details[0]?.field_id
            };
          })
        );
        
        console.log('Staff details after mapping:', staffDetails);        // Filter staff to include all eligible staff regardless of current assignment
        // This shows all staff matching the category, not just the currently assigned one
        console.log('Ticket category name:', ticketDetails.Category?.name);
        
        const eligibleStaff = staffDetails.filter(staff => {
          const matchesCategory = staff.field_name === ticketDetails.Category.name;
          const isActive = !staff.is_guest;
          console.log(`Staff ${staff.staff_id} (${staff.staff_name}) - Match category: ${matchesCategory}, Active: ${isActive}, Field: ${staff.field_name}`);
          return matchesCategory && isActive;
        });
        
        console.log('Eligible staff after filtering:', eligibleStaff);        const formattedStaff = eligibleStaff.map(staff => ({          staff_id: staff.staff_id,
          name: staff.staff_name,
          field_name: staff.field_name,
          resolution_rate: `${staff.resolution_rate}%`,
          in_progress: staff.assigned - staff.resolved,
          resolved: staff.resolved,
          is_guest: false,
          isCurrentlyAssigned: staff.is_current_staff || (staff.staff_id === ticketDetails.staff_id)
        }));

        console.log('Formatted staff to display:', formattedStaff);
        console.log('Currently assigned staff highlighted:', 
          formattedStaff.filter(staff => staff.isCurrentlyAssigned));

        setStaffList(formattedStaff);

      } catch (err) {
        setError('Failed to load available staff members');
      } finally {
        setLoading(false);
      }
    }

    fetchEligibleStaff();
  }, [isOpen, ticketId]);
  // filter staff based on search query
  const filteredStaff = useMemo(() => {
    console.log('Filtering staff list with search query:', searchQuery);
    console.log('Current staff list to filter:', staffList);
    
    let result;
    if (!searchQuery) {
      result = staffList.filter(staff => !staff.is_guest);
    } else {
      const searchLower = searchQuery.toLowerCase();
      result = staffList.filter(staff => {
        const nameMatch = staff.name?.toLowerCase().includes(searchLower);
        const idMatch = staff.staff_id?.toString().includes(searchLower);
        return (nameMatch || idMatch) && !staff.is_guest;
      });
    }
    
    console.log('Filtered staff to display:', result);
    return result;
  }, [staffList, searchQuery]);
  const handleAssign = async () => {
    if (selectedStaff) {
      const staff = staffList.find(s => s.staff_id === selectedStaff);
      try {
        console.log(`Calling API to assign staff: PATCH /admin/tickets/${ticketId}/staff`, { 
          ticketId, 
          staffId: selectedStaff,
          staffName: staff?.name 
        });
        
        await authService.assignTicketToStaff(ticketId, selectedStaff);
        console.log(`Staff assignment successful for ticket ${ticketId} to staff ${selectedStaff}`);
        
        onAssign(ticketId, selectedStaff, staff?.name);
        handleClose();
      } catch (err) {
        console.error(`Staff assignment failed:`, err);
        setError('Failed to assign ticket');
      }
    }
  };

  const handleClose = () => {
    setSelectedStaff('');
    setSearchQuery('');
    onClose();
  };

  const handleStaffSelect = (staffId) => {
    setSelectedStaff(staffId);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Assign Ticket ${ticketId}`} actions={
      <>
        <SecondaryButton onClick={handleClose}>
          Cancel
        </SecondaryButton>
        <PrimaryButton onClick={handleAssign} disabled={!selectedStaff}>
          Assign Ticket
        </PrimaryButton>
      </>
    }>
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <Text color="text-red-600">{error}</Text>
          </div>
        )}

        <div>
          <Label>Search Staff Members:</Label>
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div>
          <Label>Select Staff Member:</Label>
          <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md">
            {loading ? (
              <div className="p-4 text-center">
                <Text color="text-gray-500">Loading staff members...</Text>
              </div>
            ) : filteredStaff.length === 0 ? (
              <div className="p-4 text-center">
                <Text color="text-gray-500">No staff members found.</Text>
              </div>
            ) : (
              filteredStaff.map((staff) => (                <div
                  key={staff.staff_id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    selectedStaff === staff.staff_id ? 'bg-blue-50 border-blue-200' : ''
                  } ${staff.isCurrentlyAssigned ? 'bg-yellow-50' : ''}`}
                  onClick={() => handleStaffSelect(staff.staff_id)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <Text weight="medium">{staff.name}</Text>
                        {staff.isCurrentlyAssigned && (
                          <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Currently assigned
                          </span>
                        )}
                      </div>
                      <Text size="sm" color="text-gray-600">ID: {staff.staff_id}</Text>
                    </div>
                    <div className="text-right">
                      <Text size="sm" color="text-gray-600">
                        Resolution Rate: <span className="font-medium text-green-600">{staff.resolution_rate}</span>
                      </Text>
                      <Text size="xs" color={staff.is_guest ? 'text-red-600' : 'text-green-600'}>
                        {staff.is_guest ? 'Inactive' : 'Active'}
                      </Text>
                    </div>
                    {selectedStaff === staff.id && (
                      <div className="ml-2">
                        <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedStaff && (
          <div className="p-3 bg-bianca-background/30 border border-bianca-primary/30 rounded-md">
            <Text size="sm" color="text-blue-800">
              Selected: {staffList.find(s => s.staff_id === selectedStaff)?.name} 
              (ID: {selectedStaff})
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default AssignStaffModal;