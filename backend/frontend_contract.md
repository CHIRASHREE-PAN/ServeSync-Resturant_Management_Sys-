# Authentication
Endpoint: POST /auth/request-otp | Auth: Public | Role: Customer
Request Fields: email
Response Fields: message
Endpoint: POST /auth/verify-otp | Auth: Public | Role: Customer
Request Fields: email, otp
Response Fields: access_token, token_type, user_id, name, email, role
Endpoint: GET /auth/me | Auth: JWT | Role: Admin, Waiter, Kitchen
Request Fields: none
Response Fields: id, name, email, role

# Admin
Endpoint: POST /admin/users | Auth: JWT | Role: Admin
Request Fields: name, email, role
Response Fields: id, name, email, role, is_active, created_at
Endpoint: GET /admin/users | Auth: JWT | Role: Admin
Request Fields: page, page_size, search, role
Response Fields: items[].id, items[].name, items[].email, items[].role, items[].is_active, items[].created_at, page, page_size, total_items, total_pages
Endpoint: GET /admin/users/{staff_id} | Auth: JWT | Role: Admin
Request Fields: none
Response Fields: id, name, email, role, is_active, created_at
Endpoint: PUT /admin/users/{staff_id} | Auth: JWT | Role: Admin
Request Fields: name, email, role, is_active
Response Fields: id, name, email, role, is_active, created_at
Endpoint: DELETE /admin/users/{staff_id} | Auth: JWT | Role: Admin
Request Fields: none
Response Fields: none

# Customer Session
Endpoint: POST /customer/session | Auth: Public | Role: Customer
Request Fields: name, email, number_of_people, table_number
Response Fields: id, session_id, table_id, table_number, name, email, number_of_people, status, started_at, ended_at
Endpoint: GET /customer/session/{id} | Auth: Public | Role: Customer
Request Fields: none
Response Fields: id, session_id, table_id, table_number, name, email, number_of_people, status, started_at, ended_at
Endpoint: PUT /customer/session/{id} | Auth: Public | Role: Customer
Request Fields: name, email, number_of_people, table_number
Response Fields: id, session_id, table_id, table_number, name, email, number_of_people, status, started_at, ended_at
Endpoint: POST /customer/waiter-call | Auth: Public | Role: Customer
Request Fields: session_id
Response Fields: id, session_id, status, created_at
Endpoint: GET /customer/waiter-call/{id} | Auth: Public | Role: Customer
Request Fields: none
Response Fields: id, session_id, status, created_at

# Category
Endpoint: POST /categories | Auth: JWT | Role: Admin
Request Fields: name, description
Response Fields: id, name, description
Endpoint: GET /categories | Auth: Public | Role: Customer
Request Fields: page, page_size, search
Response Fields: items[].id, items[].name, items[].description, page, page_size, total_items, total_pages
Endpoint: GET /categories/{id} | Auth: Public | Role: Customer
Request Fields: none
Response Fields: id, name, description
Endpoint: PUT /categories/{id} | Auth: JWT | Role: Admin
Request Fields: name, description
Response Fields: id, name, description
Endpoint: DELETE /categories/{id} | Auth: JWT | Role: Admin
Request Fields: none
Response Fields: message

# Menu
Endpoint: POST /menu | Auth: JWT | Role: Admin
Request Fields: FormData: category_id, name, price, description, calories, cook_time, availability, chef_special, best_seller, image(File)
Response Fields: id, category_id, name, description, price, image, calories, cook_time, availability, chef_special, best_seller
Endpoint: GET /menu | Auth: Public | Role: Customer
Request Fields: page, page_size, search, category_id, chef_special, best_seller, sort_by, sort_dir
Response Fields: items[].id, items[].category_id, items[].name, items[].description, items[].price, items[].image, items[].calories, items[].cook_time, items[].availability, items[].chef_special, items[].best_seller, page, page_size, total_items, total_pages
Endpoint: GET /menu/search | Auth: Public | Role: Customer
Request Fields: query
Response Fields: [].id, [].category_id, [].name, [].description, [].price, [].image, [].calories, [].cook_time, [].availability, [].chef_special, [].best_seller
Endpoint: GET /menu/category/{category_id} | Auth: Public | Role: Customer
Request Fields: none
Response Fields: [].id, [].category_id, [].name, [].description, [].price, [].image, [].calories, [].cook_time, [].availability, [].chef_special, [].best_seller
Endpoint: GET /menu/{id} | Auth: Public | Role: Customer
Request Fields: none
Response Fields: id, category_id, name, description, price, image, calories, cook_time, availability, chef_special, best_seller
Endpoint: PUT /menu/{id} | Auth: JWT | Role: Admin
Request Fields: FormData: category_id, name, price, description, calories, cook_time, availability, chef_special, best_seller, image(File)
Response Fields: id, category_id, name, description, price, image, calories, cook_time, availability, chef_special, best_seller
Endpoint: DELETE /menu/{id} | Auth: JWT | Role: Admin
Request Fields: none
Response Fields: message

