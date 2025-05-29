import React from 'react';
import PropTypes from 'prop-types';

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

const PriorityPill = ({ priority }) => (
  <span className={getPriorityStyle(priority)}>{priority}</span>
);

PriorityPill.propTypes = {
  priority: PropTypes.string.isRequired,
};

export default PriorityPill;
