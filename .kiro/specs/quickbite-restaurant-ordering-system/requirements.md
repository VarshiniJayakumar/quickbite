# Requirements Document

## Introduction

QuickBite is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) restaurant ordering system. It enables customers to browse a restaurant menu, search and filter food items, manage a cart, place orders, track order status, and pay online. Administrators can manage menu items, orders, and users through a dedicated dashboard. The application is responsive across desktop, tablet, and mobile devices and is deployed on Netlify (frontend), Render (backend), and MongoDB Atlas (database).

---

## Glossary

- **System**: The QuickBite application as a whole
- **Client**: The React.js frontend application
- **Server**: The Node.js/Express.js backend application
- **Customer**: An authenticated user with the "user" role who browses the menu and places orders
- **Admin**: An authenticated user with the "admin" role who manages menu items, orders, and users
- **Guest**: An unauthenticated visitor browsing the application
- **AuthService**: The component responsible for JWT-based authentication and authorization
- **MenuService**: The component responsible for managing food items and categories
- **CartService**: The component responsible for managing a customer's cart
- **OrderService**: The component responsible for creating and tracking orders
- **PaymentService**: The component responsible for handling payment method selection and status
- **UserService**: The component responsible for managing user profiles and addresses
- **AdminDashboard**: The admin-only interface for managing the restaurant
- **UserDashboard**: The customer-facing interface for profile and order history
- **JWT**: JSON Web Token used for stateless authentication
- **Food_Item**: A menu entry with title, description, price, image, category, rating, and availability flag
- **Cart**: A per-customer collection of food items and quantities, persisted in the database
- **Order**: A confirmed purchase containing items, total amount, payment status, order status, and delivery address
- **Order_Status**: One of: Pending → Confirmed → Preparing → Out for Delivery → Delivered
- **Payment_Status**: One of: Pending, Paid, Failed
- **Payment_Method**: One of: Cash on Delivery (COD), UPI, Card
- **Category**: A food classification label: All, Burger, Pizza, Drinks, or Dessert
- **Skeleton_Loader**: A placeholder UI component shown while data is being fetched
- **Toast_Notification**: A brief, non-blocking message displayed to the user after an action

---

## Requirements

---

### Requirement 1: User Registration and Authentication

**User Story:** As a Guest, I want to register an account and log in, so that I can place orders and track my order history.

#### Acceptance Criteria

1. WHEN a Guest submits a registration form with a valid name, email, password, and phone number, THE AuthService SHALL create a new user account with the role "user", hash the password using bcryptjs, and return a JWT.
2. WHEN a Guest submits a login form with a valid email and password, THE AuthService SHALL verify the credentials and return a signed JWT with a 7-day expiration.
3. IF a Guest submits a registration form with an email that already exists, THEN THE AuthService SHALL return a 409 Conflict error with the message "Email already registered" and SHALL NOT return a JWT.
4. IF a Guest submits a login form with invalid credentials, THEN THE AuthService SHALL return a 401 Unauthorized error with the message "Invalid email or password".
5. WHEN a Customer or Admin sends a request to a protected route without a valid JWT, THE AuthService SHALL return a 401 Unauthorized error.
6. THE Client SHALL store the JWT in localStorage and attach it as a Bearer token in the Authorization header for all authenticated API requests.
7. WHEN a Customer clicks "Logout", THE AuthService SHALL invalidate the client-side session by removing the JWT from localStorage.
8. WHERE role-based access control is enforced, THE AuthService SHALL reject requests from Customers attempting to access Admin-only routes with a 403 Forbidden error.

---

### Requirement 2: Browse and Search Menu

**User Story:** As a Guest or Customer, I want to browse, search, and filter the menu, so that I can find the food items I want to order.

#### Acceptance Criteria

1. THE MenuService SHALL expose a paginated GET endpoint that returns a list of available Food_Items, supporting query parameters for search keyword, category, sort field (price or rating), and sort order.
2. WHEN a Guest or Customer types a keyword in the search bar, THE Client SHALL send a debounced request (300ms delay) to the MenuService and display matching Food_Items by title or description.
3. WHEN a Guest or Customer selects a Category filter, THE Client SHALL display only Food_Items belonging to the selected Category.
4. WHEN a Guest or Customer selects a sort option (Price ascending, Price descending, Rating descending), THE MenuService SHALL return Food_Items ordered accordingly.
5. WHILE any menu fetch request is in progress, THE Client SHALL display Skeleton_Loaders in place of Food_Item cards, including during subsequent requests triggered by search or filter changes.
6. IF the MenuService returns zero results for a search query, THEN THE Client SHALL display a "No items found" message with a suggestion to clear the search.
7. THE Client SHALL display Food_Items in a responsive grid: 4 columns on desktop (≥1280px), 2 columns on tablet (≥768px), and 1 column on mobile (<768px).

