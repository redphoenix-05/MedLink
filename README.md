# MedLink - Modern Medicine Delivery & Pharmacy Platform

<div align="center">
  <img src="./frontend/src/assets/logo.png" alt="MedLink Logo" width="120" height="120">
  
  **Find medicines fast. Get them delivered faster.**
  
  [![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql)](https://www.postgresql.org/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
</div>

---

## 📖 Overview

MedLink is a comprehensive **full-stack medicine delivery platform** built with the MERN stack (MongoDB alternative: PostgreSQL) that revolutionizes healthcare access by connecting customers with nearby pharmacies. The platform features real-time medicine search, inventory management, secure payment processing, and location-based pharmacy discovery.

### 🎯 Key Highlights
- 🔐 **Secure Authentication** - JWT-based auth with role-based access control
- 💊 **Smart Medicine Search** - Real-time availability across multiple pharmacies
- 📍 **Location-Based Discovery** - Find pharmacies near you with interactive maps
- � **Seamless Shopping Cart** - Multi-pharmacy cart with intelligent delivery fee calculation
- 💳 **Secure Payments** - SSLCommerz integration for safe transactions
- 📊 **Dashboard Analytics** - Role-specific dashboards with modern UI
- 📱 **Fully Responsive** - Beautiful design across all devices

## ✨ Features

### 🛍️ Customer Features
- **Medicine Search**: Search across all pharmacies with real-time availability
- **Pharmacy Browser**: View nearby pharmacies with distance and ratings
- **Interactive Map**: Google Maps integration for pharmacy locations
- **Shopping Cart**: Add medicines from multiple pharmacies
- **Delivery Options**: Choose between pickup and home delivery
- **Order Tracking**: Track order status (Pending → Confirmed → Delivered)
- **Payment Processing**: Secure online payment via SSLCommerz
- **Profile Management**: Update personal information and view order history

### 🏪 Pharmacy Features
- **Inventory Management**: Add, update, and manage medicine stock
- **Order Management**: View and process customer orders
- **Earnings Dashboard**: Track revenue with delivery charge breakdown
- **Stock Alerts**: Monitor low-stock medicines
- **Profile Management**: Update pharmacy details and location
- **Order Statistics**: View pickup vs delivery orders
- **Medicine Sales Tracking**: Monitor total medicines sold

### �‍💼 Admin Features
- **Pharmacy Verification**: Approve or reject pharmacy registrations
- **User Management**: View and manage all users
- **System Overview**: Monitor platform statistics
- **Role Management**: Oversee customer and pharmacy activities

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern UI library
- **Vite 7.1.9** - Lightning-fast build tool
- **React Router 7.9.3** - Client-side routing
- **TailwindCSS v4** - Utility-first styling
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API calls
- **React Context API** - Global state management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **PostgreSQL** - Relational database
- **Sequelize ORM** - Database object modeling
- **JWT** - JSON Web Token authentication
- **bcrypt** - Password hashing
- **Nodemailer** - Email notifications
- **SSLCommerz** - Payment gateway integration

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS transformation
- **CORS** - Cross-Origin Resource Sharing

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS transformation
- **CORS** - Cross-Origin Resource Sharing

## 📁 Project Structure

```
MedLink/
├── backend/                      # Backend API Server
│   ├── config/
│   │   └── database.js          # PostgreSQL configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── cartController.js    # Shopping cart & payment
│   │   ├── customerController.js # Customer operations
│   │   ├── pharmacyController.js # Pharmacy management
│   │   ├── pharmacyOrdersController.js # Order processing
│   │   └── adminController.js   # Admin operations
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User model (Customer/Pharmacy/Admin)
│   │   ├── Medicine.js          # Medicine inventory model
│   │   ├── Cart.js              # Shopping cart model
│   │   └── Order.js             # Order model
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── customerRoutes.js    # Customer routes
│   │   ├── pharmacyRoutes.js    # Pharmacy routes
│   │   └── adminRoutes.js       # Admin routes
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── server.js                # Server entry point
│
├── frontend/                     # React Frontend
│   ├── public/
│   │   ├── logo.png             # MedLink logo
│   │   └── vite.svg
│   ├── src/
│   │   ├── assets/              # Static assets
│   │   ├── components/
│   │   │   ├── Alert.jsx        # Alert notification component
│   │   │   ├── LoadingSpinner.jsx # Loading state component
│   │   │   ├── ProtectedRoute.jsx # Route protection
│   │   │   ├── CustomerLayout.jsx # Customer sidebar layout
│   │   │   ├── PharmacyLayout.jsx # Pharmacy sidebar layout
│   │   │   └── AdminLayout.jsx  # Admin sidebar layout
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication context
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx  # Home page
│   │   │   ├── LoginPage.jsx    # Login page
│   │   │   ├── SignupPage.jsx   # Registration page
│   │   │   ├── CustomerDashboard.jsx # Customer home
│   │   │   ├── PharmacyBrowsePage.jsx # Browse pharmacies
│   │   │   ├── CartPage.jsx     # Shopping cart
│   │   │   ├── ProfilePage.jsx  # User profile
│   │   │   ├── PharmacyDashboard.jsx # Pharmacy home
│   │   │   ├── PharmacyOrders.jsx # Pharmacy orders
│   │   │   ├── AdminDashboard.jsx # Admin home
│   │   │   ├── PaymentSuccess.jsx # Payment success page
│   │   │   ├── PaymentFailed.jsx  # Payment failure page
│   │   │   ├── PaymentCancelled.jsx # Payment cancelled page
│   │   │   └── UnauthorizedPage.jsx # 403 error page
│   │   ├── services/
│   │   │   ├── api.js           # Axios configuration
│   │   │   └── authService.js   # Auth service functions
│   │   ├── App.jsx              # Main app component
│   │   ├── App.css              # Global styles
│   │   ├── index.css            # Tailwind directives
│   │   └── main.jsx             # React entry point
│   ├── eslint.config.js         # ESLint configuration
│   ├── postcss.config.js        # PostCSS configuration
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── vite.config.js           # Vite configuration
│   ├── package.json
│   └── index.html
│
└── README.md                     # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **PostgreSQL** v14+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

#### 1️⃣ Clone the Repository
```bash
git clone https://github.com/redphoenix-05/MedLink.git
cd MedLink
```

#### 2️⃣ Set Up PostgreSQL Database
```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE USER medlink_user WITH PASSWORD 'medlink_pass';
CREATE DATABASE medlink_db OWNER medlink_user;
GRANT ALL PRIVILEGES ON DATABASE medlink_db TO medlink_user;
\q
```

#### 3️⃣ Configure Backend Environment

Create `.env` file in the `backend` folder:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=medlink_db
DB_USER=medlink_user
DB_PASSWORD=medlink_pass

# JWT Secret (Change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# SSLCommerz Payment Gateway
STORE_ID=your-sslcommerz-store-id
STORE_PASSWORD=your-sslcommerz-store-password
PAYMENT_SUCCESS_URL=http://localhost:5000/api/customer/payment/success
PAYMENT_FAIL_URL=http://localhost:5000/api/customer/payment/fail
PAYMENT_CANCEL_URL=http://localhost:5000/api/customer/payment/cancel
```

**Getting Gmail App Password:**
1. Enable 2-Factor Authentication on your Google Account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Generate an app password for "Mail"
4. Use that 16-character password in EMAIL_PASS

**Getting SSLCommerz Credentials:**
1. Register at [SSLCommerz](https://sslcommerz.com/)
2. For testing, use sandbox credentials
3. Get Store ID and Store Password from dashboard

#### 4️⃣ Install Dependencies & Start Backend

```bash
cd backend
npm install
node server.js
```

You should see:
```
✅ Connected to PostgreSQL Database!
🚀 Server running on http://localhost:5000
```

#### 5️⃣ Start Frontend (New Terminal)

```bash
cd frontend
npm install
npm run dev
```

Frontend will start on: **http://localhost:5173**

#### 6️⃣ Create Admin Account (Optional)

```bash
cd backend
node scripts/createAdmin.js
```

Default admin credentials:
- **Email**: admin@medlink.com
- **Password**: admin123

## 🎨 User Interface

### Design System

#### Color Themes
- **Customer Dashboard**: Green theme (#15803d, #16a34a, #22c55e)
- **Pharmacy Dashboard**: Blue theme (#1e40af, #1e3a8a, #3b82f6)
- **Admin Dashboard**: Black/White theme (Gray-900, Gray-800)

#### Layout Features
- **Sidebar Navigation**: Fixed 72px sidebar with logo and navigation
- **Glassmorphism**: Modern glass effect on navbars
- **Gradient Headers**: Role-specific gradient backgrounds
- **Responsive Design**: Mobile-first approach with breakpoints
- **Icon System**: Lucide React icons throughout

## 🔐 Authentication & Authorization

### User Roles

| Role | Access Level | Features |
|------|--------------|----------|
| **Customer** | Standard User | Browse, Search, Order medicines |
| **Pharmacy** | Business User | Manage inventory, Process orders |
| **Admin** | Super User | Verify pharmacies, Manage system |

### Protected Routes

```javascript
// Customer Routes (Requires authentication + customer role)
/customer/dashboard
/customer/browse-pharmacies
/customer/cart
/customer/profile

// Pharmacy Routes (Requires authentication + pharmacy role)
/pharmacy/dashboard
/pharmacy/orders

// Admin Routes (Requires authentication + admin role)
/admin/dashboard
```

### JWT Token Flow
1. User logs in with credentials
2. Server validates and returns JWT token
3. Token stored in localStorage
4. Token included in all API requests (Authorization header)
5. Server verifies token for protected routes
6. Token expires after 7 days (configurable)

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "customer"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": 1,
      "email": "customer@example.com",
      "name": "John Doe",
      "role": "customer"
    }
  }
}
```

### Customer Endpoints

#### Search Medicines
```http
GET /customer/search-medicine?query=paracetamol
Authorization: Bearer <token>
```

#### Browse Pharmacies
```http
GET /customer/pharmacies?lat=23.8103&lon=90.4125
Authorization: Bearer <token>
```

#### Add to Cart
```http
POST /customer/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "inventoryId": 123,
  "quantity": 2
}
```

#### Checkout
```http
POST /customer/checkout
Authorization: Bearer <token>
Content-Type: application/json

