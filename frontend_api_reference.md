# Authentication

## POST /auth/request-otp
Authentication: Public  
Role: Customer (Public)  
Purpose: Send a login OTP to an email address.

Request
```json
{"email":"admin@example.com"}
```
Response
```json
{"message":"OTP sent successfully"}
```

## POST /auth/verify-otp
Authentication: Public  
Role: Customer (Public)  
Purpose: Verify an OTP and receive an access token.

Request
```json
{"email":"admin@example.com","otp":"123456"}
```
Response
```json
{"access_token":"jwt","token_type":"bearer","user_id":1,"name":"Admin","email":"admin@example.com","role":"admin"}
```

## GET /auth/me
Authentication: JWT Required  
Role: Admin, Waiter, Kitchen  
Purpose: Get the authenticated user.

Request
```json
{}
```
Response
```json
{"id":1,"name":"Admin","email":"admin@example.com","role":"admin"}
```

# Admin

## POST /admin/users
Authentication: JWT Required  
Role: Admin  
Purpose: Create a staff user.

Request
```json
{"name":"Asha","email":"asha@example.com","role":"waiter"}
```
Response
```json
{"id":2,"name":"Asha","email":"asha@example.com","role":"waiter","is_active":true,"created_at":"2026-08-05T10:00:00"}
```

## GET /admin/users
Authentication: JWT Required  
Role: Admin  
Purpose: List staff users.

Request
```json
{"page":1,"page_size":20,"search":"asha","role":"waiter"}
```
Response
```json
{"items":[{"id":2,"name":"Asha","email":"asha@example.com","role":"waiter","is_active":true,"created_at":"2026-08-05T10:00:00"}],"page":1,"page_size":20,"total_items":1,"total_pages":1}
```

## GET /admin/users/{staff_id}
Authentication: JWT Required  
Role: Admin  
Purpose: Get one staff user.

Request
```json
{}
```
Response
```json
{"id":2,"name":"Asha","email":"asha@example.com","role":"waiter","is_active":true,"created_at":"2026-08-05T10:00:00"}
```

## PUT /admin/users/{staff_id}
Authentication: JWT Required  
Role: Admin  
Purpose: Update a staff user.

Request
```json
{"name":"Asha Das","email":"asha@example.com","role":"waiter","is_active":true}
```
Response
```json
{"id":2,"name":"Asha Das","email":"asha@example.com","role":"waiter","is_active":true,"created_at":"2026-08-05T10:00:00"}
```

## DELETE /admin/users/{staff_id}
Authentication: JWT Required  
Role: Admin  
Purpose: Deactivate a staff user.

Request
```json
{}
```
Response
```json
null
```

# Customer Session

## POST /customer/session
Authentication: Public  
Role: Customer (Public)  
Purpose: Create a customer dining session.

Request
```json
{"name":"Riya","email":"riya@example.com","number_of_people":2,"table_number":5}
```
Response
```json
{"id":1,"session_id":"uuid","table_id":5,"table_number":5,"name":"Riya","email":"riya@example.com","number_of_people":2,"status":"ACTIVE","started_at":"2026-08-05T10:00:00","ended_at":null}
```

## GET /customer/session/{id}
Authentication: Public  
Role: Customer (Public)  
Purpose: Get a customer dining session.

Request
```json
{}
```
Response
```json
{"id":1,"session_id":"uuid","table_id":5,"table_number":5,"name":"Riya","email":"riya@example.com","number_of_people":2,"status":"ACTIVE","started_at":"2026-08-05T10:00:00","ended_at":null}
```

## PUT /customer/session/{id}
Authentication: Public  
Role: Customer (Public)  
Purpose: Update a customer dining session.

Request
```json
{"name":"Riya","email":"riya@example.com","number_of_people":3,"table_number":5}
```
Response
```json
{"id":1,"session_id":"uuid","table_id":5,"table_number":5,"name":"Riya","email":"riya@example.com","number_of_people":3,"status":"ACTIVE","started_at":"2026-08-05T10:00:00","ended_at":null}
```

## POST /customer/waiter-call
Authentication: Public  
Role: Customer (Public)  
Purpose: Create a waiter call for a session.

Request
```json
{"session_id":1}
```
Response
```json
{"id":1,"session_id":1,"status":"OPEN","created_at":"2026-08-05T10:00:00"}
```

## GET /customer/waiter-call/{id}
Authentication: Public  
Role: Customer (Public)  
Purpose: Get a waiter call.

Request
```json
{}
```
Response
```json
{"id":1,"session_id":1,"status":"OPEN","created_at":"2026-08-05T10:00:00"}
```

