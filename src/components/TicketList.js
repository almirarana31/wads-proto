import React, { useContext } from 'react';
import { TicketContext } from '../context/TicketContext';
import TicketItem from './TicketItem';
import './TicketList.css';

const TicketList = () => {
  const { tickets, loading } = useContext(TicketContext);

  if (loading) {
    return <div className="loading">Loading tickets...</div>;
  }

  return (
    <div className="ticket-list-container">
      <h2>Your Tickets</h2>
      {tickets.length === 0 ? (
        <p>You have no tickets yet.</p>
      ) : (
        <div className="tickets">
          {tickets.map(ticket => (
            <TicketItem key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketList;