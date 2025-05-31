import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import PrimaryButton from './buttons/PrimaryButton';
import SecondaryButton from './buttons/SecondaryButton';
import { Text, Label } from './text';

function AssignStaffModal({ isOpen, onClose, onAssign, staffList, ticketId }) {
  const [selectedStaff, setSelectedStaff] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // filter staff based on search query
  const filteredStaff = useMemo(() => {
    if (!searchQuery) return staffList;
    
    const searchLower = searchQuery.toLowerCase();
    return staffList.filter(staff => 
      staff.name.toLowerCase().includes(searchLower) ||
      staff.id.toString().includes(searchLower)
    );
  }, [staffList, searchQuery]);

  const handleAssign = () => {
    if (selectedStaff) {
      const staff = staffList.find(s => s.id === selectedStaff);
      onAssign(ticketId, selectedStaff, staff?.name);
      handleClose();
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
    <Modal isOpen={isOpen} onClose={handleClose} title={`Assign Ticket ${ticketId}`} actions={ <>
          <SecondaryButton onClick={handleClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton onClick={handleAssign} disabled={!selectedStaff}>
            Assign Ticket
          </PrimaryButton>
        </>
      }
    >
      <div className="space-y-4">
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
            {filteredStaff.length === 0 ? (
              <div className="p-4 text-center">
                <Text color="text-gray-500">No staff members found.</Text>
              </div>
            ) : (
              filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    selectedStaff === staff.id ? 'bg-bianca-background/30 border-bianca-primary/30' : ''
                  }`}
                  onClick={() => handleStaffSelect(staff.id)}
                >
                  <div className="flex justify-between items-center">                    <div>
                      <Text weight="medium">{staff.name}</Text>
                      <Text size="sm" color="text-gray-600">ID: {staff.id}</Text>
                    </div>
                    <div className="text-right">
                      <Text size="sm" color="text-gray-600">
                        Resolution Rate: <span className="font-medium text-green-600">{staff.resolutionRate || '0%'}</span>
                      </Text>
                      <div className="flex items-center justify-end mt-1">
                        <Text size="xs" color="text-gray-600">Status: </Text>
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${staff.activelyAssigned ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {staff.activelyAssigned ? 'Active' : 'Available'}
                        </span>
                      </div>
                    </div>
                    {selectedStaff === staff.id && (
                      <div className="ml-2">
                        <div className="w-4 h-4 bg-bianca-primary rounded-full flex items-center justify-center">
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
              Selected: {staffList.find(s => s.id === selectedStaff)?.name} (ID: {selectedStaff})
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default AssignStaffModal;