{
  "deliveryType": "delivery",
  "deliveryAddress": "123 Main St, Dhaka"
}
```

### Pharmacy Endpoints

#### Add Medicine to Inventory
```http
POST /pharmacy/inventory/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Napa",
  "genericName": "Paracetamol",
  "dosage": "500mg",
  "price": 2.50,
  "stock": 100,
  "expiryDate": "2026-12-31"
}
```

#### Get Orders
```http
GET /pharmacy/orders
Authorization: Bearer <token>
```

#### Update Order Status
```http
PUT /pharmacy/orders/:orderId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "confirmed"
}
```

### Admin Endpoints

#### Get Pending Pharmacies
```http
GET /admin/pending-pharmacies
Authorization: Bearer <token>
```

#### Approve Pharmacy
```http
PUT /admin/pharmacy/:id/approve
Authorization: Bearer <token>
```

## 💳 Payment Integration

### SSLCommerz Flow

1. **Customer initiates checkout**
2. **Backend creates payment session** with SSLCommerz
3. **Customer redirected** to SSLCommerz payment page
4. **Payment processed** by SSLCommerz
5. **SSLCommerz redirects** back to app with status
6. **Backend verifies** payment and creates orders
7. **Customer sees** success/failure page

### Payment Calculation

```javascript
// Per-order calculation
Medicine Total = Unit Price × Quantity
Platform Fee = 2% of Medicine Total
Delivery Charge = ৳50 per pharmacy (first item only)
Grand Total = Medicine Total + Platform Fee + Delivery Charge

