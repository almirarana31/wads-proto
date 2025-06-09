---
sidebar_position: 2
---

# API Reference

Welcome to the Bianca Helpdesk API reference documentation. This guide provides details about all available API endpoints, request/response formats, and authentication requirements.

## Base URLs

The Bianca Helpdesk API is organized into several base URLs for different types of operations:

- **User and Guest Endpoints**: `http://localhost:5000/api/user`
- **Staff Endpoints**: `http://localhost:5000/api/staff`
- **Admin Endpoints**: `http://localhost:5000/api/admin`
- **Ticket Management**: `http://localhost:5000/api/ticket`
- **Conversation Endpoints**: `http://localhost:5000/api/conversation`

## Authentication

Most API endpoints require authentication using a Bearer token. Include the token in the Authorization header:

```
Authorization: Bearer your_token_here
```

You can obtain a token by using the `/log-in` endpoint.

## Available Endpoints

### User Endpoints

- [Authentication](api/authentication.md)
- [Ticket Management](api/user-tickets.md)

### Staff Endpoints

- [Ticket Operations](api/staff-tickets.md)
- [Performance Metrics](api/staff-metrics.md)

### Admin Endpoints

- [System Management](api/admin-system.md)
- [Staff Management](api/admin-staff.md)
- [Ticket Administration](api/admin-tickets.md)

### Conversation Endpoints

- [Message Management](api/conversations.md)

## Error Handling

All API endpoints use standard HTTP status codes:

- **200 OK**: Request succeeded
- **400 Bad Request**: Invalid parameters or request format
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Valid authentication but insufficient permissions
- **404 Not Found**: Requested resource does not exist
- **500 Internal Server Error**: Server-side error

Error responses include a JSON object with a descriptive message:

```json
{
  "message": "Error description here"
}
```

## Rate Limiting

To ensure service stability, the API implements rate limiting. If you exceed the limits, you'll receive a `429 Too Many Requests` response. Please implement appropriate backoff strategies in your applications.

## Support

For API support, contact the development team at [dev-support@bianca-clinic.com](mailto:dev-support@bianca-clinic.com).
