# MedLink - Neighborhood Medicine Availability & Pharmacy Locator

**Find medicines fast. Find pharmacies nearby.**

MedLink is a full-stack MERN + PostgreSQL application that helps users locate nearby pharmacies and check medicine availability in real-time. The platform serves three types of users: Customers, Pharmacies, and Administrators.

## 🚀 Project Status: Stage 1 Complete

**Stage 1** focuses on authentication and basic role-based access control.

### ✅ Completed Features
- JWT-based authentication system
- Role-based access control (Customer, Pharmacy, Admin)
- Secure user registration and login
- Responsive UI with TailwindCSS
- Protected routes and middleware
- PostgreSQL database with Sequelize ORM

### 🔮 Coming in Stage 2
- Pharmacy inventory management
- Medicine search functionality
- Location-based pharmacy finder
- Admin verification system
- Real-time notifications

## 🛠️ Tech Stack

### Backend
- **Node.js** with **Express.js**
- **PostgreSQL** database
- **Sequelize** ORM
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin requests

### Frontend
- **React 19** with **Vite**
- **React Router DOM** for routing
- **TailwindCSS** for styling
- **Axios** for API calls
- **Context API** for state management

## 📁 Project Structure

```
MedLink/
├── backend/               # Backend API
│   ├── controllers/       # Route controllers
│   │   └── authController.js
│   ├── db/               # Database configuration
│   │   └── database.js
│   ├── lib/              # Utility libraries
│   │   └── utils.js
│   ├── middleware/       # Express middleware
│   │   └── auth.js
│   ├── models/           # Database models
│   │   └── User.js
│   ├── routes/           # API routes
│   │   └── authRoutes.js
│   ├── scripts/          # Database and utility scripts
│   │   └── initDb.js
│   ├── .env             # Environment variables
│   ├── package.json
│   └── server.js        # Server entry point
│
├── frontend/            # Frontend React app
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # React Context
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── index.html
│
├── demo_img/           # Demo images and screenshots
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Quick Start Options

Choose your preferred method:

#### Option 1: Local Development (Recommended) ⚡

**Simple 3-step setup:**

1. **Run Database Setup**
   ```powershell
   .\setup-database.ps1
   ```

2. **Configure Environment Variables**
   - Update `.env` file with your email and payment credentials

3. **Start the Application**
   ```powershell
   .\start.ps1
   ```

**Done!** The application will start on:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

📖 **For detailed instructions, see [LOCAL_SETUP.md](LOCAL_SETUP.md)**

#### Option 2: Docker (Alternative) 🐳

If you prefer Docker:

```bash
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down
```

Access the application at http://localhost:5173

### Manual Setup (If Scripts Don't Work)

#### 1. Set up PostgreSQL Database
```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE USER medlink_user WITH PASSWORD 'medlink_pass';
CREATE DATABASE medlink_db OWNER medlink_user;
GRANT ALL PRIVILEGES ON DATABASE medlink_db TO medlink_user;
\q
```

#### 2. Configure Environment Variables
   
Update `.env` file:
```env
# Database
DATABASE_URL=postgresql://medlink_user:medlink_pass@localhost:5432/medlink_db

# Email (Update with your credentials)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Payment (Update with your SSLCommerz credentials)
STORE_ID=your-store-id
STORE_PASSWORD=your-store-password
```

#### 3. Start Backend
```powershell
cd backend
npm install
node server.js
```

#### 4. Start Frontend (New Terminal)
```powershell
cd frontend
npm install
npm run dev
```

### Create Admin User

After backend is running:
```powershell
cd backend
node scripts/createAdmin.js
```

## 🔐 Authentication System

### User Roles
- **Customer**: Search for medicines and locate pharmacies
- **Pharmacy**: Manage inventory and serve customers
- **Admin**: Oversee system and verify pharmacies

### API Endpoints

#### Authentication Routes
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

#### Example API Usage

**Register User:**
```javascript
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "role": "customer"
}
```

**Login User:**
```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword",
  "role": "customer"
}
```

## 🎨 Frontend Features

### Pages
- **Landing Page**: Project introduction and navigation
- **Login Page**: Role-based authentication
- **Signup Page**: User registration with role selection
- **Dashboard Pages**: Role-specific welcome screens

### Components
- **Layout**: Common header and navigation
- **ProtectedRoute**: Route protection with role checking
- **LoadingSpinner**: Loading states
- **Alert**: Error and success messages

### State Management
- **AuthContext**: Centralized authentication state
- **LocalStorage**: Token persistence
- **Axios Interceptors**: Automatic token handling

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Role-based Access Control**: Route and API protection
- **Input Validation**: Frontend and backend validation
- **CORS Configuration**: Secure cross-origin requests

## 🧪 Testing the Application

### Manual Testing Checklist

1. **Registration Flow**
   - [ ] Register as Customer
   - [ ] Register as Pharmacy
   - [ ] Register as Admin
   - [ ] Verify email validation
   - [ ] Verify password requirements

2. **Login Flow**
   - [ ] Login with correct credentials
   - [ ] Login with incorrect credentials
   - [ ] Role-based redirects work
   - [ ] Token persistence works

3. **Protected Routes**
   - [ ] Access dashboard without login (should redirect)
   - [ ] Access wrong role dashboard (should show unauthorized)
   - [ ] Logout functionality works

4. **UI/UX**
   - [ ] Responsive design on mobile/tablet
   - [ ] Loading states display correctly
   - [ ] Error messages are clear
   - [ ] Navigation flows smoothly

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database exists

**CORS Errors**
- Verify CLIENT_URL in server/.env
- Check if both servers are running

**Token Errors**
- Clear localStorage
- Check JWT_SECRET configuration
- Verify token format in requests

## 📝 API Documentation

### Response Format
All API responses follow this structure:

```javascript
{
  "success": boolean,
  "message": string,
  "data": object | null,
  "error": string | null
}
```

### Error Handling
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid credentials)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

## 🚀 Deployment

### Production Checklist
- [ ] Update environment variables for production
- [ ] Configure production database
- [ ] Set up HTTPS
- [ ] Configure CORS for production domain
- [ ] Optimize build settings

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📋 Stage 2 Roadmap

### Upcoming Features
- **Medicine Search**: Real-time medicine availability search
- **Pharmacy Management**: Complete inventory management system
- **Location Services**: GPS-based pharmacy finder
- **Admin Panel**: Pharmacy verification and user management
- **Notifications**: Real-time alerts and updates
- **Analytics**: Usage statistics and reporting

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**MedLink** - Making healthcare accessible, one neighborhood at a time. 🏥💊