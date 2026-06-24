# Design Document — QuickBite Restaurant Ordering System

## Overview

QuickBite is a full-stack MERN restaurant ordering system. The frontend is a React 18 SPA built with Vite and Tailwind CSS, deployed to Netlify. The backend is a Node.js/Express REST API connected to MongoDB Atlas, deployed to Render. Communication between client and server is exclusively over HTTPS via a JSON REST API, with JWT-based stateless authentication.

---

## System Architecture

```
┌─────────────────────────────────┐        HTTPS/REST        ┌───────────────────────────────────┐
│         Client (Netlify)        │ ◄──────────────────────► │        Server (Render)            │
│   React 18 + Vite + Tailwind    │                           │   Node.js + Express               │
│   Context API, React Router v6  │                           │   Mongoose + JWT + Multer         │
└─────────────────────────────────┘                           └──────────────┬────────────────────┘
                                                                             │ Mongoose
                                                                             ▼
                                                                  ┌──────────────────────┐
                                                                  │   MongoDB Atlas       │
                                                                  │   (Cloud Database)    │
                                                                  └──────────────────────┘
```

---

## Project Structure

```
quickbite/
├── client/                          # React 18 + Vite + Tailwind CSS
│   └── src/
│       ├── main.jsx                 # Entry point, context providers
│       ├── App.jsx                  # Route definitions
│       ├── index.css                # Tailwind base + custom utilities
│       ├── context/
│       │   ├── AuthContext.jsx      # JWT auth state, login/register/logout
│       │   ├── CartContext.jsx      # Cart state, add/update/remove/clear
│       │   └── ThemeContext.jsx     # Dark mode, localStorage persistence
│       ├── services/
│       │   └── api.js               # Axios instance, interceptors, VITE_API_URL
│       ├── components/
│       │   ├── Navbar.jsx           # Sticky glassmorphism navbar, mobile hamburger
│       │   ├── Footer.jsx           # Links, social icons, newsletter
│       │   ├── FoodCard.jsx         # Card with add-to-cart, availability badge
│       │   ├── SkeletonCard.jsx     # Animated loading placeholder
│       │   ├── ProtectedRoute.jsx   # Redirects unauthenticated users to /login
│       │   └── AdminRoute.jsx       # Restricts non-admin users
│       ├── layouts/
│       │   ├── MainLayout.jsx       # Navbar + Footer wrapper
│       │   └── AdminLayout.jsx      # Sidebar nav + main content area
│       └── pages/
│           ├── HomePage.jsx         # Hero, categories, featured, offers, testimonials
│           ├── MenuPage.jsx         # Search (debounced 300ms), filter, sort, pagination
│           ├── FoodDetailPage.jsx   # Image, ingredients, quantity selector, add-to-cart
│           ├── CartPage.jsx         # Items, subtotal/tax(5%)/total, checkout CTA
│           ├── CheckoutPage.jsx     # Address, phone, COD/UPI/Card, place order
│           ├── OrderConfirmationPage.jsx  # Success screen, order summary
│           ├── LoginPage.jsx        # Email/password, JWT stored in localStorage
│           ├── RegisterPage.jsx     # Name/email/password/phone validation
│           ├── UserDashboardPage.jsx # Orders + status timeline (polls 30s), profile edit
│           ├── NotFoundPage.jsx     # 404 page
│           └── admin/
│               ├── AdminDashboardPage.jsx  # Stats cards + bar chart + pie chart
│               ├── AdminFoodsPage.jsx      # CRUD with image upload modal
│               ├── AdminOrdersPage.jsx     # Table with inline status dropdown
│               └── AdminUsersPage.jsx      # Table with role toggle, block, delete

└── server/                          # Node.js + Express
    ├── index.js                     # App bootstrap, middleware, routes, error handler
    ├── config/db.js                 # Mongoose connect
    ├── models/
    │   ├── User.js
    │   ├── Food.js
    │   ├── Cart.js
    │   └── Order.js
    ├── controllers/
    │   ├── authController.js
    │   ├── userController.js
    │   ├── foodController.js
    │   ├── cartController.js
    │   ├── orderController.js
    │   └── adminController.js
    ├── middleware/
    │   ├── auth.js                  # protect (JWT verify), adminOnly (role check)
    │   ├── errorHandler.js          # Global error handler
    │   ├── upload.js                # Multer disk storage, 5MB, jpeg/jpg/png/webp
    │   └── validate.js              # express-validator result checker
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── foodRoutes.js
    │   ├── cartRoutes.js
    │   ├── orderRoutes.js
    │   └── adminRoutes.js
    └── utils/
        ├── generateToken.js         # jwt.sign, 7-day expiry
        └── seedData.js              # 12 food items + admin user seeder
```

