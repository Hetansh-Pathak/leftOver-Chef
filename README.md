# 🍳 Leftover Chef

> Turn Your Leftovers Into Delicious Meals - MERN Stack Application with OAuth Authentication

[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-yellow.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Optional-green.svg)](https://mongodb.com/)

## 🌟 Features

### 🔐 **Complete Authentication System**
- ✅ Welcome screen with stunning animations
- ✅ Email/Password authentication
- ✅ Google OAuth integration
- ✅ Facebook OAuth integration
- ✅ "Sign up first" policy enforcement
- ✅ JWT token-based sessions
- ✅ Admin dashboard for user management

### 🍽️ **Recipe Management**
- ✅ Smart recipe finder by ingredients
- ✅ Daily featured recipes
- ✅ Personal recipe collections
- ✅ Favorites system
- ✅ Add custom recipes

### 🎨 **Modern UI/UX**
- ✅ Responsive design
- ✅ Smooth animations with Framer Motion
- ✅ Glass morphism effects
- ✅ Dark/Light theme support
- ✅ Mobile-first approach

### 👨‍💼 **Admin Features**
- ✅ Real-time user dashboard
- ✅ User statistics and analytics
- ✅ Registration tracking
- ✅ Activity monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ 
- npm or yarn
- Git (optional)

### Installation

1. **Clone/Download the project**
   ```bash
   git clone <repository-url>
   cd leftover-chef
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000/welcome
   - Backend: http://localhost:5000/api/health
   - Admin: http://localhost:5000/admin

## 📋 What You Need to Do

### ✅ **Essential Steps (Required)**

1. **Install Node.js 14+**
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **Run the setup commands**
   ```bash
   # Install dependencies
   npm run install-all
   
   # Start development server
   npm run dev
   ```

3. **Verify the application works**
   - Check: http://localhost:3000/welcome
   - Should see animated welcome screen

### ⚙️ **Optional Configuration**

4. **Environment Variables (Optional for Development)**
   ```bash
   # Create .env file in root directory (optional)
   cp .env.example .env
   
   # Edit .env with your values (all have defaults)
   ```

5. **OAuth Setup (Optional - Works with Demo Mode)**
   - See `OAUTH_SETUP.md` for Google/Facebook setup
   - Application works with demo OAuth out of the box

6. **MongoDB Setup (Optional - Works with Mock Data)**
   - Install MongoDB for persistent data
   - Application works with in-memory storage by default

## 🔧 Available Scripts

```bash
# Verify setup (recommended first step)
node verify-setup.js

# Install all dependencies (root, backend, frontend)
npm run install-all

# Start development (both servers)
npm run dev

# Start only backend server
npm run server

# Start only frontend server
npm run client

# Build for production
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
leftover-chef/
├── 📂 backend/              # Express.js API
│   ├── config/             # OAuth & configurations
│   ├── models/             # Database models
│   ├── routes/             # API endpoints
│   └── server.js           # Main server
├── 📂 frontend/            # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.js          # Main app
├── 📄 package.json         # Root scripts
├── 📄 .env.example         # Environment template
├── 📄 SETUP_GUIDE.md       # Detailed setup guide
├── 📄 OAUTH_SETUP.md       # OAuth configuration
└── 📄 README.md            # This file
```

## 🔍 Verification

Run the verification script to check your setup:

```bash
node verify-setup.js
```

Expected output:
```
✅ Node.js Version: v16.x.x
✅ NPM Version: 8.x.x
✅ File: package.json: Found
✅ Backend Dependencies: X packages installed
✅ Frontend Dependencies: Y packages installed
✅ Port 3000 (Frontend): Available
✅ Port 5000 (Backend): Available
```

## 🧪 Testing the Application

### 1. **Authentication Flow**
```bash
# 1. Visit welcome page
http://localhost:3000/welcome

# 2. Click "Start Cooking"
# 3. Try to sign in → Should prompt "Please sign up first"
# 4. Switch to Sign Up tab
# 5. Create account and login
```

### 2. **OAuth Testing (Demo Mode)**
```bash
# Google/Facebook buttons work in demo mode
# Real OAuth requires setup (see OAUTH_SETUP.md)
```

### 3. **Admin Dashboard**
```bash
# View registered users
http://localhost:5000/admin

# API health check
http://localhost:5000/api/health
```

## 🔐 Authentication Rules

### Sign Up First Policy
- **New users MUST sign up before signing in**
- **Login attempts with non-existent accounts will fail**
- **OAuth follows the same rules**

### Error Messages
- `"No account found. Please sign up first."` → Switch to Sign Up
- `"Account already exists. Please sign in instead."` → Switch to Sign In
- `"Invalid password. Please try again."` → Check password

## 🌐 API Endpoints

### Authentication
```bash
POST /api/users/register      # Email/password signup
POST /api/users/login         # Email/password login
POST /api/auth/google/verify  # Google OAuth
POST /api/auth/facebook/verify # Facebook OAuth
```

### Admin
```bash
GET /api/users/admin/all-users # List all users
GET /admin                     # Admin dashboard UI
```

### Health
```bash
GET /api/health               # System health check
GET /api/docs                 # API documentation
```

## 🚨 Common Issues & Solutions

### Issue: Port Already in Use
```bash
# Find and kill processes
lsof -i :3000
kill -9 <PID>
```

### Issue: Dependencies Not Installed
```bash
# Clean install
rm -rf node_modules backend/node_modules frontend/node_modules
npm run install-all
```

### Issue: MongoDB Connection Error
```
✅ This is NORMAL in development mode!
The app works with in-memory storage.
Look for: "Continuing with in-memory data for development..."
```

### Issue: Google OAuth Not Working
```
✅ This is expected without real Google credentials!
The app works with demo OAuth in development.
```

## 💾 Data Storage

### Development Mode (Default)
- ✅ **In-Memory Storage**: No database required
- ✅ **Mock OAuth**: Demo Google/Facebook integration
- ✅ **Sample Data**: Pre-loaded recipes and users
- ✅ **Fast Setup**: No external dependencies

### Production Mode
- 📝 **MongoDB**: Real database connection
- 📝 **Real OAuth**: Google/Facebook app credentials
- 📝 **External APIs**: Spoonacular, OpenAI integration
- 📝 **Environment**: All production configurations

## 🔒 Security Features

### Development Security
- Mock OAuth credentials (safe for testing)
- Local JWT tokens
- CORS enabled for localhost
- In-memory data (no persistence)

### Production Security
- Real OAuth app credentials
- Secure JWT tokens
- HTTPS redirects
- Database encryption
- Secure session handling

## 📚 Documentation

- **Setup Guide**: `SETUP_GUIDE.md` - Detailed installation
- **OAuth Setup**: `OAUTH_SETUP.md` - Google/Facebook config
- **API Docs**: http://localhost:5000/api/docs
- **Environment**: `.env.example` - Configuration template

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Getting Help

### Quick Checks
1. Run `node verify-setup.js`
2. Check `npm run dev` output
3. Visit http://localhost:5000/api/health
4. Check browser console for errors

### Debug Information
- **Backend Health**: http://localhost:5000/api/health
- **Admin Dashboard**: http://localhost:5000/admin
- **API Documentation**: http://localhost:5000/api/docs

### Support
- Check `SETUP_GUIDE.md` for detailed instructions
- Review console output for error messages
- Verify Node.js version is 14+

---

Made with ❤️ by Hetansh Pathak

**🎯 The application is designed to work perfectly out of the box without any external dependencies!**