# Category

## POST /categories
Authentication: JWT Required  
Role: Admin  
Purpose: Create a menu category.

Request
```json
{"name":"Main Course","description":"Meals"}
```
Response
```json
{"id":1,"name":"Main Course","description":"Meals"}
```

## GET /categories
Authentication: Public  
Role: Customer (Public)  
Purpose: List menu categories.

Request
```json
{"page":1,"page_size":20,"search":"main"}
```
Response
```json
{"items":[{"id":1,"name":"Main Course","description":"Meals"}],"page":1,"page_size":20,"total_items":1,"total_pages":1}
```

## GET /categories/{id}
Authentication: Public  
Role: Customer (Public)  
Purpose: Get a menu category.

Request
```json
{}
```
Response
```json
{"id":1,"name":"Main Course","description":"Meals"}
```

## PUT /categories/{id}
Authentication: JWT Required  
Role: Admin  
Purpose: Update a menu category.

Request
```json
{"name":"Mains","description":"Meals"}
```
Response
```json
{"id":1,"name":"Mains","description":"Meals"}
```

## DELETE /categories/{id}
Authentication: JWT Required  
Role: Admin  
Purpose: Delete a menu category.

Request
```json
{}
```
Response
```json
{"message":"Category deleted successfully."}
```

# Menu

## POST /menu
Authentication: JWT Required  
Role: Admin  
Purpose: Create a menu item.

Request
```text
FormData
category_id
name
price
description
calories
cook_time
availability
chef_special
best_seller
image(File)
```
Response
```json
{"id":1,"category_id":1,"name":"Paneer Tikka","description":"Grilled","price":250.00,"image":"uploads/menu/image.jpg","calories":300,"cook_time":15,"availability":true,"chef_special":false,"best_seller":false}
```

## GET /menu
Authentication: Public  
Role: Customer (Public)  
Purpose: List available menu items.

Request
```json
{"page":1,"page_size":20,"search":"paneer","category_id":1,"chef_special":false,"best_seller":false,"sort_by":"name","sort_dir":"asc"}
```
Response
```json
{"items":[{"id":1,"category_id":1,"name":"Paneer Tikka","description":"Grilled","price":250.00,"image":"uploads/menu/image.jpg","calories":300,"cook_time":15,"availability":true,"chef_special":false,"best_seller":false}],"page":1,"page_size":20,"total_items":1,"total_pages":1}
```

## GET /menu/search
Authentication: Public  
Role: Customer (Public)  
Purpose: Search available menu items.

Request
```json
{"query":"paneer"}
```
Response
```json
[{"id":1,"category_id":1,"name":"Paneer Tikka","description":"Grilled","price":250.00,"image":"uploads/menu/image.jpg","calories":300,"cook_time":15,"availability":true,"chef_special":false,"best_seller":false}]
```

## GET /menu/category/{category_id}
Authentication: Public  
Role: Customer (Public)  
Purpose: List available menu items in a category.

Request
```json
{}
```
Response
```json
[{"id":1,"category_id":1,"name":"Paneer Tikka","description":"Grilled","price":250.00,"image":"uploads/menu/image.jpg","calories":300,"cook_time":15,"availability":true,"chef_special":false,"best_seller":false}]
```

## GET /menu/{id}
Authentication: Public  
Role: Customer (Public)  
Purpose: Get a menu item.

Request
```json
{}
```
Response
```json
{"id":1,"category_id":1,"name":"Paneer Tikka","description":"Grilled","price":250.00,"image":"uploads/menu/image.jpg","calories":300,"cook_time":15,"availability":true,"chef_special":false,"best_seller":false}
```

## PUT /menu/{id}
Authentication: JWT Required  
Role: Admin  
Purpose: Update a menu item.

Request
```text
FormData
category_id
name
price
description
calories
cook_time
availability
chef_special
best_seller
image(File)
```
Response
```json
{"id":1,"category_id":1,"name":"Paneer Tikka","description":"Grilled","price":250.00,"image":"uploads/menu/image.jpg","calories":300,"cook_time":15,"availability":true,"chef_special":false,"best_seller":false}
```

## DELETE /menu/{id}
Authentication: JWT Required  
Role: Admin  
Purpose: Delete a menu item.

Request
```json
{}
```
Response
```json
{"message":"Menu item deleted successfully."}
```

# Order

## POST /orders
Authentication: Public  
Role: Customer (Public)  
Purpose: Create an order for a customer session.

