import React from 'react';

// Utility functions for status and border styles
const getStatusStyle = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-200 text-yellow-800';
    case 'In Progress':
      return 'bg-purple-200 text-purple-800';
    case 'Resolved':
      return 'bg-green-400 text-green-800';
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

const getBorderStyle = (status) => {
  switch (status) {
    case 'Pending':
      return 'border-l-4 border-yellow-400';
    case 'In Progress':
      return 'border-l-4 border-purple-500';
    case 'Resolved':
      return 'border-l-4 border-green-500';
    default:
      return '';
  }
};

function TicketCard({ ticket, onViewDetails }) {
  return (
    <div className={`bg-gray-100 p-6 rounded-md ${getBorderStyle(ticket.status)}`}>
      <div className="flex flex-col md:flex-row justify-between mb-3 gap-2">
        <h2 className="text-xl font-bold text-blue-800">{ticket.title}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${getStatusStyle(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>
      <p className="mb-4 text-gray-700">{ticket.description}</p>
      <div className="text-gray-600 text-sm">
        <p>Ticket ID: {ticket.id}</p>
        <p>Category: {ticket.category}</p>
        <p>Created at: {new Date(ticket.created).toLocaleString()}</p>
      </div>
    </div>
  );
}

export default TicketCard;