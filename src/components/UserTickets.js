import React, { useState } from "react";
import "../styles/UserTickets.css";

const UserTickets = () => {
  const [tickets, setTickets] = useState([
    {
      id: 1,
      category: "Scheduling Issue",
      message: "My appointment was canceled without notice.",
      status: "Pending",
    },
    {
      id: 2,
      category: "Payment Issue",
      message: "I was charged twice for my treatment.",
      status: "In Progress",
    },
  ]);

  const [editingTicket, setEditingTicket] = useState(null);
  const [editedMessage, setEditedMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const handleEdit = (ticket) => {
    setEditingTicket(ticket);
    setEditedMessage(ticket.message);
  };

  const handleCancelEdit = () => {
    setEditingTicket(null);
    setEditedMessage("");
  };

  const handleSaveEdit = () => {
    if (!editedMessage.trim()) return;
    
    setTickets(
      tickets.map((ticket) =>
        ticket.id === editingTicket.id ? { ...ticket, message: editedMessage } : ticket
      )
    );
    setEditingTicket(null);
    setEditedMessage("");
  };

  const closeTicket = (id) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === id ? { ...ticket, status: "Closed" } : ticket
      )
    );
  };

  const confirmDelete = (id) => {
    setShowDeleteConfirm(id);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const handleDelete = (id) => {
    setTickets(tickets.filter((ticket) => ticket.id !== id));
    setShowDeleteConfirm(null);
  };

  // Status badge styling
  const getStatusBadge = (status) => {
    const statusStyles = {
      "Pending": {
        background: "var(--warning-color)",
        color: "white",
      },
      "In Progress": {
        background: "var(--primary-color)",
        color: "white",
      },
      "Closed": {
        background: "gray",
        color: "white",
      },
    };

    const style = {
      ...statusStyles[status],
      padding: "4px 8px",
      borderRadius: "4px",
      fontSize: "12px",
      fontWeight: "bold",
      display: "inline-block",
      marginLeft: "8px",
    };

    return <span style={style}>{status}</span>;
  };

  return (
    <div className="user-tickets-container">
      <h2>Your Tickets</h2>
      
      {tickets.length === 0 ? (
        <p className="no-tickets">No tickets submitted yet.</p>
      ) : (
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <div key={ticket.id} className={`ticket-card ${ticket.status.toLowerCase()}`}>
              <h3>
                {ticket.category}
                {getStatusBadge(ticket.status)}
              </h3>
              <p>{ticket.message}</p>
              
              <div className="ticket-actions">
                {ticket.status !== "Closed" && (
                  <>
                    <button onClick={() => handleEdit(ticket)}>Edit</button>
                    <button onClick={() => closeTicket(ticket.id)}>Close</button>
                  </>
                )}
                <button className="delete" onClick={() => confirmDelete(ticket.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingTicket && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Edit Ticket</h3>
            <textarea 
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              placeholder="Enter your updated message"
            />
            <div className="modal-actions">
              <button onClick={handleCancelEdit}>Cancel</button>
              <button onClick={handleSaveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this ticket? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={cancelDelete}>Cancel</button>
              <button className="delete" onClick={() => handleDelete(showDeleteConfirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTickets;