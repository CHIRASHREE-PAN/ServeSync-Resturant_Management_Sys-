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
