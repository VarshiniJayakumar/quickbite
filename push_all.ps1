Set-Location "c:\Users\preesubs\OneDrive\Documents\quickbite"

# Stage everything (respects .gitignore — node_modules, .env, dist excluded)
git add .

# Show what's staged
Write-Host "--- Staged files ---"
git status --short

# Commit
git commit -m "feat: complete QuickBite MERN restaurant ordering system

- Full-stack MERN application (React 18 + Node.js + Express + MongoDB)
- JWT authentication with role-based access (admin/user)
- Browse menu with search, filter, sort and pagination
- Cart management with tax calculation
- Order placement (COD/UPI/Card) and tracking timeline
- Admin dashboard with Recharts bar/pie charts
- Admin CRUD for foods (image upload), orders, users
- Dark mode, Framer Motion animations, skeleton loaders
- Toast notifications, protected routes, responsive design
- Tailwind CSS with custom QuickBite color palette
- Helmet, CORS, rate limiting, bcrypt, express-validator
- Netlify (client) + Render (server) + MongoDB Atlas deployment
- Seed script with 12 foods and admin account"

git push origin main
Write-Host "--- Push complete ---"
