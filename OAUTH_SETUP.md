# OAuth Setup Guide for Leftover Chef

This guide will help you set up Google and Facebook OAuth authentication for the Leftover Chef application.

## 🚀 Quick Start

The application works out of the box with mock OAuth for development. For production, follow the setup instructions below.

## 📋 Current Features

✅ **User Authentication Flow**
- Users MUST sign up before they can sign in
- Detailed error messages for login attempts
- JWT token-based authentication
- Persistent login sessions

✅ **OAuth Integration**
- Google OAuth (with real token verification)
- Facebook OAuth (with simulation for demo)
- Automatic user creation for new OAuth users
- Existing user validation for OAuth login

✅ **Admin Dashboard**
- View all registered users at `/admin`
- Real-time user statistics
- User activity tracking

## 🔧 Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API and Google OAuth2 API

### 2. Create OAuth Credentials

1. Go to "Credentials" in the Google Cloud Console
2. Click "Create Credentials" → "OAuth client ID"
3. Choose "Web application"
4. Add authorized origins:
   - `http://localhost:3000` (frontend)
   - `http://localhost:5000` (backend)
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

### 4. Frontend Configuration

Add to your frontend `.env` file:

```bash
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
```

## 📘 Facebook OAuth Setup

### 1. Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add "Facebook Login" product

### 2. Configure Facebook Login

1. In Facebook Login settings, add valid OAuth redirect URIs:
   - `http://localhost:5000/api/auth/facebook/callback`
2. Add your domain to App Domains: `localhost`

### 3. Configure Environment Variables

Add to your backend `.env` file:

```bash
# Facebook OAuth
FACEBOOK_APP_ID=your-facebook-app-id-here
FACEBOOK_APP_SECRET=your-facebook-app-secret-here
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
```

## 🧪 Testing OAuth Flow

### 1. Start the Application

```bash
# Install dependencies
npm run install-all

# Start development servers
npm run dev
```

### 2. Test User Flow

1. Visit `http://localhost:3000/welcome`
2. Click "Start Cooking"
3. Try to sign in without an account → Should show "Please sign up first"
4. Sign up with email/password
5. Try OAuth login → Should work for existing users

### 3. Test Admin Dashboard

Visit `http://localhost:5000/admin` to see:
- All registered users
- User statistics
- Registration activity

## 🔐 Authentication Rules

### Sign Up Required First Policy

The application enforces that users must sign up before they can sign in:

1. **Regular Login**: Checks if user exists before allowing login
2. **Google OAuth**: 
   - Sign Up mode: Creates new user (fails if exists)
   - Sign In mode: Requires existing user (fails if not found)
3. **Facebook OAuth**: Same rules as Google

### Error Handling

The application provides specific error messages:
- `userNotFound`: "No account found. Please sign up first."
- `userExists`: "Account already exists. Please sign in instead."
- `invalidPassword`: "Invalid password. Please try again."

## 📊 API Endpoints

### Authentication
- `POST /api/users/register` - Regular signup
- `POST /api/users/login` - Regular login
- `POST /api/auth/google/verify` - Google OAuth
- `POST /api/auth/facebook/verify` - Facebook OAuth
- `POST /api/auth/check-email` - Check if email exists

### Admin
- `GET /api/users/admin/all-users` - Get all users
- `GET /api/users/admin/stats` - User statistics

### OAuth Redirect URLs
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/facebook` - Initiate Facebook OAuth  
- `GET /api/auth/facebook/callback` - Facebook OAuth callback

## 🚨 Security Notes

1. **Environment Variables**: Never commit real OAuth credentials to version control
2. **HTTPS in Production**: Use HTTPS for all OAuth callbacks in production
3. **Domain Validation**: Configure OAuth providers with your actual production domains
4. **Token Storage**: JWT tokens are stored in localStorage (consider httpOnly cookies for enhanced security)

## 🐛 Troubleshooting

### Common Issues

1. **Google OAuth not working**: 
   - Check that Google APIs are enabled
   - Verify redirect URIs match exactly
   - Ensure client ID is configured in frontend

2. **Facebook OAuth issues**:
   - Check app is not in development mode for public use
   - Verify App Domains configuration
   - Ensure redirect URIs are whitelisted

3. **"Please sign up first" errors**:
   - This is expected behavior! Users must create an account before signing in
   - Use the Sign Up tab for new users

### Development Mode

The application works with mock data when MongoDB is not connected, making it perfect for development and testing.

## 🎯 Production Deployment

For production deployment:

1. Set up MongoDB database
2. Configure real OAuth credentials
3. Update redirect URIs to production domains
4. Set secure environment variables
5. Enable HTTPS

The application is designed to gracefully handle both development (mock mode) and production (database mode) environments.
