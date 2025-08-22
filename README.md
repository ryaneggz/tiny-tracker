# Tiny Tracker 📊

A lightweight, privacy-focused web analytics solution that provides real-time tracking of page views, clicks, form submissions, and user engagement without relying on external services.

## ✨ Features

- **Page View Tracking** - Monitor visitor traffic across your website
- **Click Event Tracking** - Track button clicks, link clicks, and user interactions
- **Form Submission Tracking** - Monitor contact forms and user submissions
- **Time on Page** - Measure user engagement and session duration
- **Real-time Dashboard** - Live analytics with charts and statistics
- **Privacy-First** - All data stored locally, no external dependencies
- **CORS Support** - Works with local development and production environments
- **Cookie-based User IDs** - Track unique visitors while respecting privacy

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <your-repo-url>
   cd tiny-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Visit your analytics dashboard**
   - Open http://localhost:8080 in your browser
   - Navigate between pages to generate tracking data
   - View analytics at http://localhost:8080/stats

### 🎯 That's it! You're ready to track!

## 📁 Project Structure

```
tiny-tracker/
├── server.js          # Main server application
├── events.db          # SQLite database (auto-created)
├── package.json       # Node.js dependencies
├── website/           # Demo website with tracking
│   ├── index.html     # Homepage
│   ├── about.html     # About page
│   ├── products.html  # Products page
│   ├── contact.html   # Contact page
│   └── tracker.js     # Tracking JavaScript library
└── README.md         # This file
```

## 🔧 How It Works

### Server Components

1. **Express Server** - Serves your website and handles tracking requests
2. **SQLite Database** - Stores all analytics data locally
3. **CORS Configuration** - Allows cross-origin requests for local development
4. **Static File Serving** - Serves your website files from the `/website` directory

### Tracking System

1. **Automatic Page Views** - Tracks when users visit pages
2. **Click Tracking** - Monitors interactions with tracked elements
3. **User Identification** - Uses cookies to identify unique visitors
4. **Real-time Data** - Events are captured and stored immediately

## 📈 Tracking Your Own Website

### Option 1: Include the Tracking Script

Add this to your HTML pages:

```html
<!-- Add before closing </body> tag -->
<script src="http://localhost:8080/tracker.js"></script>
```

### Option 2: Manual Tracking Setup

```html
<script>
(function() {
    // Generate or retrieve user ID
    function getUid() {
        const match = document.cookie.match(/(?:^|;)\s*tt_uid=([^;]+)/);
        if (match) return match[1];
        const uid = Math.random().toString(36).slice(2, 18);
        document.cookie = `tt_uid=${uid};path=/;max-age=${60*60*24*365*2}`;
        return uid;
    }
    
    // Send tracking event
    function trackEvent(data = {}) {
        const payload = {
            url: location.href,
            ref: document.referrer || "",
            uid: getUid(),
            ...data
        };
        
        fetch('http://localhost:8080/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include'
        });
    }
    
    // Track page view
    trackEvent({ event_type: 'page_view' });
})();
</script>
```

## 🎯 Adding Click Tracking

### Automatic Click Tracking

Add `data-track-event` attributes to any element:

```html
<!-- Track button clicks -->
<button data-track-event="hero-signup">Sign Up Now</button>

<!-- Track link clicks -->
<a href="/pricing" data-track-event="pricing-link">View Pricing</a>

<!-- Track form submissions -->
<form data-track-event="contact-form">
    <!-- form fields -->
    <button type="submit">Submit</button>
</form>
```

### Manual Click Tracking

```javascript
// Track custom events
window.tracker.trackEvent({
    event_type: 'click',
    event_name: 'custom-button-click',
    element_tag: 'button',
    element_text: 'Custom Action'
});
```

## 📊 Analytics Dashboard

Visit `http://localhost:8080/stats` to view:

- **Total Events** - Overall activity count
- **Unique Visitors** - Number of unique users
- **Event Types** - Breakdown by page views, clicks, etc.
- **Top Click Events** - Most popular interactions
- **Top URLs** - Most visited pages
- **Hourly Chart** - Activity timeline

### Dashboard Features

- **Time Filters** - View data for 1h, 24h, or 7 days
- **Real-time Updates** - Refresh to see new data
- **Event Breakdown** - Detailed analytics by type
- **Visual Charts** - Interactive timeline visualization

## 🔧 Configuration

### Server Configuration

Edit `server.js` to customize:

```javascript
// Change server port
const PORT = process.env.PORT || 3000;

// Update CORS origins for production
origin: function (origin, callback) {
    // Add your production domain
    if (origin === 'https://yourdomain.com') {
        return callback(null, true);
    }
    // ... existing logic
}
```

### Tracking Configuration

Edit `website/tracker.js` to customize:

```javascript
const TRACKER_CONFIG = {
    endpoint: 'http://your-domain.com/event',  // Your tracking endpoint
    cookieName: 'your_uid',                    // Custom cookie name
    cookieMaxAge: 60 * 60 * 24 * 365 * 2      // Cookie expiration
};
```

## 🗃️ Database Schema

The SQLite database stores events with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | INTEGER | Primary key |
| `ts` | INTEGER | Unix timestamp |
| `ip` | TEXT | Client IP address |
| `ua` | TEXT | User agent |
| `url` | TEXT | Page URL |
| `ref` | TEXT | Referrer URL |
| `uid` | TEXT | User ID (cookie) |
| `kind` | TEXT | 'pixel' or 'beacon' |
| `event_type` | TEXT | 'page_view', 'click', 'form_submit' |
| `event_name` | TEXT | Custom event name |
| `element_tag` | TEXT | HTML tag name |
| `element_text` | TEXT | Element text content |
| `link_url` | TEXT | Link destination |
| `button_type` | TEXT | Button type |
| `form_id` | TEXT | Form identifier |
| `duration` | INTEGER | Time on page (ms) |
| `client_timestamp` | INTEGER | Client-side timestamp |

## 🔒 Privacy & Security

- **Local Data Storage** - All data stays on your server
- **No External Tracking** - No third-party analytics services
- **Minimal Data Collection** - Only essential metrics
- **Cookie Consent Ready** - Easy to integrate with consent systems
- **GDPR Friendly** - Data stays under your control

## 🚀 Production Deployment

### 1. Environment Setup

```bash
# Set production port
export PORT=8080

# Start with PM2 for production
npm install -g pm2
pm2 start server.js --name tiny-tracker
```

### 2. Update CORS Settings

```javascript
// In server.js, restrict origins for production
origin: function (origin, callback) {
    const allowedOrigins = [
        'https://yourdomain.com',
        'https://www.yourdomain.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
}
```

### 3. Update Tracking Endpoint

```javascript
// In website/tracker.js
const TRACKER_CONFIG = {
    endpoint: 'https://analytics.yourdomain.com/event',
    // ... other config
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

ISC License - feel free to use this project for personal or commercial purposes.

## ❓ Troubleshooting

### Common Issues

**CORS Errors**
- Ensure your domain is allowed in the CORS configuration
- Check that credentials are properly configured

**No Data Appearing**
- Verify the server is running on the correct port
- Check browser console for JavaScript errors
- Ensure the tracking script is loaded properly

**Database Issues**
- The SQLite database is created automatically
- Check file permissions in the project directory

### Getting Help

- Check the browser console for error messages
- Verify network requests are reaching `/event` endpoint
- Test the tracking with simple page loads first

---

**Happy Tracking! 📊✨**