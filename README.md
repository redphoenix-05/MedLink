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
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MedLink-Neighborhood-Medicine-Availability-Pharmacy-Locator
   ```

2. **Set up PostgreSQL Database**
   - Create a new database named `medlink_db`
   - Update the DATABASE_URL in `server/.env`

3. **Configure Environment Variables**
   
   Update `server/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173
   
   # Database
   DATABASE_URL=postgresql://username:password@localhost:5432/medlink_db
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_secure
   TOKEN_EXPIRE=7d
   ```

### Installation & Running

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Initialize database (optional - runs automatically on server start)
npm run init-db

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

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