# Order
Endpoint: POST /orders | Auth: Public | Role: Customer
Request Fields: session_id, items[].menu_item_id, items[].quantity, items[].special_instruction
Response Fields: id, session_id, customer_session, status, subtotal, sgst, cgst, tax, total, estimated_cooking_time, created_at, items[].id, items[].menu_item_id, items[].quantity, items[].price, items[].special_instruction, items[].menu_item
Endpoint: GET /orders/session/{session_id} | Auth: Public | Role: Customer
Request Fields: none
Response Fields: [].id, [].session_id, [].customer_session, [].status, [].subtotal, [].sgst, [].cgst, [].tax, [].total, [].estimated_cooking_time, [].created_at, [].items
Endpoint: GET /orders/{id} | Auth: Public | Role: Customer
Request Fields: none
Response Fields: id, session_id, customer_session, status, subtotal, sgst, cgst, tax, total, estimated_cooking_time, created_at, items[].id, items[].menu_item_id, items[].quantity, items[].price, items[].special_instruction, items[].menu_item
Endpoint: DELETE /orders/{id} | Auth: Public | Role: Customer
Request Fields: none
Response Fields: message

# Kitchen
Endpoint: GET /kitchen/orders | Auth: JWT | Role: Kitchen
Request Fields: none
Response Fields: [].order_id, [].session_id, [].table_number, [].customer_name, [].status, [].estimated_cooking_time, [].created_at, [].items[].menu_item_name, [].items[].quantity, [].items[].special_instruction
Endpoint: PUT /kitchen/orders/{order_id}/preparing | Auth: JWT | Role: Kitchen
Request Fields: none
Response Fields: order_id, session_id, table_number, customer_name, status, estimated_cooking_time, created_at, items[].menu_item_name, items[].quantity, items[].special_instruction
Endpoint: PUT /kitchen/orders/{order_id}/ready | Auth: JWT | Role: Kitchen
Request Fields: none
Response Fields: order_id, session_id, table_number, customer_name, status, estimated_cooking_time, created_at, items[].menu_item_name, items[].quantity, items[].special_instruction

# Waiter
Endpoint: GET /waiter/orders | Auth: JWT | Role: Waiter
Request Fields: none
Response Fields: [].notification_id, [].order_id, [].table_number, [].customer_name, [].order_status, [].ordered_items[].menu_item_name, [].ordered_items[].quantity, [].ordered_items[].special_instruction, [].subtotal, [].tax, [].total, [].estimated_cooking_time, [].created_at
Endpoint: GET /waiter/calls | Auth: JWT | Role: Waiter
Request Fields: none
Response Fields: [].call_id, [].session_id, [].table_number, [].customer_name, [].customer_email, [].number_of_people, [].status, [].created_at
Endpoint: PUT /waiter/orders/{order_id}/served | Auth: JWT | Role: Waiter
Request Fields: none
Response Fields: order_id, session_id, table_number, customer_name, order_status, ordered_items[].menu_item_name, ordered_items[].quantity, ordered_items[].special_instruction, subtotal, tax, total, estimated_cooking_time, created_at
Endpoint: PUT /waiter/calls/{call_id}/completed | Auth: JWT | Role: Waiter
Request Fields: none
Response Fields: call_id, session_id, table_number, customer_name, customer_email, number_of_people, status, created_at

