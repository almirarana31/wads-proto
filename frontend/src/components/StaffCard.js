import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Text } from './text';
import PrimaryButton from './buttons/PrimaryButton';

const StaffCard = ({ staff, onEdit }) => {
  const [isGuest, setIsGuest] = useState(staff.is_guest);
  const [loading, setLoading] = useState(false);

  // Update local state whenever staff prop changes
  useEffect(() => {
    setIsGuest(staff.is_guest);
  }, [staff.is_guest]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <Text weight="bold" size="xl" className="mb-3">{staff.staff_name}</Text>
      <div className="flex items-center justify-between mb-2">
        <Text color="text-gray-600" size="sm">Resolution Rate:</Text>
        <span className="font-medium text-green-600">{staff.resolution_rate}%</span>
      </div>
      <div className="flex items-center justify-between mb-2">
        <Text color="text-gray-600" size="sm">Status:</Text>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          !isGuest ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {!isGuest ? 'Active' : 'Inactive'}
        </span>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
        <Text color="text-gray-500" size="xs">
          Total tickets: <span className="font-medium">{staff.in_progress || 0}</span> in progress / 
          <span className="font-medium">{staff.resolved || 0}</span> resolved
        </Text>
        <div className="flex gap-2">
          <PrimaryButton 
            onClick={() => onEdit(staff)}
            className="text-xs px-3 py-1"
          >
            Edit
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};

StaffCard.propTypes = {
  staff: PropTypes.shape({
    staff_id: PropTypes.number.isRequired,
    staff_name: PropTypes.string.isRequired,
    resolution_rate: PropTypes.string,
    in_progress: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    resolved: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }).isRequired,
  onEdit: PropTypes.func.isRequired
};

export default StaffCard;