// Example: 2 medicines from same pharmacy
Medicine 1: ৳100 × 2 = ৳200
Medicine 2: ৳50 × 1 = ৳50
Subtotal: ৳250
Platform Fee: ৳250 × 2% = ৳5
Delivery: ৳50 (one-time per pharmacy)
Total: ৳305
```

### Revenue Distribution

- **Pharmacy Earnings** = Medicine Total + Delivery Charge
- **Platform Earnings** = Platform Fee (2%)

## 🗄️ Database Schema

### Key Tables

## �️ Database Schema

### Key Tables

#### Users Table
```sql
- id (PK)
- email (Unique)
- password (Hashed)
- name
- role (customer/pharmacy/admin)
- isApproved (boolean, for pharmacy)
- pharmacyName (for pharmacy)
- address (for pharmacy)
- latitude, longitude (for pharmacy)
- licenseNumber (for pharmacy)
- phone (for pharmacy)
- createdAt, updatedAt
```

#### Medicines Table
```sql
- id (PK)
- pharmacyId (FK → Users)
- name
- genericName
- dosage
- price
- stock
- expiryDate
- createdAt, updatedAt
```

#### Cart Table
```sql
- id (PK)
- customerId (FK → Users)
- inventoryId (FK → Medicines)
- quantity
- createdAt, updatedAt
```

#### Orders Table
```sql
- id (PK)
- userId (FK → Users)
- pharmacyId (FK → Users)
- medicineName
- genericName
- unitPrice
- quantity
- totalPrice
- deliveryCharge
- platformFee
- grandTotal
- deliveryType (pickup/delivery)
- deliveryAddress
- status (pending/confirmed/delivered/completed)
- orderDate
- createdAt, updatedAt
```

## 🧪 Testing Guide

### Manual Testing Scenarios

#### 1. Customer Journey
```bash
1. Register as Customer
2. Login with customer credentials
3. Search for medicine (e.g., "Napa")
4. Browse pharmacies near you
5. Add medicines to cart from different pharmacies
6. Proceed to checkout
7. Select delivery type (pickup/delivery)
8. Complete payment via SSLCommerz
9. View order status in "My Orders"
```

#### 2. Pharmacy Journey
```bash
1. Register as Pharmacy
2. Wait for admin approval
3. Login after approval
4. Add medicines to inventory
5. Update medicine stock levels
6. View incoming orders
7. Update order status (confirm/delivered)
8. Check earnings dashboard
```

#### 3. Admin Journey
```bash
1. Login as Admin
2. View pending pharmacy applications
3. Approve/Reject pharmacies
4. View system statistics
5. Monitor user activities
```

### Test Credentials

After setting up, you can create test accounts:

**Admin**
```
Email: admin@medlink.com
Password: admin123
```

**Test Customer** (Register manually)
```
Email: customer@test.com
Password: test123
Role: Customer
```

**Test Pharmacy** (Register manually)
```
Email: pharmacy@test.com
Password: test123
Role: Pharmacy
```

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Backend Not Starting

**Error**: `Error: connect ECONNREFUSED ::1:5432`
- **Solution**: PostgreSQL is not running
```bash
# Start PostgreSQL service (Windows)
net start postgresql-x64-14