# Billing
Endpoint: POST /billing/request | Auth: Public | Role: Customer
Request Fields: session_id
Response Fields: bill_id, session_id, customer_name, customer_email, table_number, ordered_items[].order_id, ordered_items[].menu_item_name, ordered_items[].quantity, ordered_items[].unit_price, ordered_items[].item_total, subtotal, cgst, sgst, total_tax, grand_total, pdf_path, is_paid, created_at
Endpoint: GET /billing/{session_id} | Auth: Public | Role: Customer
Request Fields: none
Response Fields: bill_id, session_id, customer_name, customer_email, table_number, ordered_items[].order_id, ordered_items[].menu_item_name, ordered_items[].quantity, ordered_items[].unit_price, ordered_items[].item_total, subtotal, cgst, sgst, total_tax, grand_total, pdf_path, is_paid, created_at
Endpoint: PUT /billing/{bill_id}/paid | Auth: JWT | Role: Admin, Waiter
Request Fields: none
Response Fields: bill_id, session_id, customer_name, customer_email, table_number, ordered_items[].order_id, ordered_items[].menu_item_name, ordered_items[].quantity, ordered_items[].unit_price, ordered_items[].item_total, subtotal, cgst, sgst, total_tax, grand_total, pdf_path, is_paid, created_at

# Feedback
Endpoint: POST /feedback | Auth: Public | Role: Customer
Request Fields: session_id, rating, comment
Response Fields: id, session_id, rating, comment
Endpoint: GET /feedback | Auth: JWT | Role: Admin
Request Fields: page, page_size, rating
Response Fields: items[].id, items[].session_id, items[].customer_name, items[].customer_email, items[].table_number, items[].rating, items[].comment, items[].submitted_at, page, page_size, total_items, total_pages
Endpoint: GET /feedback/{feedback_id} | Auth: JWT | Role: Admin
Request Fields: none
Response Fields: id, session_id, customer_name, customer_email, table_number, rating, comment, submitted_at
Endpoint: DELETE /feedback/{feedback_id} | Auth: JWT | Role: Admin
Request Fields: none
Response Fields: message

# Admin Dashboard
Endpoint: GET /admin/reports/daily | Auth: JWT | Role: Admin
Request Fields: date
Response Fields: date, orders, revenue, bills_generated, bills_paid, active_sessions, completed_sessions, average_order_value, most_ordered_item, top_category, feedback_count, average_rating
Endpoint: GET /admin/reports/monthly | Auth: JWT | Role: Admin
Request Fields: year, month
Response Fields: month, year, total_orders, completed_orders, revenue, bills_generated, bills_paid, average_order_value, top_item, top_category, feedback_count, average_rating
Endpoint: GET /admin/reports/yearly | Auth: JWT | Role: Admin
Request Fields: year
Response Fields: year, total_revenue, total_orders, average_rating, monthly_sales[].month, monthly_sales[].revenue, monthly_sales[].orders
Endpoint: GET /admin/reports | Auth: JWT | Role: Admin
Request Fields: from, to
Response Fields: from_date, to_date, orders, revenue, paid_bills, average_rating, most_ordered_item, top_category, average_order_value, customer_sessions
Endpoint: GET /admin/reports/monthly/pdf | Auth: JWT | Role: Admin
Request Fields: year, month
Response Fields: pdf_path, excel_path
Endpoint: GET /admin/reports/monthly/excel | Auth: JWT | Role: Admin
Request Fields: year, month
Response Fields: pdf_path, excel_path
Endpoint: GET /admin/charts/revenue | Auth: JWT | Role: Admin
Request Fields: year
Response Fields: labels, values
Endpoint: GET /admin/charts/top-items | Auth: JWT | Role: Admin
Request Fields: year
Response Fields: labels, values
Endpoint: GET /admin/charts/top-categories | Auth: JWT | Role: Admin
Request Fields: year
Response Fields: labels, values
Endpoint: GET /admin/charts/order-status | Auth: JWT | Role: Admin
Request Fields: year
Response Fields: labels, values
Endpoint: GET /admin/charts/ratings | Auth: JWT | Role: Admin
Request Fields: year
Response Fields: labels, values