---

## Data Models

### User

| Field | Type | Constraints |
|-------|------|-------------|
| `name` | String | required, maxLength 100 |
| `email` | String | required, unique, lowercase |
| `password` | String | required, minLength 8, select: false, bcrypt salt 10 |
| `role` | String (enum) | `['user', 'admin']`, default `'user'` |
| `phone` | String | maxLength 20 |
| `address` | String | maxLength 300 |
| `isBlocked` | Boolean | default `false` |
| `timestamps` | — | createdAt, updatedAt |

### Food

| Field | Type | Constraints |
|-------|------|-------------|
| `title` | String | required, maxLength 200 |
| `description` | String | maxLength 1000 |
| `price` | Number | required, min 0 |
| `image` | String | file path or URL |
| `category` | String (enum) | `['Burger', 'Pizza', 'Noodles', 'Drinks', 'Dessert']`, required |
| `ingredients` | [String] | — |
| `rating` | Number | 0–5, default 0 |
| `available` | Boolean | default `true` |
| `featured` | Boolean | default `false` |

Text index on `title` + `description` for full-text search.

### Cart

| Field | Type | Constraints |
|-------|------|-------------|
| `userId` | ObjectId (ref User) | unique |
| `items` | Array | `[{ foodId: ObjectId (ref Food), quantity: Number (min 1) }]` |

One cart document per user (upsert pattern). Items are populated with Food documents on read.

### Order

| Field | Type | Constraints |
|-------|------|-------------|
| `userId` | ObjectId (ref User) | required |
| `items` | Array | Snapshot: `[{ foodId, title, price, image, category, quantity }]` |
| `subtotal` | Number | — |
| `tax` | Number | 5% of subtotal |
| `totalAmount` | Number | subtotal + tax |
| `paymentMethod` | String (enum) | `['COD', 'UPI', 'Card']` |
| `paymentStatus` | String (enum) | `['Pending', 'Paid', 'Failed']`, default `'Pending'` |
| `orderStatus` | String (enum) | `['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled']`, default `'Pending'` |
| `deliveryAddress` | String | required, maxLength 300 |
| `phone` | String | required, maxLength 20 |
| `timestamps` | — | createdAt, updatedAt |

Order items are stored as a snapshot (not references) to preserve the menu state at the time of purchase.

---

## API Routes

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | Public | Create account; returns JWT |
| POST | `/login` | Public | Verify credentials; returns JWT |
| GET | `/me` | Private | Get current authenticated user |

### Foods — `/api/foods`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | Paginated list; query params: `search`, `category`, `sortBy`, `order`, `page`, `limit` |
| GET | `/featured` | Public | Up to 8 featured items |
| GET | `/:id` | Public | Single food item |
| POST | `/` | Admin | Create food item (`multipart/form-data`) |
| PUT | `/:id` | Admin | Update food item |
| PATCH | `/:id/availability` | Admin | Toggle `available` flag |
| DELETE | `/:id` | Admin | Delete food item |

### Cart — `/api/cart`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Private | Get user's cart (populated) |
| POST | `/` | Private | Add item `{ foodId, quantity }` |
| PUT | `/:foodId` | Private | Update quantity (quantity 0 removes item) |
| DELETE | `/:foodId` | Private | Remove specific item |
| DELETE | `/clear` | Private | Empty entire cart |

### Orders — `/api/orders`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/` | Private | Place order; clears cart on success |
| GET | `/my` | Private | User's own orders, sorted by `createdAt` desc |
| GET | `/:id` | Private | Single order (owner or admin only) |
| PATCH | `/:id/pay` | Private | Mark payment status as `Paid` |
| PATCH | `/:id/cancel` | Private | Cancel order (allowed in `Pending` or `Confirmed` status only) |

### Admin — `/api/admin` (all require `adminOnly` middleware)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats` | Dashboard stats + chart data |
| GET | `/users` | Paginated user list |
| PUT | `/users/:id/role` | Change user role |
| PUT | `/users/:id/block` | Toggle user block status |
| DELETE | `/users/:id` | Delete user (cannot delete self) |
| GET | `/orders` | All orders, filterable by status |
| PUT | `/orders/:id/status` | Update order status |

### Users — `/api/users`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/profile` | Private | Get profile (password excluded) |
| PUT | `/profile` | Private | Update name, phone, address |
| PUT | `/email` | Private | Update email (duplicate check) |
| PUT | `/password` | Private | Change password (verifies current password first) |