---

### Requirement 3: Food Item Details

**User Story:** As a Guest or Customer, I want to view detailed information about a food item, so that I can make an informed ordering decision.

#### Acceptance Criteria

1. WHEN a Guest or Customer clicks on a Food_Item card, THE Client SHALL navigate to the Food Item Details page for that item.
2. THE Client SHALL display the Food_Item's title, description, price, category, rating, and an image gallery on the details page.
3. THE Client SHALL render an ingredients list for the Food_Item on the details page.
4. WHEN a Customer sets a quantity (minimum 1) and clicks "Add to Cart", THE CartService SHALL add the specified quantity of the Food_Item to the Customer's Cart.
5. IF a Food_Item has the "available" flag set to false, THEN THE Client SHALL display an "Unavailable" badge and disable the "Add to Cart" button; THE Client SHALL enable "Add to Cart" for all Food_Items with the "available" flag set to true.

---

### Requirement 4: Cart Management

**User Story:** As a Customer, I want to manage my cart, so that I can review and adjust my order before checkout.

#### Acceptance Criteria

1. THE CartService SHALL persist each Customer's Cart in MongoDB, associated with the Customer's userId.
2. WHEN a Customer adds a Food_Item already present in the Cart, THE CartService SHALL increment the quantity of that item rather than creating a duplicate entry.
3. WHEN a Customer updates the quantity of a Cart item to zero, THE CartService SHALL remove that item from the Cart.
4. WHEN a Customer clicks "Remove" on a Cart item, THE CartService SHALL delete that item from the Cart.
5. THE Client SHALL display the Cart page with each item's title, unit price, quantity controls, and line total.
6. THE Client SHALL display the Cart subtotal, a tax amount calculated at 5% of the subtotal, and the final total.
7. WHEN the Cart is empty, THE Client SHALL display an "Your cart is empty" message and a link to the Menu page.
8. THE Client SHALL display the current Cart item count as a badge on the Cart icon in the Navbar.

---

### Requirement 5: Checkout and Order Placement

**User Story:** As a Customer, I want to enter my delivery details and payment method, so that I can place an order.

#### Acceptance Criteria

1. WHEN a Customer navigates to the Checkout page, THE Client SHALL display a form requiring a delivery address and phone number.
2. THE Client SHALL present three Payment_Method options on the Checkout page: Cash on Delivery (COD), UPI, and Card.
3. WHEN a Customer submits the Checkout form with valid delivery details and a selected Payment_Method, THE OrderService SHALL create an Order with Order_Status "Pending" and Payment_Status "Pending".
4. WHEN a Customer selects UPI or Card as the Payment_Method and completes payment, THE PaymentService SHALL update the Payment_Status to "Paid".
5. IF the Checkout form is submitted without a delivery address or phone number, THEN THE Client SHALL display inline validation errors and prevent form submission, even if the validation errors are not visible to the user.
6. WHEN an Order is successfully created, THE OrderService SHALL clear the Customer's Cart and THE Client SHALL redirect the Customer to the Order confirmation page.
7. WHEN an Order is successfully created, THE Client SHALL display a Toast_Notification with the message "Order placed successfully!".

---

### Requirement 6: Order Tracking

**User Story:** As a Customer, I want to track the status of my orders, so that I know when my food will arrive.

#### Acceptance Criteria

1. THE OrderService SHALL expose an authenticated GET endpoint that returns the authenticated Customer's order history, sorted by createdAt descending; THE AuthService SHALL enforce authentication on this endpoint and return a 401 Unauthorized error if the JWT is missing or invalid.
2. WHEN a Customer views their UserDashboard, THE Client SHALL display a list of their Orders, each showing the order ID, items summary, total amount, Payment_Status, and current Order_Status.
3. THE Client SHALL display the Order_Status as a visual timeline with the following states: Pending → Confirmed → Preparing → Out for Delivery → Delivered, highlighting the current state.
4. WHEN the Order_Status is updated by an Admin, THE Client SHALL reflect the updated status within 30 seconds without requiring a full page reload (via polling or WebSocket).
5. IF a Customer attempts to access an Order that does not belong to them, THEN THE OrderService SHALL return a 403 Forbidden error.

