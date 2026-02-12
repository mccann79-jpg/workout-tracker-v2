# LIFT — Workout Tracker

A sleek, dark-themed PWA for tracking weight lifting progress. Syncs across devices via Firebase.

## Setup Instructions

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project** → name it (e.g., "lift-tracker") → Create
3. Go to **Build → Firestore Database** → **Create Database** → Start in **test mode**
4. Go to **Project Settings** (gear icon) → scroll to **Your apps** → click the **Web** (`</>`) icon
5. Register the app (name doesn't matter) → Copy the `firebaseConfig` object

### 2. Add Your Firebase Config
Open `index.html` and replace the placeholder config near the top of the `<script>`:

```js
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 3. Deploy to GitHub Pages
1. Create a new GitHub repository
2. Upload ALL these files to the root of the repo:
   - `index.html`
   - `manifest.json`
   - `sw.js`
   - `apple-touch-icon.png`
   - `icon-192.png`
   - `icon-512.png`
   - `favicon-32.png`
   - `favicon.ico`
3. Go to **Settings → Pages** → set source to your branch → Save
4. Your site will be live at `https://yourusername.github.io/repo-name/`

### 4. Add to iPhone Home Screen
1. Open the site in Safari on your iPhone
2. Tap the **Share** button (square with arrow)
3. Tap **Add to Home Screen**
4. The LIFT icon will appear on your home screen!

## Files Included

| File | Purpose |
|------|---------|
| `index.html` | Main app (all-in-one HTML/CSS/JS) |
| `manifest.json` | PWA manifest for install prompts |
| `sw.js` | Service worker for offline caching |
| `apple-touch-icon.png` | 180×180 iOS home screen icon |
| `icon-192.png` | 192×192 Android/PWA icon |
| `icon-512.png` | 512×512 high-res icon |
| `favicon-32.png` | Browser tab favicon |
| `favicon.ico` | Legacy favicon |

## What's New vs. Your Original

- **Dark theme** — navy/charcoal palette with red accents (no more generic purple gradient)
- **Bottom tab navigation** — iOS-native feel, easier one-handed use
- **Toast notifications** — no more browser `alert()` popups
- **Custom confirm dialogs** — styled confirmation modals instead of browser defaults
- **Today's summary stats** — sets, volume, muscles hit at a glance
- **PR detection** — automatic personal record alerts when you log a new max
- **Bottom sheet modals** — edit/import modals slide up from bottom like native iOS
- **Tap-to-dismiss modals** — tap outside to close
- **Service worker** — offline caching for faster loads
- **Safe area support** — proper iPhone notch/dynamic island handling
- **Better typography** — DM Sans + Space Mono for a premium feel
- **Improved charts** — dark-themed Chart.js with accent colors
- **All original features preserved** — goals, progression plans, import/export, custom exercises
