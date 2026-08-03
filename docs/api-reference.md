# API Reference

## Auth

### POST /auth/request-otp
Request:
```json
{"email": "admin@restaurant.local"}
```
Response:
```json
{"message": "OTP sent successfully"}
```

### POST /auth/verify-otp
Request:
```json
{"email": "admin@restaurant.local", "otp": "123456"}
```
Response:
```json
{"access_token": "...", "token_type": "bearer", "user_id": 1, "name": "Admin", "email": "admin@restaurant.local", "role": "admin"}
```

### GET /auth/me
Protected endpoint. Requires bearer token.

## Admin

### POST /admin/users
Requires admin role.
Request:
```json
{"name": "Kitchen Staff", "email": "kitchen@restaurant.local", "role": "kitchen"}
```
Response:
```json
{"id": 2, "name": "Kitchen Staff", "email": "kitchen@restaurant.local", "role": "kitchen", "is_active": true, "created_at": "2026-08-02T12:34:56"}
```

### GET /admin/users
Requires admin role.
Query params: `page`, `page_size`, `search`, `role`

### GET /admin/users/{id}
Requires admin role.

### PUT /admin/users/{id}
Requires admin role.

### DELETE /admin/users/{id}
Requires admin role.

## Customer Session

Customer sessions are created before ordering food. Customers do not authenticate, and the session remains ACTIVE until the billing workflow marks it COMPLETED.

### POST /customer/session
Create a customer session for a table.

Request example:
```json
{"name": "John Doe", "email": "john.doe@example.com", "number_of_people": 4, "table_number": 8}
```

Response example:
```json
{"id": 1, "session_id": "e0f768a4-93de-4f43-b6e8-3e60d31c7f36", "table_id": 8, "table_number": 8, "name": "John Doe", "email": "john.doe@example.com", "number_of_people": 4, "status": "ACTIVE", "started_at": "2026-08-03T10:00:00", "ended_at": null}
```

cURL example:
```bash
curl -X POST http://127.0.0.1:8000/customer/session \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john.doe@example.com","number_of_people":4,"table_number":8}'
```

### GET /customer/session/{id}
Retrieve a customer session by its primary key id.

Response example:
```json
{"id": 1, "session_id": "e0f768a4-93de-4f43-b6e8-3e60d31c7f36", "table_id": 8, "table_number": 8, "name": "John Doe", "email": "john.doe@example.com", "number_of_people": 4, "status": "ACTIVE", "started_at": "2026-08-03T10:00:00", "ended_at": null}
```

cURL example:
```bash
curl -X GET http://127.0.0.1:8000/customer/session/1
```

### PUT /customer/session/{id}
Update the active customer session.

Request example:
```json
{"name": "John Doe", "email": "john.doe@example.com", "number_of_people": 5, "table_number": 8}
```

Response example:
```json
{"id": 1, "session_id": "e0f768a4-93de-4f43-b6e8-3e60d31c7f36", "table_id": 8, "table_number": 8, "name": "John Doe", "email": "john.doe@example.com", "number_of_people": 5, "status": "ACTIVE", "started_at": "2026-08-03T10:00:00", "ended_at": null}
```

cURL example:
```bash
curl -X PUT http://127.0.0.1:8000/customer/session/1 \
  -H "Content-Type: application/json" \
  -d '{"number_of_people":5}'
```

### Validation and edge cases
- Email must be valid.
- `number_of_people` must be greater than `0`.
- `table_number` must reference an existing table.
- Only one ACTIVE session is allowed for a table at a time.
- The module only creates, retrieves, and updates sessions; completion and hard deletion are outside this module.
