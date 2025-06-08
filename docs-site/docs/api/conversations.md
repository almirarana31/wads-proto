---
sidebar_position: 5
---

# Conversation Endpoints

The conversation endpoints allow users and staff to communicate with each other regarding specific tickets.

## Get Conversation

Retrieves the complete conversation history including all messages.

```
GET /conversation/{conversationId}
```

**Authentication Required**: Yes (User or Staff Token)

**Parameters**:
- `conversationId` (path parameter) - ID of the conversation to retrieve

**Response Example**:
```json
[
  {
    "id": 5,
    "content": "hello user",
    "sentAt": "2025-05-31T17:55:34.277Z",
    "sender_id": 16,
    "sender_username": "almira",
    "isSender": true
  },
  {
    "id": 6,
    "content": "how are you",
    "sentAt": "2025-05-31T17:55:38.686Z",
    "sender_id": 16,
    "sender_username": "almira",
    "isSender": true
  },
  {
    "id": 7,
    "content": "hello",
    "sentAt": "2025-05-31T18:00:42.211Z",
    "sender_id": 18,
    "sender_username": "Ally CUSTOMER",
    "isSender": false
  },
  {
    "id": 8,
    "content": "hello!",
    "sentAt": "2025-06-01T06:55:02.712Z",
    "sender_id": 16,
    "sender_username": "almira",
    "isSender": true
  },
  {
    "closed": true
  }
]
```

## Send Message

Send a new message to an existing conversation.

```
POST /conversation/{conversationId}/message
```

**Authentication Required**: Yes (User or Staff Token)

**Parameters**:
- `conversationId` (path parameter) - ID of the conversation to send a message to

**Request Body**:
```json
{
  "content": "Example text!"
}
```

**Response Example**:
```json
{
  "message": "message successfully sent"
}
```

## Get Conversation History

Retrieves the history of conversations for a specific ticket.

```
GET /conversation/ticket/{ticketId}/history
```

**Authentication Required**: Yes (User or Staff Token)

**Parameters**:
- `ticketId` (path parameter) - ID of the ticket to retrieve conversation history for

**Response Example**:
```json
{
  "id": 1,
  "createdAt": "2025-05-31T15:12:23.374Z",
  "endedAt": "2025-06-08T15:09:42.595Z",
  "closed": true,
  "Ticket": {
    "user_id": 18,
    "staff_id": 3
  }
}
```

## Start or Reopen Conversation

Starts a new conversation or reopens a closed conversation for a ticket.

```
POST /conversation/ticket/{id}
```

**Authentication Required**: Yes (Staff Token)

**Parameters**:
- `id` (path parameter) - ID of the ticket for which to start/reopen a conversation

**Response Examples**:

New conversation:
```json
{
  "message": "Successfully created conversation"
}
```

Reopened conversation:
```json
{
  "message": "Conversation re-opened"
}
```

## Close Conversation

Closes an active conversation.

```
PATCH /conversation/{id}
```

**Authentication Required**: Yes (Staff Token)

**Parameters**:
- `id` (path parameter) - ID of the conversation to close

**Response Example**:
```json
{
  "message": "Conversation successfully closed"
}
```

## Error Responses

These endpoints may return the following error responses:

- **403 Forbidden**: When the user is not authorized to access the conversation
- **404 Not Found**: When the conversation or ticket does not exist
