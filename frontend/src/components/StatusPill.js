import React from 'react';
import PropTypes from 'prop-types';

function getStatusStyle(status) {
  switch (status) {
    case 'Pending':
      return 'px-2 py-1 text-yellow-800 bg-yellow-200 rounded-full';
    case 'In Progress':
      return 'px-2 py-1 text-purple-800 bg-purple-200 rounded-full';
    case 'Resolved':
      return 'px-2 py-1 text-green-800 bg-green-400 rounded-full';
    case 'Cancelled':
      return 'px-2 py-1 text-red-800 bg-red-200 rounded-full';
    default:
      return 'px-2 py-1 text-gray-800 bg-gray-200 rounded-full';
  }
}

const StatusPill = ({ status }) => (
  <span className={getStatusStyle(status)}>{status}</span>
);

StatusPill.propTypes = {
  status: PropTypes.string.isRequired,
};

export default StatusPill;