---

## Component Architecture

### Context Providers

Three React Context providers are composed at the application root in `main.jsx`:

**AuthContext**
- Holds `user` object and `token` string from localStorage.
- Exposes `login(email, password)`, `register(name, email, password, phone)`, and `logout()`.
- On mount, reads stored token and user from localStorage to rehydrate state.
- `logout()` clears localStorage and resets state.

**CartContext**
- Maintains a local `cart` array mirrored from the server.
- Exposes `addToCart(foodId, quantity)`, `updateCartItem(foodId, quantity)`, `removeFromCart(foodId)`, `clearCart()`.
- Derives `itemCount` (sum of quantities) and `cartTotal` (sum of price × quantity) for display in Navbar badge and Cart page.
- Fetches cart from the server on authentication state change.

**ThemeContext**
- Holds `isDark` boolean.
- Exposes `toggleTheme()`.
- Persists preference to `localStorage` key `theme`.
- On mount, reads from localStorage; defaults to light mode if no preference is stored.
- Applies/removes the `dark` class on the `<html>` element (Tailwind `class` strategy).

### Route Guards

**ProtectedRoute** — Wraps any route requiring authentication. Reads `user` from AuthContext; if null, redirects to `/login` using React Router `<Navigate>`.

**AdminRoute** — Wraps admin-only routes. Reads `user` from AuthContext; if `user.role !== 'admin'`, redirects to `/` (home).

### Layouts

**MainLayout** — Renders `<Navbar />`, `<Outlet />` (page content), and `<Footer />`. Used by all public and customer-facing pages.

**AdminLayout** — Renders a fixed sidebar with navigation links to admin sub-pages and an `<Outlet />` for the page content area. Only accessible through `AdminRoute`.

### HTTP Service Layer (`services/api.js`)

A single Axios instance configured with `baseURL` from the `VITE_API_URL` environment variable.

- **Request interceptor**: reads the JWT from localStorage and attaches it as `Authorization: Bearer <token>` on every outgoing request.
- **Response interceptor**: catches 401 responses and triggers logout (clears localStorage, redirects to `/login`); catches 500 and network errors and surfaces them as human-readable toast messages via `react-hot-toast`.

---

## Page Descriptions

### Public Pages

**HomePage** (`/`)
Sections rendered in order: Hero (Framer Motion entrance animation, CTA to `/menu`), Popular Categories horizontal scroll (mobile) / row (desktop), Featured Foods grid (up to 8 items from `/api/foods/featured`), Offer Banners (Framer Motion), Testimonials carousel (auto-advances every 4 seconds).

**MenuPage** (`/menu`)
Fetches `/api/foods` with debounced (300ms) search query, category filter, sort selection, and pagination controls. Displays SkeletonCard placeholders during loading. Shows "No items found" state when the API returns zero results. Responsive grid: 4 columns (≥1280px), 2 columns (≥768px), 1 column (mobile).

**FoodDetailPage** (`/menu/:id`)
Fetches single item from `/api/foods/:id`. Displays image, title, description, category, rating, ingredients list, and a quantity stepper (min 1). "Add to Cart" button is disabled and shows "Unavailable" badge when `available` is false. Authenticated customers can add to cart; unauthenticated users are redirected to login.

**LoginPage** (`/login`) / **RegisterPage** (`/register`)
Form pages that call AuthContext methods. On success, redirect to the previously attempted route or `/`. Client-side validation with inline error messages.

**NotFoundPage** (`/404` and all unmatched routes)
Static 404 page with a link back to the home page.

### Customer Pages (Protected)

**CartPage** (`/cart`)
Reads cart state from CartContext. Displays item rows with quantity controls and remove buttons. Shows subtotal, 5% tax, and total. Empty state shows link to `/menu`. Checkout CTA navigates to `/checkout`.

**CheckoutPage** (`/checkout`)
Form with delivery address and phone fields. Payment method selector (COD / UPI / Card). On valid submit, calls `POST /api/orders`. Submit button is disabled with a loading spinner while the request is in flight. On success, redirects to `/order-confirmation/:id` and shows a success toast.

**OrderConfirmationPage** (`/order-confirmation/:id`)
Success screen displaying a summary of the placed order: items, totals, payment method, and estimated delivery note.

