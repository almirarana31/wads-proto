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
  }  // Determine if conversation is closed
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
        </h3>        {isClosed && (
          <span className="inline-flex items-center px-2 py-1 bg-amber-50 border border-amber-100 rounded-full text-xs">
            <span className="h-1.5 w-1.5 bg-amber-500 rounded-full mr-1.5"></span>
            <span className="text-amber-700 font-medium">Archived</span>
          </span>
        )}
      </div>
      <div className={`text-sm ${isClosed ? 'text-gray-500' : 'text-gray-600'} space-y-1`}>
        <p>Started on: {formatDate(startedDate)}</p>
        <p>
          {isClosed ? (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Closed on: {formatDate(endedDate)}
            </span>
          ) : (
            <span className="flex items-center text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Active conversation
            </span>
          )}
        </p>
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