Request
```json
{"session_id":1,"items":[{"menu_item_id":1,"quantity":2,"special_instruction":"Less spicy"}]}
```
Response
```json
{"id":1,"session_id":1,"customer_session":{"id":1,"session_id":"uuid","table_id":5,"name":"Riya","email":"riya@example.com","number_of_people":2,"status":"ACTIVE","started_at":"2026-08-05T10:00:00","ended_at":null},"status":"ORDER_RECEIVED","subtotal":500.00,"sgst":12.50,"cgst":12.50,"tax":25.00,"total":525.00,"estimated_cooking_time":15,"created_at":"2026-08-05T10:00:00","items":[{"id":1,"menu_item_id":1,"quantity":2,"price":250.00,"special_instruction":"Less spicy","menu_item":{"id":1,"name":"Paneer Tikka","description":"Grilled","image":"uploads/menu/image.jpg","cook_time":15}}]}
```

## GET /orders/session/{session_id}
Authentication: Public  
Role: Customer (Public)  
Purpose: List orders for a customer session.

Request
```json
{}
```
Response
```json
[{"id":1,"session_id":1,"customer_session":{"id":1,"session_id":"uuid","table_id":5,"name":"Riya","email":"riya@example.com","number_of_people":2,"status":"ACTIVE","started_at":"2026-08-05T10:00:00","ended_at":null},"status":"ORDER_RECEIVED","subtotal":500.00,"sgst":12.50,"cgst":12.50,"tax":25.00,"total":525.00,"estimated_cooking_time":15,"created_at":"2026-08-05T10:00:00","items":[{"id":1,"menu_item_id":1,"quantity":2,"price":250.00,"special_instruction":"Less spicy","menu_item":{"id":1,"name":"Paneer Tikka","description":"Grilled","image":"uploads/menu/image.jpg","cook_time":15}}]}]
```

## GET /orders/{id}
Authentication: Public  
Role: Customer (Public)  
Purpose: Get an order.

Request
```json
{}
```
Response
```json
{"id":1,"session_id":1,"customer_session":{"id":1,"session_id":"uuid","table_id":5,"name":"Riya","email":"riya@example.com","number_of_people":2,"status":"ACTIVE","started_at":"2026-08-05T10:00:00","ended_at":null},"status":"ORDER_RECEIVED","subtotal":500.00,"sgst":12.50,"cgst":12.50,"tax":25.00,"total":525.00,"estimated_cooking_time":15,"created_at":"2026-08-05T10:00:00","items":[{"id":1,"menu_item_id":1,"quantity":2,"price":250.00,"special_instruction":"Less spicy","menu_item":{"id":1,"name":"Paneer Tikka","description":"Grilled","image":"uploads/menu/image.jpg","cook_time":15}}]}
```

## DELETE /orders/{id}
Authentication: Public  
Role: Customer (Public)  
Purpose: Delete an unprocessed order.

Request
```json
{}
```
Response
```json
{"message":"Order deleted successfully."}
```

# Kitchen

## GET /kitchen/orders
Authentication: JWT Required  
Role: Kitchen  
Purpose: List kitchen orders.

Request
```json
{}
```
Response
```json
[{"order_id":1,"session_id":1,"table_number":5,"customer_name":"Riya","status":"ORDER_RECEIVED","estimated_cooking_time":15,"created_at":"2026-08-05T10:00:00","items":[{"menu_item_name":"Paneer Tikka","quantity":2,"special_instruction":"Less spicy"}]}]
```

## PUT /kitchen/orders/{order_id}/preparing
Authentication: JWT Required  
Role: Kitchen  
Purpose: Mark an order as preparing.

Request
```json
{}
```
Response
```json
{"order_id":1,"session_id":1,"table_number":5,"customer_name":"Riya","status":"PREPARING","estimated_cooking_time":15,"created_at":"2026-08-05T10:00:00","items":[{"menu_item_name":"Paneer Tikka","quantity":2,"special_instruction":"Less spicy"}]}
```

## PUT /kitchen/orders/{order_id}/ready
Authentication: JWT Required  
Role: Kitchen  
Purpose: Mark an order ready to serve.

Request
```json
{}
```
Response
```json
{"order_id":1,"session_id":1,"table_number":5,"customer_name":"Riya","status":"READY_TO_SERVE","estimated_cooking_time":15,"created_at":"2026-08-05T10:00:00","items":[{"menu_item_name":"Paneer Tikka","quantity":2,"special_instruction":"Less spicy"}]}
```

# Waiter

## GET /waiter/orders
Authentication: JWT Required  
Role: Waiter  
Purpose: List unread ready-to-serve notifications.