**UserDashboardPage** (`/dashboard`)
Two tabs: **Orders** and **Profile**.
- Orders tab: fetches `GET /api/orders/my` and renders each order with a visual status timeline (Pending → Confirmed → Preparing → Out for Delivery → Delivered). Polls `GET /api/orders/my` every 30 seconds to surface status updates without a full page reload.
- Profile tab: form for updating name, phone, address, email, and password. Each update calls its respective `PUT /api/users/*` endpoint.

### Admin Pages (Admin Only)

**AdminDashboardPage** (`/admin`)
Four stat cards (Total Orders, Total Revenue, Pending Orders, Total Users) loaded from `GET /api/admin/stats`. Bar chart (Recharts `BarChart`) showing order counts per day for the last 7 days. Pie chart (Recharts `PieChart`) showing revenue distribution by food category. SkeletonCard placeholders shown while data loads.

**AdminFoodsPage** (`/admin/foods`)
Paginated table of all food items. "Add Food" button opens a modal form (`multipart/form-data`) for creating a new item. Each row has Edit and Delete actions. Edit opens the same modal pre-populated. Delete prompts for confirmation. Availability toggle calls `PATCH /api/foods/:id/availability` inline.

**AdminOrdersPage** (`/admin/orders`)
Table of all orders fetched from `GET /api/admin/orders` with status filter. Each row includes an inline `<select>` dropdown for Order_Status; on change, calls `PUT /api/admin/orders/:id/status` and shows a success toast.

**AdminUsersPage** (`/admin/users`)
Paginated table of all users from `GET /api/admin/users`. Columns: name, email, role, registration date, and actions. Actions: role toggle (user ↔ admin), block/unblock, and delete. Delete is prevented for the currently logged-in admin (backend enforces this with a 400 error).

---

## Backend Middleware Pipeline

Requests to `/api/*` pass through the following middleware in order:

```
Request
  → helmet()              # Secure HTTP headers
  → cors({ origin: CLIENT_URL })
  → express.json()
  → express-rate-limit (100 req / 15 min / IP)
  → Route handler
      → protect (JWT verify)       # On protected routes
      → adminOnly (role check)     # On admin routes
      → validate (express-validator result check)
      → Controller function
  → errorHandler (global)
  → Response
```

### Middleware Details

**`auth.js` — `protect`**
Extracts the JWT from the `Authorization: Bearer <token>` header. Verifies signature and expiry using `jwt.verify`. If valid, attaches the decoded user payload to `req.user` and calls `next()`. If missing or invalid, returns `401 Unauthorized`.

**`auth.js` — `adminOnly`**
Reads `req.user.role`. If `'admin'`, calls `next()`. Otherwise returns `403 Forbidden`.

**`errorHandler.js`**
Global Express error handler (`(err, req, res, next)` signature). Handles:
- Mongoose `ValidationError` → 400 with field-level details
- Mongoose `CastError` (bad ObjectId) → 404
- Mongoose duplicate key error (code 11000) → 409 Conflict
- JWT `JsonWebTokenError` / `TokenExpiredError` → 401
- Multer errors (file size, file type) → 400
- All other errors → 500 with the message "An unexpected error occurred. Please try again later." (full stack trace logged to server console)

**`upload.js`**
Multer configured with disk storage (`uploads/` directory). File filter allows only `image/jpeg`, `image/jpg`, `image/png`, `image/webp`. File size limit: 5 MB. Field name: `image`.

**`validate.js`**
Calls `validationResult(req)` from `express-validator`. If errors exist, responds immediately with `400 Bad Request` and an array of field-level error messages. Otherwise calls `next()`.

---

## Authentication Flow

```
Client                                    Server
  │                                          │
  │  POST /api/auth/register { name, email,  │
  │  password, phone }                       │
  │ ───────────────────────────────────────► │
  │                                          │  Hash password (bcrypt, salt 10)
  │                                          │  Save User document
  │                                          │  generateToken(userId) → JWT (7d)
  │ ◄─────────────────────────────────────── │
  │  { token, user }                         │
  │                                          │
  │  Store token + user in localStorage      │
  │  Attach to all subsequent requests:      │
  │  Authorization: Bearer <token>           │
  │ ───────────────────────────────────────► │
  │                                          │  protect middleware: jwt.verify()
  │                                          │  Attach decoded user to req.user
  │ ◄─────────────────────────────────────── │
  │  Protected resource                      │
```

Token is stored in `localStorage`. On app load, AuthContext reads the token and user from localStorage to rehydrate the session without requiring a new login.

---

## Order Placement Flow

