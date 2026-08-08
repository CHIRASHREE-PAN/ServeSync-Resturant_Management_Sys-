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
curl -X POST http://127.0.0.1:8007/customer/session \
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
curl -X GET http://127.0.0.1:8007/customer/session/1
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
curl -X PUT http://127.0.0.1:8007/customer/session/1 \
  -H "Content-Type: application/json" \
  -d '{"number_of_people":5}'
```

### Validation and edge cases
- Email must be valid.
- `number_of_people` must be greater than `0`.
- `table_number` must reference an existing table.
- Only one ACTIVE session is allowed for a table at a time.
- The module only creates, retrieves, and updates sessions; completion and hard deletion are outside this module.

## Orders

Orders require an existing `ACTIVE` customer session. The API stores the menu price at the time of ordering, applies SGST and CGST at 2.5% each, and sets `estimated_cooking_time` to the largest `cook_time` among the ordered items. New orders begin as `ORDER_RECEIVED`.

### POST /orders

Request:
```json
{
  "session_id": 1,
  "items": [
    {"menu_item_id": 1, "quantity": 2, "special_instruction": "Less spicy"},
    {"menu_item_id": 2, "quantity": 1}
  ]
}
```

Response (`201 Created`):
```json
{
  "id": 12,
  "session_id": 1,
  "customer_session": {"id": 1, "session_id": "e0f768a4-93de-4f43-b6e8-3e60d31c7f36", "table_id": 8, "name": "John Doe", "email": "john.doe@example.com", "number_of_people": 4, "status": "ACTIVE", "started_at": "2026-08-04T10:00:00", "ended_at": null},
  "status": "ORDER_RECEIVED",
  "subtotal": "747.00",
  "sgst": "18.68",
  "cgst": "18.68",
  "tax": "37.36",
  "total": "784.36",
  "estimated_cooking_time": 20,
  "created_at": "2026-08-04T10:05:00",
  "items": [{"id": 20, "menu_item_id": 1, "quantity": 2, "price": "249.00", "special_instruction": "Less spicy", "menu_item": {"id": 1, "name": "Paneer Tikka", "description": "Grilled cottage cheese with spices", "image": null, "cook_time": 20}}]
}
```

```bash
curl -X POST http://127.0.0.1:8007/orders -H "Content-Type: application/json" -d '{"session_id":1,"items":[{"menu_item_id":1,"quantity":2,"special_instruction":"Less spicy"},{"menu_item_id":2,"quantity":1}]}'
```

### GET /orders/{id}

Response (`200 OK`): the complete order object shown for `POST /orders`, including customer-session, order-item, and menu-item information.

```bash
curl http://127.0.0.1:8007/orders/12
```

### GET /orders/session/{session_id}

Response (`200 OK`): an array of complete order objects, ordered newest first.

```json
[{"id": 12, "session_id": 1, "status": "ORDER_RECEIVED", "subtotal": "747.00", "sgst": "18.68", "cgst": "18.68", "tax": "37.36", "total": "784.36", "estimated_cooking_time": 20, "items": []}]
```

```bash
curl http://127.0.0.1:8007/orders/session/1
```

### DELETE /orders/{id}

Deletes the order and all of its order items only when its status is `ORDER_RECEIVED`.

Response (`200 OK`):
```json
{"message": "Order deleted successfully."}
```

```bash
curl -X DELETE http://127.0.0.1:8007/orders/12
```

### Validation and errors

- `404`: customer session, menu item, or order does not exist.
- `400`: session is not `ACTIVE`, an item is unavailable, duplicate item IDs are supplied, or request validation fails (including a non-positive quantity).
- `409`: a processed (`PREPARING`, `READY_TO_SERVE`, or `SERVED`) order is deleted.
- `500`: unexpected database or internal failures return a safe error response.

## Kitchen

All kitchen routes require a valid bearer JWT for a user with the `kitchen` role. Missing or invalid tokens return `401`; authenticated users with any other role return `403`. Kitchen staff can only progress an order through `ORDER_RECEIVED → PREPARING → READY_TO_SERVE`; they cannot serve an order.

### GET /kitchen/orders

Returns only `ORDER_RECEIVED` and `PREPARING` orders, oldest first.

Response (`200 OK`):
```json
[
  {
    "order_id": 12,
    "session_id": 1,
    "table_number": 8,
    "customer_name": "John Doe",
    "status": "ORDER_RECEIVED",
    "estimated_cooking_time": 20,
    "created_at": "2026-08-04T10:05:00",
    "items": [{"menu_item_name": "Paneer Tikka", "quantity": 2, "special_instruction": "Less spicy"}]
  }
]
```

```bash
curl http://127.0.0.1:8007/kitchen/orders -H "Authorization: Bearer <kitchen-jwt>"
```

### PUT /kitchen/orders/{order_id}/preparing

Moves an `ORDER_RECEIVED` order to `PREPARING`.

Request: no body.

Response (`200 OK`):
```json
{"order_id": 12, "session_id": 1, "table_number": 8, "customer_name": "John Doe", "status": "PREPARING", "estimated_cooking_time": 20, "created_at": "2026-08-04T10:05:00", "items": [{"menu_item_name": "Paneer Tikka", "quantity": 2, "special_instruction": "Less spicy"}]}
```

```bash
curl -X PUT http://127.0.0.1:8007/kitchen/orders/12/preparing -H "Authorization: Bearer <kitchen-jwt>"
```

### PUT /kitchen/orders/{order_id}/ready

Moves a `PREPARING` order to `READY_TO_SERVE`. The same database transaction creates one unread `waiter_notifications` record linked to the order.

Request: no body.

Response (`200 OK`):
```json
{"order_id": 12, "session_id": 1, "table_number": 8, "customer_name": "John Doe", "status": "READY_TO_SERVE", "estimated_cooking_time": 20, "created_at": "2026-08-04T10:05:00", "items": [{"menu_item_name": "Paneer Tikka", "quantity": 2, "special_instruction": "Less spicy"}]}
```

```bash
curl -X PUT http://127.0.0.1:8007/kitchen/orders/12/ready -H "Authorization: Bearer <kitchen-jwt>"
```

### Validation and errors

- `401`: missing, expired, or invalid JWT.
- `403`: authenticated user is not kitchen staff.
- `404`: order does not exist.
- `409`: invalid transition, including repeated ready updates or any attempt to update an order that is already `SERVED`.
- `500`: database and unexpected server failures return a safe error response.

## Waiter

All waiter routes require a valid bearer JWT for a user with the `waiter` role. Missing or invalid tokens return `401`; authenticated users with another role return `403`. Waiters can serve only `READY_TO_SERVE` orders and complete only `OPEN` waiter calls.

### GET /waiter/orders

Returns unread waiter notifications, oldest first.

Response (`200 OK`):
```json
[{
  "notification_id": 1,
  "order_id": 12,
  "table_number": 8,
  "customer_name": "John Doe",
  "order_status": "READY_TO_SERVE",
  "ordered_items": [{"menu_item_name": "Paneer Tikka", "quantity": 2, "special_instruction": "Less spicy"}],
  "subtotal": "498.00",
  "tax": "24.90",
  "total": "522.90",
  "estimated_cooking_time": 20,
  "created_at": "2026-08-04T12:00:00"
}]
```

```bash
curl http://127.0.0.1:8007/waiter/orders -H "Authorization: Bearer <waiter-jwt>"
```

### GET /waiter/calls

Returns `OPEN` waiter calls, oldest first.

Response (`200 OK`):
```json
[{"call_id": 1, "session_id": 1, "table_number": 8, "customer_name": "John Doe", "customer_email": "john.doe@example.com", "number_of_people": 4, "status": "OPEN", "created_at": "2026-08-04T12:05:00"}]
```

```bash
curl http://127.0.0.1:8007/waiter/calls -H "Authorization: Bearer <waiter-jwt>"
```

### PUT /waiter/orders/{order_id}/served

Moves a `READY_TO_SERVE` order to `SERVED` and marks its associated waiter notification as read. Request: no body.

Response (`200 OK`):
```json
{"order_id": 12, "session_id": 1, "table_number": 8, "customer_name": "John Doe", "order_status": "SERVED", "ordered_items": [{"menu_item_name": "Paneer Tikka", "quantity": 2, "special_instruction": "Less spicy"}], "subtotal": "498.00", "tax": "24.90", "total": "522.90", "estimated_cooking_time": 20, "created_at": "2026-08-04T10:05:00"}
```

```bash
curl -X PUT http://127.0.0.1:8007/waiter/orders/12/served -H "Authorization: Bearer <waiter-jwt>"
```

### PUT /waiter/calls/{call_id}/completed

Moves an `OPEN` waiter call to `COMPLETED`. Request: no body.

Response (`200 OK`):
```json
{"call_id": 1, "session_id": 1, "table_number": 8, "customer_name": "John Doe", "customer_email": "john.doe@example.com", "number_of_people": 4, "status": "COMPLETED", "created_at": "2026-08-04T12:05:00"}
```

```bash
curl -X PUT http://127.0.0.1:8007/waiter/calls/1/completed -H "Authorization: Bearer <waiter-jwt>"
```

### Validation and errors

- `401`: missing, expired, or invalid JWT.
- `403`: authenticated user is not waiter staff.
- `404`: order, waiter notification, waiter call, or associated customer session does not exist.
- `409`: duplicate served/completed update or another invalid status transition.
- `500`: database and unexpected server failures return a safe error response.

## Billing

Billing routes require a valid bearer JWT for an `admin` or `waiter` user. A bill request calculates the subtotal from every order total in the customer session, applies CGST and SGST at 2.5% each, generates and emails a PDF invoice, and creates an unpaid bill. Payment is the only workflow that completes a customer session.

### POST /billing/request

Request:
```json
{"session_id": 1}
```

Response (`201 Created`):
```json
{"bill_id": 1, "session_id": 1, "customer_name": "John Doe", "customer_email": "john.doe@example.com", "table_number": 8, "ordered_items": [{"order_id": 1, "menu_item_name": "Paneer Tikka", "quantity": 2, "unit_price": "249.00", "item_total": "498.00"}], "subtotal": "522.90", "cgst": "13.07", "sgst": "13.07", "total_tax": "26.14", "grand_total": "549.04", "pdf_path": "uploads/invoices/invoice_1.pdf", "is_paid": false, "created_at": "2026-08-04T12:10:00"}
```

```bash
curl -X POST http://127.0.0.1:8007/billing/request \
  -H "Authorization: Bearer <admin-or-waiter-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"session_id":1}'
