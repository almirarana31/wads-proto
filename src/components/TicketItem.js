import React, { useContext, useState } from 'react';
import { TicketContext } from '../context/TicketContext';
import './TicketItem.css';

const TicketItem = ({ ticket }) => {
  const { updateTicket, deleteTicket } = useContext(TicketContext);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedDescription, setUpdatedDescription] = useState(ticket.description);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    updateTicket(ticket.id, { description: updatedDescription });
    setIsEditing(false);
  };

  const handleClose = () => {
    setIsEditing(false);
    setUpdatedDescription(ticket.description);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      deleteTicket(ticket.id);
    }
  };

  return (
    <div className={`ticket-item ${ticket.status}`}>
      <div className="ticket-header">
        <h3>{ticket.title}</h3>
        <span className={`status-badge ${ticket.status}`}>
          {ticket.status === 'pending' ? 'Pending' : 
           ticket.status === 'in_progress' ? 'In Progress' : 
           ticket.status === 'resolved' ? 'Resolved' : 'Closed'}
        </span>
      </div>
      
      {isEditing ? (
        <textarea
          value={updatedDescription}
          onChange={(e) => setUpdatedDescription(e.target.value)}
          className="edit-description"
        />
      ) : (
        <p>{ticket.description}</p>
      )}
      
      <div className="ticket-footer">
        <div className="ticket-meta">
          Created: {ticket.createdAt}
          {ticket.createdAt !== ticket.updatedAt && ` | Updated: ${ticket.updatedAt}`}
        </div>
        
        <div className="ticket-actions">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="btn-small btn-primary">Save</button>
              <button onClick={handleClose} className="btn-small">Close</button>
            </>
          ) : (
            <>
              <button onClick={handleEdit} className="btn-small btn-primary">Edit</button>
              <button onClick={handleClose} className="btn-small">Close</button>
              <button onClick={handleDelete} className="btn-small btn-danger">Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketItem;
