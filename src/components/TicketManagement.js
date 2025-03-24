import React, { useState, useEffect } from "react";
import "./TicketManagement.css"; // Import styles

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("all");

  // Simulated API call (replace this with a real API later)
  useEffect(() => {
    const fetchTickets = async () => {
      // Simulated ticket data
      const mockTickets = [
        { id: 1, subject: "Login Issue", user: "John Doe", description: "Can't log in", status: "pending" },
        { id: 2, subject: "Payment Failure", user: "Jane Smith", description: "Card not working", status: "in-progress" },
        { id: 3, subject: "Bug in UI", user: "Alice Johnson", description: "Layout is broken", status: "resolved" }
      ];
      setTickets(mockTickets);
    };
    fetchTickets();
  }, []);

  const updateStatus = (ticketId, newStatus) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      )
    );
  };

  const filteredTickets = tickets.filter(
    (ticket) => filter === "all" || ticket.status === filter
  );

  return (
    <div className="ticket-management">
      <h2>Ticket Management</h2>
      <div className="filter-container">
        <label>Filter by Status:</label>
        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>
      <div className="ticket-list">
        {filteredTickets.map((ticket) => (
          <div key={ticket.id} className="ticket-card">
            <h3>{ticket.subject}</h3>
            <p><strong>Submitted By:</strong> {ticket.user}</p>
            <p><strong>Description:</strong> {ticket.description}</p>
            <p><strong>Status:</strong> {ticket.status}</p>
            <div className="status-buttons">
              {ticket.status !== "resolved" && (
                <>
                  <button
                    onClick={() => updateStatus(ticket.id, "in-progress")}
                    disabled={ticket.status === "in-progress"}
                    className="progress-btn"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateStatus(ticket.id, "resolved")}
                    className="resolved-btn"
                  >
                    Mark as Resolved
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketManagement;