```

### GET /billing/{session_id}

Returns the generated bill, customer information, every ordered item, payment status, and the relative PDF path.

Response (`200 OK`): the same bill object shown for `POST /billing/request`.

```bash
curl http://127.0.0.1:8007/billing/1 -H "Authorization: Bearer <admin-or-waiter-jwt>"
```

### PUT /billing/{bill_id}/paid

Marks the bill as paid and updates its customer session to `COMPLETED` with the current `ended_at` timestamp. Request: no body.

Response (`200 OK`): the same bill object, with `"is_paid": true`.

```bash
curl -X PUT http://127.0.0.1:8007/billing/1/paid -H "Authorization: Bearer <admin-or-waiter-jwt>"
```

### Validation and errors

- `401`: missing, expired, or invalid JWT.
- `403`: the authenticated user is not an admin or waiter.
- `404`: customer session or bill does not exist.
- `400`: the active session has no orders.
- `409`: session is not `ACTIVE`, a bill already exists, or the bill is already paid.
- `500`: PDF creation, email delivery, database, and unexpected server failures return a safe error response.

## Feedback

Customer feedback is submitted only after the corresponding bill is paid and its customer session is `COMPLETED`. Customers do not authenticate for submission. The `feedback.session_id` foreign key is unique, so a customer session can submit feedback once only.

### POST /feedback

Public endpoint. Rating must be an integer from 1 through 5; the comment is optional.

Request:
```json
{"session_id": 1, "rating": 5, "comment": "Excellent food and quick service."}
```

Response (`201 Created`):
```json
{"id": 1, "session_id": 1, "rating": 5, "comment": "Excellent food and quick service."}
```

```bash
curl -X POST http://127.0.0.1:8007/feedback \
  -H "Content-Type: application/json" \
  -d '{"session_id":1,"rating":5,"comment":"Excellent food and quick service."}'