# Or check if it's running
services.msc  # Look for PostgreSQL service
```

**Error**: `JWT_SECRET is not defined`
- **Solution**: Missing environment variable
```bash
# Add to backend/.env
JWT_SECRET=your-secret-key-here
```

#### Frontend Not Loading

**Error**: `Failed to fetch` or CORS errors
- **Solution**: Backend not running or wrong URL
```bash
# Check backend is running on port 5000
# Verify CLIENT_URL in backend/.env matches frontend URL
CLIENT_URL=http://localhost:5173
```

#### Database Connection Failed

**Error**: `password authentication failed for user "medlink_user"`
- **Solution**: Wrong database credentials
```bash
# Reset PostgreSQL user password
psql -U postgres
ALTER USER medlink_user WITH PASSWORD 'medlink_pass';
```

#### Payment Not Working

**Error**: Payment page doesn't load
- **Solution**: Check SSLCommerz credentials
```bash
# Verify in backend/.env
STORE_ID=your-store-id
STORE_PASSWORD=your-store-password

# For testing, use SSLCommerz sandbox credentials
```

#### Orders Not Showing

**Error**: Orders created but not visible
- **Solution**: Check order status filter
```javascript
// Backend only shows confirmed/delivered/completed orders
// Verify order status in database is correct
```

## 🚀 Deployment Guide

### Deploying to Production

#### 1. Backend Deployment (Railway/Render/Heroku)

**Environment Variables to Set:**
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=your-production-secret
CLIENT_URL=https://your-frontend-domain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
STORE_ID=production-store-id
STORE_PASSWORD=production-store-password
PAYMENT_SUCCESS_URL=https://your-backend/api/customer/payment/success
PAYMENT_FAIL_URL=https://your-backend/api/customer/payment/fail
PAYMENT_CANCEL_URL=https://your-backend/api/customer/payment/cancel
```