Request
```json
{}
```
Response
```json
[{"notification_id":1,"order_id":1,"table_number":5,"customer_name":"Riya","order_status":"READY_TO_SERVE","ordered_items":[{"menu_item_name":"Paneer Tikka","quantity":2,"special_instruction":"Less spicy"}],"subtotal":500.00,"tax":25.00,"total":525.00,"estimated_cooking_time":15,"created_at":"2026-08-05T10:00:00"}]
```

## GET /waiter/calls
Authentication: JWT Required  
Role: Waiter  
Purpose: List open waiter calls.

Request
```json
{}
```
Response
```json
[{"call_id":1,"session_id":1,"table_number":5,"customer_name":"Riya","customer_email":"riya@example.com","number_of_people":2,"status":"OPEN","created_at":"2026-08-05T10:00:00"}]
```

## PUT /waiter/orders/{order_id}/served
Authentication: JWT Required  
Role: Waiter  
Purpose: Mark a ready order as served.

Request
```json
{}
```
Response
```json
{"order_id":1,"session_id":1,"table_number":5,"customer_name":"Riya","order_status":"SERVED","ordered_items":[{"menu_item_name":"Paneer Tikka","quantity":2,"special_instruction":"Less spicy"}],"subtotal":500.00,"tax":25.00,"total":525.00,"estimated_cooking_time":15,"created_at":"2026-08-05T10:00:00"}
```

## PUT /waiter/calls/{call_id}/completed
Authentication: JWT Required  
Role: Waiter  
Purpose: Complete a waiter call.

Request
```json
{}
```
Response
```json
{"call_id":1,"session_id":1,"table_number":5,"customer_name":"Riya","customer_email":"riya@example.com","number_of_people":2,"status":"COMPLETED","created_at":"2026-08-05T10:00:00"}
```

# Billing

## POST /billing/request
Authentication: Public  
Role: Customer (Public)  
Purpose: Generate and email a bill.

Request
```json
{"session_id":1}
```
Response
```json
{"bill_id":1,"session_id":1,"customer_name":"Riya","customer_email":"riya@example.com","table_number":5,"ordered_items":[{"order_id":1,"menu_item_name":"Paneer Tikka","quantity":2,"unit_price":250.00,"item_total":500.00}],"subtotal":500.00,"cgst":12.50,"sgst":12.50,"total_tax":25.00,"grand_total":525.00,"pdf_path":"uploads/invoices/invoice_1.pdf","is_paid":false,"created_at":"2026-08-05T10:00:00"}
```

## GET /billing/{session_id}
Authentication: Public  
Role: Customer (Public)  
Purpose: Get a session bill.

Request
```json
{}
```
Response
```json
{"bill_id":1,"session_id":1,"customer_name":"Riya","customer_email":"riya@example.com","table_number":5,"ordered_items":[{"order_id":1,"menu_item_name":"Paneer Tikka","quantity":2,"unit_price":250.00,"item_total":500.00}],"subtotal":500.00,"cgst":12.50,"sgst":12.50,"total_tax":25.00,"grand_total":525.00,"pdf_path":"uploads/invoices/invoice_1.pdf","is_paid":false,"created_at":"2026-08-05T10:00:00"}
```

## PUT /billing/{bill_id}/paid
Authentication: JWT Required  
Role: Admin, Waiter  
Purpose: Mark a bill as paid.

Request
```json
{}
```
Response
```json
{"bill_id":1,"session_id":1,"customer_name":"Riya","customer_email":"riya@example.com","table_number":5,"ordered_items":[{"order_id":1,"menu_item_name":"Paneer Tikka","quantity":2,"unit_price":250.00,"item_total":500.00}],"subtotal":500.00,"cgst":12.50,"sgst":12.50,"total_tax":25.00,"grand_total":525.00,"pdf_path":"uploads/invoices/invoice_1.pdf","is_paid":true,"created_at":"2026-08-05T10:00:00"}
```

# Feedback

## POST /feedback
Authentication: Public  
Role: Customer (Public)  
Purpose: Submit feedback for a session.

Request
```json
{"session_id":1,"rating":5,"comment":"Excellent food"}
```
Response
```json
{"id":1,"session_id":1,"rating":5,"comment":"Excellent food"}
```

## GET /feedback
Authentication: JWT Required  
Role: Admin  
Purpose: List feedback.

Request
```json
{"page":1,"page_size":20,"rating":5}
```
Response
```json
{"items":[{"id":1,"session_id":1,"customer_name":"Riya","customer_email":"riya@example.com","table_number":5,"rating":5,"comment":"Excellent food","submitted_at":"2026-08-05T10:00:00"}],"page":1,"page_size":20,"total_items":1,"total_pages":1}
```