```

### GET /feedback

Admin-only endpoint. Supports `page` (default `1`), `page_size` (default `20`, maximum `100`), and optional `rating` (1–5). Feedback is sorted newest first.

Response (`200 OK`):
```json
{"items":[{"id":1,"session_id":1,"customer_name":"John Doe","customer_email":"john.doe@example.com","table_number":8,"rating":5,"comment":"Excellent food and quick service.","submitted_at":"2026-08-05T12:15:00"}],"page":1,"page_size":20,"total_items":1,"total_pages":1}
```

```bash
curl "http://127.0.0.1:8007/feedback?page=1&page_size=20&rating=5" \
  -H "Authorization: Bearer <admin-jwt>"
```

### GET /feedback/{id}

Admin-only endpoint. Returns the feedback, session ID, customer name/email, and table number.

Response (`200 OK`):
```json
{"id":1,"session_id":1,"customer_name":"John Doe","customer_email":"john.doe@example.com","table_number":8,"rating":5,"comment":"Excellent food and quick service.","submitted_at":"2026-08-05T12:15:00"}
```

```bash
curl http://127.0.0.1:8007/feedback/1 -H "Authorization: Bearer <admin-jwt>"
```

### DELETE /feedback/{id}

Admin-only endpoint.

Response (`200 OK`):
```json
{"message":"Feedback deleted successfully."}
```

```bash
curl -X DELETE http://127.0.0.1:8007/feedback/1 -H "Authorization: Bearer <admin-jwt>"
```

### Validation and errors

- `401`: missing or invalid JWT on admin endpoints.
- `403`: authenticated user is not an admin.
- `404`: customer session, bill, or feedback does not exist.
- `409`: session is not `COMPLETED`, bill is unpaid, or feedback has already been submitted.
- `422`: rating or pagination input is invalid (including ratings outside 1–5).
- `500`: database and unexpected server failures return a safe error response.

## Reports and Charts

All report and chart endpoints require an admin bearer JWT. Reports use order, bill, session, feedback, menu-item, and category aggregates only; no reporting tables are created. Revenue and average order value are based on paid bills. Empty periods return zero totals, empty labels/values where appropriate, and `null` for an unavailable average rating or top item/category.

### Reports

- `GET /admin/reports/daily?date=2026-08-05` returns daily orders, paid-bill revenue, bills, sessions, top item/category, and feedback summary.
- `GET /admin/reports/monthly?year=2026&month=8` returns the monthly summary, including served-order count.
- `GET /admin/reports/yearly?year=2026` returns annual totals and all twelve monthly paid-sales points.
- `GET /admin/reports?from=2026-08-01&to=2026-08-31` returns the complete inclusive date-range aggregate.
- `GET /admin/reports/monthly/pdf?year=2026&month=8` writes `uploads/reports/August_2026_Report.pdf` and returns `{"pdf_path":"uploads/reports/August_2026_Report.pdf"}`.
- `GET /admin/reports/monthly/excel?year=2026&month=8` writes `uploads/reports/August_2026_Report.xlsx` and returns `{"excel_path":"uploads/reports/August_2026_Report.xlsx"}`.

Example daily response:
```json
{"date":"2026-08-05","orders":45,"revenue":21540.5,"bills_generated":43,"bills_paid":41,"active_sessions":6,"completed_sessions":39,"average_order_value":525.38,"most_ordered_item":"Chicken Biryani","top_category":"Main Course","feedback_count":31,"average_rating":4.8}
```

### Chart data

All chart endpoints accept an optional `year` (default: current year) and return JSON only for rendering by the frontend:

- `GET /admin/charts/revenue`
- `GET /admin/charts/top-items`
- `GET /admin/charts/top-categories`
- `GET /admin/charts/order-status`
- `GET /admin/charts/ratings`

Example:
```json
{"labels":["Jan","Feb","Mar"],"values":[250000,275000,301000]}
```

```bash
curl "http://127.0.0.1:8007/admin/reports/monthly?year=2026&month=8" \
  -H "Authorization: Bearer <admin-jwt>"
curl "http://127.0.0.1:8007/admin/charts/revenue?year=2026" \
  -H "Authorization: Bearer <admin-jwt>"
```

### Validation and errors

- `401`: JWT is missing or invalid.
- `403`: authenticated user is not an admin.
- `422`: malformed, future, out-of-range, or inverted date input.
- `500`: database, PDF, Excel, or unexpected internal failure. Server logs include the affected report endpoint and parameters.
