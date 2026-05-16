# ResQ — Rescue Food, Reduce Waste

### Full-Stack Capstone Project | React + PHP + MySQL

ResQ is a food rescue marketplace that connects surplus food sellers with buyers and food banks — reducing waste, saving money, and feeding communities.

---

## 🚀 Quick Start

### Step 1 — Set up the Backend

1. Open **XAMPP** → Start **Apache** and **MySQL**

2. Copy the `backend` folder to:
   ```
   /Applications/XAMPP/xamppfiles/htdocs/PHP/resq_php_react_final/backend
   ```
   *(on Windows: `C:\xampp\htdocs\PHP\resq_php_react_final\backend`)*

3. Open **phpMyAdmin**: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
   - Create database: `resq_db`
   - Import: `backend/database/schema.sql`

4. **Seed demo data** — open in browser:
   ```
   http://localhost/PHP/resq_php_react_final/backend/public/seed.php
   ```

5. Test the API:
   ```
   http://localhost/PHP/resq_php_react_final/backend/public/api.php?route=listings
   ```

---

### Step 2 — Set up the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open: **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Demo Accounts

All accounts use password: **`password123`**

| Role      | Email                  | Access |
|-----------|------------------------|--------|
| 👤 Admin    | admin@resq.local       | Full platform management |
| 🏪 Seller   | seller@resq.local      | List & manage food items |
| 🛍️ Buyer   | buyer@resq.local       | Browse & order food |
| ❤️ Foodbank | foodbank@resq.local    | Claim free donations |

---

## 📁 Project Structure

```
resq_capstone/
├── backend/
│   ├── database/
│   │   └── schema.sql          # MySQL tables & structure
│   └── public/
│       ├── api.php             # REST API (all routes)
│       └── seed.php            # Demo data seeder
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx            # App entry point
        ├── App.jsx             # Router & layout
        ├── index.css           # Global styles
        ├── context/
        │   └── AuthContext.jsx # Login state management
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── Home.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Listings.jsx
            ├── ListingDetail.jsx
            ├── seller/
            │   ├── SellerDashboard.jsx
            │   └── AddListing.jsx
            ├── buyer/
            │   └── BuyerDashboard.jsx
            ├── foodbank/
            │   └── FoodbankDashboard.jsx
            └── admin/
                └── AdminDashboard.jsx
```

---

## 🔌 API Reference

All requests go to: `http://localhost/PHP/resq_php_react_final/backend/public/api.php?route=<route>`

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `login` | POST | — | Log in with email/password |
| `register` | POST | — | Create new account |
| `logout` | POST | ✓ | Log out |
| `me` | GET | ✓ | Get current user |
| `listings` | GET | — | Browse all active listings |
| `listings` | POST | Seller | Create a listing |
| `listing` | GET | — | Get single listing (add `&id=N`) |
| `listing` | DELETE | Seller/Admin | Remove listing |
| `orders` | POST | Buyer | Place an order |
| `orders` | GET | Buyer/Seller | View orders |
| `donations` | POST | Foodbank | Claim a donation |
| `donations` | GET | Foodbank | View claimed donations |
| `seller/listings` | GET | Seller | Seller's own listings |
| `admin/users` | GET | Admin | All users |
| `admin/listings` | GET | Admin | All listings |
| `admin/stats` | GET | Admin | Platform statistics |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Bootstrap 5 |
| Build tool | Vite 5 |
| Backend | PHP 8+ (single-file API router) |
| Database | MySQL via XAMPP |
| Session | PHP native sessions |
| Styling | Bootstrap 5 + custom CSS variables |
| Icons | Bootstrap Icons |

---

## ✨ Features

- **Role-based access** — Admin, Seller, Buyer, Food Bank
- **Browse & search** listings with category filters
- **Sellers** create, manage, and remove food listings
- **Buyers** order discounted food and view order history
- **Food Banks** discover and claim free donated food
- **Admin** manages all users and listings with stats dashboard
- **Session-based auth** — stays logged in across page refreshes
- **Responsive design** — works on mobile and desktop

---

## 🐛 Troubleshooting

**API returns 404 / CORS error**
- Verify XAMPP Apache is running
- Check the path in `vite.config.js` matches your XAMPP setup

**"DB connection failed"**
- Make sure MySQL is running in XAMPP
- The API uses: host=`localhost`, user=`root`, pass=`""`, db=`resq_db`
- If your MySQL has a password, update line in `api.php`: `new mysqli('localhost', 'root', 'YOUR_PASS', 'resq_db')`

**Demo accounts don't work**
- Make sure you ran `seed.php` after importing `schema.sql`

---

*Built with ❤️ — ResQ Capstone 2026*