## GET /feedback/{feedback_id}
Authentication: JWT Required  
Role: Admin  
Purpose: Get feedback.

Request
```json
{}
```
Response
```json
{"id":1,"session_id":1,"customer_name":"Riya","customer_email":"riya@example.com","table_number":5,"rating":5,"comment":"Excellent food","submitted_at":"2026-08-05T10:00:00"}
```

## DELETE /feedback/{feedback_id}
Authentication: JWT Required  
Role: Admin  
Purpose: Delete feedback.

Request
```json
{}
```
Response
```json
{"message":"Feedback deleted successfully."}
```

# Report/Dashboard

## GET /admin/reports/daily
Authentication: JWT Required  
Role: Admin  
Purpose: Get a daily report.

Request
```json
{"date":"2026-08-05"}
```
Response
```json
{"date":"2026-08-05","orders":10,"revenue":5250.00,"bills_generated":8,"bills_paid":7,"active_sessions":2,"completed_sessions":8,"average_order_value":750.00,"most_ordered_item":"Paneer Tikka","top_category":"Main Course","feedback_count":5,"average_rating":4.6}
```

## GET /admin/reports/monthly
Authentication: JWT Required  
Role: Admin  
Purpose: Get a monthly report.

Request
```json
{"year":2026,"month":8}
```
Response
```json
{"month":"August","year":2026,"total_orders":100,"completed_orders":90,"revenue":50000.00,"bills_generated":80,"bills_paid":75,"average_order_value":666.67,"top_item":"Paneer Tikka","top_category":"Main Course","feedback_count":50,"average_rating":4.5}
```

## GET /admin/reports/yearly
Authentication: JWT Required  
Role: Admin  
Purpose: Get a yearly report.

Request
```json
{"year":2026}
```
Response
```json
{"year":2026,"total_revenue":500000.00,"total_orders":1000,"average_rating":4.5,"monthly_sales":[{"month":"August","revenue":50000.00,"orders":100}]}
```

## GET /admin/reports
Authentication: JWT Required  
Role: Admin  
Purpose: Get a date-range report.

Request
```json
{"from":"2026-08-01","to":"2026-08-05"}
```
Response
```json
{"from_date":"2026-08-01","to_date":"2026-08-05","orders":100,"revenue":50000.00,"paid_bills":75,"average_rating":4.5,"most_ordered_item":"Paneer Tikka","top_category":"Main Course","average_order_value":666.67,"customer_sessions":80}
```

## GET /admin/reports/monthly/pdf
Authentication: JWT Required  
Role: Admin  
Purpose: Generate a monthly PDF report.

Request
```json
{"year":2026,"month":8}
```
Response
```json
{"pdf_path":"uploads/reports/August_2026_Report.pdf","excel_path":null}
```

## GET /admin/reports/monthly/excel
Authentication: JWT Required  
Role: Admin  
Purpose: Generate a monthly Excel report.

Request
```json
{"year":2026,"month":8}
```
Response
```json
{"pdf_path":null,"excel_path":"uploads/reports/August_2026_Report.xlsx"}
```

## GET /admin/charts/revenue
Authentication: JWT Required  
Role: Admin  
Purpose: Get monthly revenue chart data.

Request
```json
{"year":2026}
```
Response
```json
{"labels":["Jan","Feb"],"values":[10000.00,12000.00]}
```

## GET /admin/charts/top-items
Authentication: JWT Required  
Role: Admin  
Purpose: Get top-item chart data.

Request
```json
{"year":2026}
```
Response
```json
{"labels":["Paneer Tikka","Biryani"],"values":[120,95]}
```

## GET /admin/charts/top-categories
Authentication: JWT Required  
Role: Admin  
Purpose: Get top-category chart data.

Request
```json
{"year":2026}
```
Response
```json
{"labels":["Main Course","Starters"],"values":[200,150]}
```

## GET /admin/charts/order-status
Authentication: JWT Required  
Role: Admin  
Purpose: Get order-status chart data.

Request
```json
{"year":2026}
```
Response
```json
{"labels":["Order Received","Preparing","Ready To Serve","Served"],"values":[2,3,4,91]}
```

## GET /admin/charts/ratings
Authentication: JWT Required  
Role: Admin  
Purpose: Get rating chart data.

Request
```json
{"year":2026}
```
Response
```json
{"labels":["1 Star","2 Star","3 Star","4 Star","5 Star"],"values":[1,2,5,20,40]}
```
