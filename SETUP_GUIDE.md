# 🍳 Leftover Chef - Complete Setup Guide

This guide will help you run the Leftover Chef application on your system without any errors.

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

### Required Software:
1. **Node.js** (version 14.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Git** (for version control)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

### Optional (for production):
3. **MongoDB** (for database - optional for development)
   - Download from: https://www.mongodb.com/try/download/community
   - The app works in mock mode without MongoDB

## 🚀 Quick Start (Development Mode)

### Step 1: Clone/Download the Project
```bash
# If you have the project as a zip file, extract it
# If using Git, clone it:
git clone <your-repo-url>
cd leftover-chef
```

### Step 2: Install All Dependencies
```bash
# This installs dependencies for root, backend, and frontend
npm run install-all
```

### Step 3: Start the Development Server
```bash
# This starts both backend and frontend servers
npm run dev
```

### Step 4: Access the Application
- **Frontend**: http://localhost:3000/welcome
- **Backend API**: http://localhost:5000/api/health
- **Admin Dashboard**: http://localhost:5000/admin

## 📁 Project Structure

```
leftover-chef/
├── backend/                 # Express.js API server
│   ├── config/             # OAuth and other configurations
│   ├── models/             # MongoDB/Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic services
│   ├── views/              # HTML views (admin dashboard)
│   ├── package.json        # Backend dependencies
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── public/             # Static files
│   ├── src/                # React source code
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Page components
│   │   └── App.js          # Main React app
│   └── package.json        # Frontend dependencies
├── package.json            # Root package file with scripts
├── .env.example            # Environment variables template
├── OAUTH_SETUP.md          # OAuth setup instructions
└── SETUP_GUIDE.md          # This file
```

## ⚙️ Configuration

### Environment Variables (Optional for Development)

Create a `.env` file in the root directory:

```bash
# Backend Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database (optional - app works without it)
MONGODB_URI=mongodb://localhost:27017/leftover-chef

# Security
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here

# OAuth (optional - works with demo mode)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# External APIs (optional)
SPOONACULAR_API_KEY=your-spoonacular-key
OPENAI_API_KEY=your-openai-key
```

### Frontend Environment Variables (Optional)

Create `.env` in the `frontend/` directory:

```bash
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

## 🔧 Troubleshooting Common Issues

### Issue 1: Port Already in Use
```bash
# If port 3000 or 5000 is in use:
# Kill processes using these ports (Windows)
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Kill processes using these ports (Mac/Linux)
lsof -i :3000
kill -9 <process_id>
```

### Issue 2: Node Modules Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules backend/node_modules frontend/node_modules
rm package-lock.json backend/package-lock.json frontend/package-lock.json
npm run install-all
```

### Issue 3: Permission Errors (Mac/Linux)
```bash
# Use sudo only if necessary
sudo npm run install-all
```

### Issue 4: MongoDB Connection Error
```
✅ This is NORMAL! The app works without MongoDB in development mode.
You'll see: "Continuing with in-memory data for development..."
```

## 📱 Application Features

### 🔐 Authentication System
- **Welcome Screen**: Beautiful animated landing page
- **Login/Signup**: Email/password authentication
- **OAuth Integration**: Google and Facebook login (demo mode)
- **User Validation**: Must signup before signin policy

### 🧑‍💼 Admin Features
- **Admin Dashboard**: http://localhost:5000/admin
- **User Management**: View all registered users
- **Statistics**: Real-time user analytics

### 🍽️ Recipe Features
- **Smart Recipe Finder**: Find recipes by ingredients
- **Daily Featured Recipe**: Curated daily recommendations
- **Favorites System**: Save preferred recipes
- **Add Recipes**: Create custom recipes

## 🧪 Testing the Application

### 1. Test Welcome Flow
1. Go to: http://localhost:3000/welcome
2. Click "Start Cooking"
3. Should redirect to login page

### 2. Test Authentication
1. Try to login without account → Should show "Please sign up first"
2. Switch to signup tab
3. Create account with email/password
4. Login with created account

### 3. Test OAuth (Demo Mode)
1. Click Google/Facebook buttons
2. Should show simulated OAuth flow
3. Follow the same signup-first policy

### 4. Test Admin Dashboard
1. Go to: http://localhost:5000/admin
2. Should show registered users
3. Statistics should update in real-time

## 🔍 API Endpoints

### Health Check
```bash
curl http://localhost:5000/api/health
```

### User Registration
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

### View All Users (Admin)
```bash
curl http://localhost:5000/api/users/admin/all-users
```

## 📊 Development vs Production

### Development Mode (Current Setup)
✅ **No Database Required**: Works with in-memory storage
✅ **Mock OAuth**: Demo Google/Facebook integration
✅ **No External APIs**: Works with sample data
✅ **Easy Setup**: Just `npm run dev`

### Production Mode
📝 **Database**: Requires MongoDB connection
📝 **Real OAuth**: Needs Google/Facebook app setup
📝 **External APIs**: Optional Spoonacular/OpenAI integration
📝 **Environment Variables**: All credentials configured

## 🛡️ Security Notes

### Development Security
- Uses demo OAuth credentials
- JWT tokens stored in localStorage
- CORS enabled for localhost

### Production Security
- Requires real OAuth credentials
- Use HTTPS for all callbacks
- Configure proper CORS origins
- Use secure cookie settings

## 📋 Available Scripts

```bash
# Install all dependencies
npm run install-all

# Start development (both frontend and backend)
npm run dev

# Start only backend
npm run server

# Start only frontend
npm run client

# Build frontend for production
npm run build

# Start production backend
npm start
```

## 🆘 Getting Help

### Common Commands
```bash
# Check if servers are running
curl http://localhost:5000/api/health
curl http://localhost:3000

# View backend logs
# Check terminal where you ran 'npm run dev'

# Clear browser cache
# Press Ctrl+Shift+R (or Cmd+Shift+R on Mac)
```

### Debug Information
- **Backend Health**: http://localhost:5000/api/health
- **API Documentation**: http://localhost:5000/api/docs
- **Admin Dashboard**: http://localhost:5000/admin
- **Frontend Dev Tools**: F12 in browser → Console tab

## ✅ Success Indicators

When everything is working correctly, you should see:

### Terminal Output:
```
🚀 Server started successfully!
🍳 Leftover Chef API running on port 5000
✅ Spoonacular API integration ready
✅ OpenAI API integration ready
Compiled successfully!
```

### Browser:
- **Welcome Page**: Animated landing with "Start Cooking" button
- **Login Page**: Toggle between Sign In/Sign Up
- **Main App**: Recipe features and navigation
- **Admin Dashboard**: User statistics and list

### API Responses:
```json
{
  "status": "healthy",
  "services": {
    "database": "mock_mode",
    "api": "healthy"
  }
}
```

## 🎯 Next Steps

1. **Basic Usage**: Create account and explore features
2. **OAuth Setup**: Follow OAUTH_SETUP.md for Google/Facebook
3. **Database Setup**: Install MongoDB for persistent data
4. **Production Deploy**: Configure environment variables

The application is designed to work perfectly in development mode without any external dependencies!