---

### Requirement 7: User Profile Management

**User Story:** As a Customer, I want to manage my profile and saved addresses, so that I can keep my account information up to date.

#### Acceptance Criteria

1. THE UserService SHALL expose a GET endpoint that returns the authenticated Customer's profile data (name, email, phone, address), excluding the password field.
2. WHEN a Customer submits a profile update form with a valid name, phone, or address, THE UserService SHALL update the corresponding fields and return the updated profile.
3. WHEN a Customer submits a profile update form with an email field, THE UserService SHALL first validate the email format and, only if valid, check whether the email is already associated with another account, returning a 409 Conflict error if a duplicate is found.
4. WHEN a Customer's current password is successfully verified, THE AuthService SHALL then accept and apply the new password update.
5. IF a Customer submits a new password that is fewer than 8 characters, THEN THE Client SHALL display a validation error and prevent submission.

---

### Requirement 8: Admin — Menu Management

**User Story:** As an Admin, I want to create, update, and delete food items, so that I can keep the menu current.

#### Acceptance Criteria

1. WHEN an Admin submits a valid "Create Food Item" form with title, description, price, image, and category, THE MenuService SHALL persist the new Food_Item in MongoDB and return the created document.
2. WHEN an Admin submits a valid "Edit Food Item" form, THE MenuService SHALL update the specified Food_Item fields and return the updated document.
3. WHEN an Admin clicks "Delete" on a Food_Item and confirms the action, THE MenuService SHALL remove the Food_Item from MongoDB.
4. WHEN an Admin toggles the availability switch on a Food_Item, THE MenuService SHALL update the "available" field and THE Client SHALL reflect the change immediately.
5. THE MenuService SHALL accept image uploads, store the uploaded file, and persist the file path in the Food_Item document.
6. IF an Admin submits a "Create Food Item" form with a missing required field (title, price, category), THEN THE Client SHALL display inline validation errors and prevent submission.

---

### Requirement 9: Admin — Order Management

**User Story:** As an Admin, I want to view and update the status of all customer orders, so that I can manage order fulfillment.

#### Acceptance Criteria

1. THE OrderService SHALL expose a GET endpoint accessible only to Admins that returns all Orders, supporting pagination and filtering by Order_Status.
2. WHEN an Admin views the AdminDashboard orders table, THE Client SHALL display each Order's ID, customer name, items summary, total amount, Payment_Status, Order_Status, and createdAt date.
3. WHEN an Admin selects a new Order_Status from the status dropdown for an Order, THE OrderService SHALL update the Order_Status and THE Client SHALL display a Toast_Notification confirming the update.
4. THE AdminDashboard SHALL display summary statistics: total orders count, total revenue, pending orders count, and delivered orders count.

---

### Requirement 10: Admin — User Management

**User Story:** As an Admin, I want to view and manage user accounts, so that I can oversee the customer base.

#### Acceptance Criteria

1. THE UserService SHALL expose a GET endpoint accessible only to Admins that returns a paginated list of all users with their name, email, phone, role, and createdAt date, excluding password fields.
2. WHEN an Admin views the AdminDashboard users table, THE Client SHALL display each user's name, email, role, and registration date.
3. WHEN an Admin changes a user's role, THE UserService SHALL update the role field for that user and return a 200 OK response with the updated user data.
4. IF an Admin attempts to delete their own account, THEN THE UserService SHALL return a 400 Bad Request error with the message "Admin cannot delete their own account".

---

### Requirement 11: Admin Dashboard Statistics and Charts

**User Story:** As an Admin, I want to view sales statistics and charts, so that I can monitor the restaurant's performance.

#### Acceptance Criteria

1. WHEN an Admin loads the AdminDashboard, THE Client SHALL fetch and display four summary stat cards: Total Orders, Total Revenue, Pending Orders, and Total Users.
2. THE AdminDashboard SHALL render a bar chart showing order counts grouped by day for the past 7 days.
3. THE AdminDashboard SHALL render a pie chart showing revenue distribution by Category.
4. WHILE AdminDashboard data is loading, THE Client SHALL display Skeleton_Loaders in place of stat cards and charts.