```
Customer                     Client                          Server
    │                           │                               │
    │  Fill checkout form        │                               │
    │ ──────────────────────►   │                               │
    │                           │  POST /api/orders             │
    │                           │  { deliveryAddress, phone,    │
    │                           │    paymentMethod }            │
    │                           │ ────────────────────────────► │
    │                           │                               │  Fetch user's Cart
    │                           │                               │  Snapshot cart items
    │                           │                               │  Calculate subtotal/tax/total
    │                           │                               │  Create Order document
    │                           │                               │  Clear Cart
    │                           │ ◄──────────────────────────── │
    │                           │  { order }                    │
    │                           │                               │
    │                           │  Clear CartContext state       │
    │                           │  Show success toast            │
    │                           │  Navigate to /order-confirmation/:id
    │ ◄──────────────────────   │
```

---

## Frontend UI Design

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#FF6B35` | Buttons, badges, active states, brand accents |
| Secondary | `#1A1A1A` | Dark background, text on light theme |
| Accent | `#FFD166` | Highlights, offer banners, chart fills |
| Background | `#F8F9FA` | Page background (light mode) |
| Text | `#333333` | Body text (light mode) |

Dark mode applies `#1A1A1A` as the page background and `#F8F9FA` as the text color, toggled via the `dark` class on `<html>`.

### Animations (Framer Motion)

- Page entrance animations: fade-in + slide-up on mount
- Hover effects on FoodCard (scale, shadow lift)
- Modal open/close (fade + scale)
- Testimonial carousel: sliding transition between items
- Offer banners: staggered entrance

### Notifications (react-hot-toast)

- Success: green, 3-second auto-dismiss
- Error: red, 3-second auto-dismiss
- Positioned top-right
- Used for: order placed, cart updated, profile saved, status updated, error messages

### Skeleton Loaders

`SkeletonCard` renders an animated pulse placeholder matching the FoodCard dimensions. Displayed in place of cards during any data fetch: initial menu load, search/filter changes, featured foods on home page, and admin dashboard stats/charts.

---

## Security

| Mechanism | Implementation |
|-----------|---------------|
| HTTP security headers | `helmet` middleware on all responses |
| CORS | `cors` configured to allow only `CLIENT_URL` origin |
| Rate limiting | `express-rate-limit`: 100 requests / 15 min / IP on all `/api` routes |
| Password hashing | `bcryptjs`, salt rounds 10, applied before any persistence |
| Password exclusion | `select: false` on `password` schema field; never returned in responses |
| JWT authentication | `jwt.sign` with `JWT_SECRET`, 7-day expiry; `jwt.verify` on every protected route |
| File upload validation | Multer: mime type allowlist (jpeg/jpg/png/webp), 5 MB max size |
| Input validation | `express-validator` on all POST/PUT request bodies, 400 on invalid input |
| Admin self-delete prevention | Backend 400 guard: admin cannot delete their own account |
| Order ownership | `GET /api/orders/:id` returns 403 if `order.userId !== req.user.id` (unless admin) |

---

## Deployment

### Frontend — Netlify

- Build command: `npm run build`
- Publish directory: `dist/`
- `netlify.toml` configures a redirect rule (`/* → /index.html`) to handle client-side React Router navigation
- Environment variable: `VITE_API_URL` pointing to the Render backend URL

### Backend — Render

- Start command: `npm start` (runs `node index.js`)
- `render.yaml` defines the web service configuration
- Environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`

### Database — MongoDB Atlas

- Mongoose connects via `MONGO_URI` on startup (`config/db.js`)
- `seedData.js` utility can be run once to seed 12 food items and an admin user

---

## Key Design Decisions

**Item snapshot on order placement** — Order items are stored as a value snapshot rather than references to Food documents. This ensures historical order data is not affected when food items are edited or deleted after the order is placed.

**Server-side cart persistence** — The cart is stored in MongoDB (not just client-side state) so it survives page refreshes and device changes for authenticated users.

**30-second polling for order status** — `UserDashboardPage` uses `setInterval` to refetch order history every 30 seconds. This is a deliberate simplification over WebSockets, appropriate for the expected update frequency of order status changes.

**Single Axios instance with interceptors** — All API calls share one configured instance, centralizing token attachment and error handling rather than scattering it across components.

**Context API over Redux** — Given the application scope (three distinct state domains: auth, cart, theme), React Context with `useReducer`/`useState` provides sufficient state management without the overhead of Redux.

**Multer disk storage** — Uploaded food images are stored on the Render filesystem. For production scale, this would be replaced with object storage (e.g., AWS S3 or Cloudinary); the current design uses Render's ephemeral disk as a pragmatic starting point.
