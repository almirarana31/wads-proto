import React from 'react';
import PropTypes from 'prop-types';

const ConversationCard = ({ number, startedDate, endedDate, onClick }) => {
  // Format dates for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <h3 className="text-blue-800 font-semibold text-lg mb-2 text-left">
        Conversation {number}
      </h3>
      <div className="text-sm text-gray-600 space-y-1">
        <p>Started on: {formatDate(startedDate)}</p>
        <p>Ended on: {endedDate ? formatDate(endedDate) : 'Ongoing'}</p>
      </div>
    </div>
  );
};

ConversationCard.propTypes = {
  number: PropTypes.number.isRequired,
  startedDate: PropTypes.string.isRequired,
  endedDate: PropTypes.string,
  onClick: PropTypes.func
};

ConversationCard.defaultProps = {
  onClick: () => {},
  endedDate: null
};

export default ConversationCard;