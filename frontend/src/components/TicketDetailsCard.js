import React from 'react';
import { Heading, Text, SmallText } from './text';

const getStatusStyle = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-yellow-200 text-yellow-800';
    case 'In Progress':
      return 'bg-purple-200 text-purple-800';
    case 'Resolved':
      return 'bg-green-400 text-green-800';
    case 'Cancelled':
      return 'bg-red-200 text-red-800';
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
    case 'Cancelled':
      return 'border-l-4 border-red-500';
    default:
      return '';
  }
};

function TicketDetailsCard({ ticket }) {
  if (!ticket) {
    return null;
  }
  
  return (    
  <div className={`bg-gray-100 p-6 rounded-md ${getBorderStyle(ticket.status)}`}>
      <div className="flex flex-col md:flex-row justify-between mb-3 gap-2">
        <Heading level={2} size="xl" weight="bold" className="text-blue-800">{ticket.title}</Heading>
        <span className={`px-3 py-1 rounded-full text-sm font-medium w-fit ${getStatusStyle(ticket.status)}`}>
          {ticket.status}
        </span>
      </div>      
      <Text className="mb-4" color="text-gray-700">{ticket.description}</Text>
      <div className="text-gray-600 text-sm space-y-1">
        <div><SmallText color="text-gray-600">Ticket ID: {ticket.id}</SmallText></div>
        <div><SmallText color="text-gray-600">Category: {ticket.category || 'N/A'}</SmallText></div>
        <div><SmallText color="text-gray-600">Created at: {ticket.created ? new Date(ticket.created).toLocaleString() : 'N/A'}</SmallText></div>
      </div>
    </div>
  );
}

export default TicketDetailsCard;