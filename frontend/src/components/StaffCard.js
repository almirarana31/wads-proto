import React from 'react';
import PropTypes from 'prop-types';
import { Text } from './text';
import PrimaryButton from './buttons/PrimaryButton';

const StaffCard = ({ staff, onEdit }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <Text weight="bold" size="xl" className="mb-3">{staff.name}</Text>
      <div className="flex items-center justify-between mb-2">
        <Text color="text-gray-600" size="sm">Resolution Rate:</Text>
        <span className="font-medium text-green-600">{staff.resolutionRate}</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <Text color="text-gray-600" size="sm">Actively Assigned:</Text>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          staff.activelyAssigned ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {staff.activelyAssigned ? 'Yes' : 'No'}
        </span>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
        <Text color="text-gray-500" size="xs">
          Total tickets: <span className="font-medium">{staff.assigned}</span> assigned / 
          <span className="font-medium">{staff.resolved}</span> resolved
        </Text>
        <PrimaryButton 
          onClick={() => onEdit(staff)}
          className="text-xs px-3 py-1"
        >
          Edit
        </PrimaryButton>
      </div>
    </div>
  );
};

StaffCard.propTypes = {
  staff: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    resolutionRate: PropTypes.string.isRequired,
    activelyAssigned: PropTypes.bool.isRequired,
    assigned: PropTypes.number.isRequired,
    resolved: PropTypes.number.isRequired
  }).isRequired,
  onEdit: PropTypes.func.isRequired
};

export default StaffCard;