# 🍳 Recipe Bot - Your Ultimate Cooking Companion

A beautiful, modern recipe management application with smart ingredient-based recipe finding, favorites management, and cooking tools.

## ✨ Features

- **Browse Recipes**: Beautiful recipe cards with detailed information
- **Smart Recipe Finder**: Find recipes based on ingredients you have
- **Favorites Management**: Save and organize your favorite recipes
- **Add New Recipes**: Contribute your own recipes to the collection
- **Recipe of the Day**: Discover featured recipes daily
- **Cooking Timer**: Built-in timer for perfect cooking
- **Responsive Design**: Works perfectly on all devices
- **Offline Support**: Service worker for offline functionality

## 🚀 Deployment to Fly.io

### Prerequisites

1. Install [Fly.io CLI](https://fly.io/docs/getting-started/installing-flyctl/):
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. Create a Fly.io account and login:
   ```bash
   flyctl auth signup  # or flyctl auth login
   ```

### Deploy the App

1. **Launch the app** (first time only):
   ```bash
   flyctl launch
   ```
   - Choose a unique app name
   - Select a region close to your users
   - Don't add a database (we use in-memory storage)

2. **Deploy updates**:
   ```bash
   npm run deploy
   # or
   flyctl deploy
   ```

3. **Open your live app**:
   ```bash
   flyctl open
   ```

### Useful Commands

```bash
# Check app status
npm run status

# View logs
npm run logs

# Scale app
flyctl scale count 1

# Check app info
flyctl info
```

## 🛠️ Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   # or
   npm run dev
   ```

3. **Open browser**: `http://localhost:3000`

## 📁 Project Structure

```
recipe-bot/
├── public/           # Frontend assets
│   ├── index.html   # Main HTML file
│   ├── style.css    # Modern responsive styles
│   ├── app.js       # Frontend JavaScript
│   └── sw.js        # Service worker
├── server.js        # Express server
├─�� package.json     # Dependencies and scripts
├── Dockerfile       # Container configuration
├── fly.toml         # Fly.io deployment config
└── README.md        # This file
```

## 🎨 Design Features

- **Modern Gradient Background** with floating animations
- **Glassmorphism UI** with backdrop blur effects
- **Smooth Animations** and micro-interactions
- **Mobile-First Design** with responsive layouts
- **Beautiful Typography** and spacing
- **Accessible Design** with proper focus states

## 🔧 Technical Features

- **Express.js** backend with REST API
- **Vanilla JavaScript** frontend (no frameworks)
- **Modern CSS** with Grid and Flexbox
- **Service Worker** for offline functionality
- **Optimized Performance** with caching and compression
- **SEO Optimized** with meta tags and Open Graph

## 📱 Browser Support

- ✅ Chrome/Chromium 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC License - feel free to use this project for learning and development!

---

Made with ❤️ and 🍳 for cooking enthusiasts everywhere!