**Build Commands:**
```bash
npm install
node server.js
```

#### 2. Frontend Deployment (Vercel/Netlify)

**Update API URL:**
```javascript
// src/services/api.js
const API_URL = process.env.VITE_API_URL || 'https://your-backend-domain.com/api';
```

**Environment Variables:**
```env
VITE_API_URL=https://your-backend-domain.com/api
```

**Build Commands:**
```bash
npm install
npm run build
```

#### 3. Database (Railway/Supabase/AWS RDS)

- Migrate to managed PostgreSQL service
- Update DATABASE_URL in backend environment
- Run database migrations

## � Features Roadmap

### ✅ Completed (Phase 1)
- [x] User authentication and authorization
- [x] Role-based dashboards (Customer, Pharmacy, Admin)
- [x] Medicine inventory management
- [x] Shopping cart functionality
- [x] Payment integration (SSLCommerz)
- [x] Order management system
- [x] Location-based pharmacy search
- [x] Modern responsive UI with Tailwind CSS
- [x] Email notifications
- [x] Admin pharmacy approval system

### 🚧 In Progress (Phase 2)
- [ ] Advanced medicine search with filters
- [ ] Real-time notifications (WebSocket)
- [ ] Order tracking with status updates
- [ ] Pharmacy ratings and reviews
- [ ] Prescription upload feature
- [ ] Multiple delivery address support
- [ ] Order history and analytics

### 🔮 Planned (Phase 3)
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] In-app chat support
- [ ] Medicine recommendation system
- [ ] Loyalty points and rewards
- [ ] Subscription model for regular orders
- [ ] AI-powered medicine search
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### How to Contribute

1. **Fork the repository**
   ```bash
   git clone https://github.com/redphoenix-05/MedLink.git
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   - Test all affected features
   - Ensure no breaking changes
   - Check responsive design

5. **Commit your changes**
   ```bash
   git commit -m 'Add: Amazing new feature'
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/AmazingFeature
   ```

7. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues
   - Wait for code review

### Contribution Guidelines

- **Code Style**: Follow existing patterns and use ESLint
- **Commits**: Use clear, descriptive commit messages
- **Documentation**: Update README for new features
- **Testing**: Test thoroughly before submitting PR
- **Issues**: Check existing issues before creating new ones

### Areas We Need Help

- 🐛 Bug fixes and testing
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🌐 Internationalization (i18n)
- 🧪 Writing tests

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 MedLink

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 👥 Team & Support

### Developers
- **Ariyan Aftab Spandan 2107045** - [@redphoenix-05](https://github.com/redphoenix-05)

### Support

For questions, issues, or feature requests:

- 📧 **Email**: ariyanspandan@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/redphoenix-05/MedLink/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/redphoenix-05/MedLink/discussions)

<div align="center">
  
  **MedLink** - Making healthcare accessible, one neighborhood at a time. 🏥💊
  
  Built with ❤️ using React, Node.js, PostgreSQL & TailwindCSS
  
  [Report Bug](https://github.com/redphoenix-05/MedLink/issues) · [Request Feature](https://github.com/redphoenix-05/MedLink/issues) · [Documentation](https://github.com/redphoenix-05/MedLink/wiki)

  **© 2025 MedLink. All rights reserved.**

</div>

--
Created By : Ariyan Aftab Spandan
Roll : 2107045
