import React from 'react';
import PropTypes from 'prop-types';

const ConversationCard = ({ number, startedDate, endedDate, onClick, isLoading = false, error = null }) => {
  // format dates for display
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
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-5">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  // Determine if conversation is closed
  const isClosed = !!endedDate;
  
  return (
    <div 
      className={`${isClosed ? 'bg-gray-50' : 'bg-white'} border ${
        isClosed ? 'border-gray-300' : 'border-gray-200'
      } rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h3 className={`${isClosed ? 'text-gray-700' : 'text-blue-800'} font-semibold text-lg mb-2 text-left`}>
          Conversation {number}
        </h3>
        {isClosed && (
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 border border-gray-200 rounded-full text-xs">
            <span className="h-1.5 w-1.5 bg-red-500 rounded-full mr-1.5"></span>
            <span className="text-gray-600">Closed</span>
          </span>
        )}
      </div>
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
  onClick: PropTypes.func,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

ConversationCard.defaultProps = {
  onClick: () => {},
  endedDate: null
};

export default ConversationCard;