---

### Requirement 12: Responsive UI and Navigation

**User Story:** As a Guest or Customer, I want a consistent and responsive navigation experience, so that I can use the application on any device.

#### Acceptance Criteria

1. THE Client SHALL render a sticky Navbar with glassmorphism effect (semi-transparent background with backdrop-filter blur) that remains visible during scrolling.
2. THE Navbar SHALL display the QuickBite logo, navigation links (Home, Menu, Cart, Dashboard/Login), the Cart item count badge, and a Dark Mode toggle.
3. WHEN the viewport width is less than 768px, THE Client SHALL collapse the Navbar links into a hamburger menu.
4. WHEN a Guest or Customer clicks a navigation link, THE Client SHALL navigate to the target page using React Router without a full page reload.
5. THE Client SHALL implement smooth scrolling for all anchor-based navigation within a page.
6. THE Client SHALL apply the primary color palette: Primary #FF6B35 (Orange), Secondary #1A1A1A (Dark Black), Accent #FFD166 (Golden Yellow), Background #F8F9FA (Light Gray), Text #333333.

---

### Requirement 13: Dark Mode

**User Story:** As a Guest or Customer, I want to toggle dark mode, so that I can use the application comfortably in low-light environments.

#### Acceptance Criteria

1. WHEN a user clicks the Dark Mode toggle, THE Client SHALL switch the application theme between light and dark modes.
2. THE Client SHALL persist the user's theme preference in localStorage so that the preference is retained across sessions.
3. WHILE dark mode is active, THE Client SHALL apply a dark background (#1A1A1A) and light text (#F8F9FA) across all pages and components.

---

### Requirement 14: Home Page and Animations

**User Story:** As a Guest or Customer, I want an engaging home page, so that I can discover the restaurant's offerings quickly.

#### Acceptance Criteria

1. THE Client SHALL render a Hero Section with an animated headline and a call-to-action button linking to the Menu page, using Framer Motion for entrance animations.
2. THE Client SHALL render a horizontal-scrollable Popular Categories slider on mobile (<768px) and a row layout on larger viewports.
3. THE Client SHALL render a Featured Foods grid displaying up to 8 promoted Food_Items; if more than 8 are returned by the MenuService, THE Client SHALL display only the first 8; WHEN zero promoted items exist, THE Client SHALL display the Featured Foods section with placeholder content or a "No featured items available" message.
4. THE Client SHALL render animated offer banners using Framer Motion.
5. THE Client SHALL render an auto-sliding testimonials carousel that advances every 4 seconds.

---

### Requirement 15: Error Handling and Notifications

**User Story:** As a Guest, Customer, or Admin, I want clear feedback when actions succeed or fail, so that I always know the state of the application.

#### Acceptance Criteria

1. WHEN any API request fails due to a network error, THE Client SHALL display a Toast_Notification with a human-readable error message.
2. IF the Server returns a 500 Internal Server Error, THEN THE Server SHALL log the full error stack trace and return a JSON response with the message "An unexpected error occurred. Please try again later."
3. THE Client SHALL render a dedicated 404 Not Found page for unmatched routes.
4. WHEN a Customer submits a form, THE Client SHALL disable the submit button and display a loading spinner until the API response is received; THE Client SHALL hide the spinner and re-enable the button immediately upon receiving any API response, regardless of success or failure.
5. THE Server SHALL validate all incoming request bodies using a validation middleware and return 400 Bad Request errors with field-level error details for invalid inputs.

---

### Requirement 16: Security

**User Story:** As a system operator, I want the application to follow security best practices, so that customer data and the system are protected.

#### Acceptance Criteria

1. THE Server SHALL use the `helmet` middleware to set secure HTTP headers on all responses.
2. THE Server SHALL use the `cors` middleware configured to allow requests only from the registered frontend origin.
3. THE Server SHALL apply a rate limiter of 100 requests per 15-minute window per IP address to all API routes.
4. THE AuthService SHALL hash all passwords using bcryptjs with a salt round of 10 before storing them in MongoDB.
5. THE Server SHALL never return password fields in any API response.
6. WHEN a JWT is received, THE AuthService SHALL verify the token signature and expiration before granting access to protected routes; IF verification fails for any reason, THE AuthService SHALL always deny access with a 401 Unauthorized error.
