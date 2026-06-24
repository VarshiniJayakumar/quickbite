# 🍔 QuickBite — Restaurant Ordering System

A full-stack MERN restaurant ordering system built for portfolio. Features JWT auth, role-based access, cart management, real-time order tracking, an admin dashboard with charts, dark mode, and full mobile responsiveness.

---

## ✨ Features

| Customer | Admin |
|---|---|
| Browse & search menu | Manage food items (CRUD) |
| Filter by category & sort | Toggle availability |
| Add to cart / manage quantities | Manage all orders + status updates |
| Checkout (COD / UPI / Card) | Manage users (role / block / delete) |
| Order confirmation + tracking timeline | Dashboard with bar + pie charts |
| Profile management | Paginated tables |
| Dark mode | Dark mode |

---

## 🛠 Tech Stack

**Frontend:** React 18, React Router 6, Tailwind CSS, Framer Motion, Recharts, React Hot Toast, Axios  
**Backend:** Node.js, Express.js, Mongoose, JWT, bcryptjs, Multer  
**Database:** MongoDB Atlas  
**Deployment:** Netlify (client) + Render (server)

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone <your-repo-url>
cd quickbite
npm run install:all
```

### 2. Configure environment

Copy and fill in your MongoDB URI:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/quickbite
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
```

### 3. Seed the database

```bash
npm run seed
```

This creates **12 food items** and an **admin account**:
- Email: `admin@quickbite.com`
- Password: `Admin@1234`

### 4. Run in development

Open **two terminals**:

```bash
# Terminal 1 — backend (port 5000)
npm run dev:server

# Terminal 2 — frontend (port 5173)
npm run dev:client
```

Visit **http://localhost:5173**

---

## 📁 Project Structure

```
quickbite/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # Navbar, Footer, FoodCard, SkeletonCard, Guards
│       ├── context/         # AuthContext, CartContext, ThemeContext
│       ├── layouts/         # MainLayout, AdminLayout
│       ├── pages/           # All customer + admin pages
│       └── services/        # Axios API instance
│
└── server/                  # Express backend
    ├── config/              # MongoDB connection
    ├── controllers/         # Business logic
    ├── middleware/          # Auth, error handler, upload, validate
    ├── models/              # User, Food, Cart, Order
    ├── routes/              # All API routes
    └── utils/               # Token generator, seed script
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |

### Foods
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/foods?search=&category=&sortBy=&order=&page=&limit=` | Public |
| GET | `/api/foods/featured` | Public |
| GET | `/api/foods/:id` | Public |
| POST | `/api/foods` | Admin |
| PUT | `/api/foods/:id` | Admin |
| PATCH | `/api/foods/:id/availability` | Admin |
| DELETE | `/api/foods/:id` | Admin |

### Cart
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/cart` | Private |
| POST | `/api/cart` | Private |
| PUT | `/api/cart/:foodId` | Private |
| DELETE | `/api/cart/:foodId` | Private |
| DELETE | `/api/cart/clear` | Private |

### Orders
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/orders` | Private |
| GET | `/api/orders/my` | Private |
| GET | `/api/orders/:id` | Private |
| PATCH | `/api/orders/:id/pay` | Private |
| PATCH | `/api/orders/:id/cancel` | Private |

### Admin
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/admin/stats` | Admin |
| GET | `/api/admin/users` | Admin |
| PUT | `/api/admin/users/:id/role` | Admin |
| PUT | `/api/admin/users/:id/block` | Admin |
| DELETE | `/api/admin/users/:id` | Admin |
| GET | `/api/admin/orders` | Admin |
| PUT | `/api/admin/orders/:id/status` | Admin |

---

## 🌐 Deployment

### Backend → Render
1. Create a **Web Service** pointing to `/server`
2. Build command: `npm install`
3. Start command: `npm start`
4. Add all env vars from `.env`

### Frontend → Netlify
1. Build command: `npm run build`
2. Publish directory: `client/dist`
3. Add env var: `VITE_API_URL=https://your-render-url.onrender.com`

> Update `client/src/services/api.js` baseURL to use `import.meta.env.VITE_API_URL` for production.

---

## 🎨 Color Palette

| Name | Hex |
|------|-----|
| Primary (Orange) | `#FF6B35` |
| Secondary (Dark) | `#1A1A1A` |
| Accent (Gold) | `#FFD166` |
| Background | `#F8F9FA` |
| Text | `#333333` |

---

## 📸 Pages

- `/` — Home (hero, categories, featured foods, offers, testimonials)
- `/menu` — Full menu with search, filter, sort, pagination
- `/menu/:id` — Food detail with ingredients & quantity
- `/cart` — Cart with subtotal / tax / total
- `/checkout` — Address, payment method, order placement
- `/order-confirmation/:id` — Success screen
- `/dashboard` — User orders with status timeline + profile
- `/admin` — Dashboard stats and charts
- `/admin/foods` — CRUD food items with image upload
- `/admin/orders` — View and update all orders
- `/admin/users` — View, role-change, block, delete users

---

## 📄 License

MIT
