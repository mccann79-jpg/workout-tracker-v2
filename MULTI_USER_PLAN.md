# Multi-User Support with Google Sign-In

## Context
The app currently stores all data in root-level Firestore collections (`workouts`, `customExercises`) with no authentication. Anyone with the project ID can access all data. Adding Google Sign-In scopes data per user and secures the database.

## Prerequisites (Firebase Console — manual steps)
1. Go to **Firebase Console → Authentication → Sign-in method → Google → Enable** (set project support email)
2. Under **Authorized domains**, ensure your hosting domain is listed (localhost is default, add GitHub Pages domain if used)
3. After code changes, deploy new **Firestore security rules** (provided below)

## Files Modified
- `index.html` — auth SDK, auth UI, auth logic, Firestore path refactoring, migration
- `sw.js` — bump cache version to `lift-v5`

---

## Implementation Steps

### 1. Add Firebase Auth SDK (line 25)
Add after existing Firestore script:
```html
<script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
```

### 2. Auth Screen HTML
Add a full-screen sign-in overlay before `<div class="app">`. Uses the same glassmorphism styling as the rest of the app (gradient background, frosted glass card, Google SVG logo button). The `.app` div starts hidden (`style="display:none"`).

### 3. Header Sign-Out Button
Add user avatar (from Google profile) + "Sign Out" button to the right side of `.header-row`.

### 4. Auth State Management (JS, after Firebase init ~line 612)
New globals:
```js
let currentUser = null;
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();
```

Functions:
- `signInWithGoogle()` — uses `signInWithPopup`, falls back to `signInWithRedirect` if popup blocked
- `signOut()` — confirms, clears local state, calls `auth.signOut()`
- `updateUserUI(user)` — sets avatar and display name in header

Auth listener (`onAuthStateChanged`):
- **User signed in**: hide auth screen, show app, run migration, call `init()`
- **No user**: show auth screen, hide app

### 5. `userCollection()` Helper
```js
function userCollection(name) {
    return db.collection('users').doc(currentUser.uid).collection(name);
}
```

### 6. Refactor All Firestore Paths
Replace every `db.collection('workouts')` and `db.collection('customExercises')` with `userCollection('workouts')` and `userCollection('customExercises')`. There are 11 call sites:

| Function | Operation |
|----------|-----------|
| `loadData()` | read workouts |
| `saveData()` | add workout |
| edit entry | update workout |
| delete entry | delete workout |
| import (batch delete) | delete all workouts |
| import (batch set) | add workouts |
| clear all data | delete all workouts |
| `loadCustomExercises()` | read exercises |
| `saveCustomExercise()` | add exercise |
| update exercise | update exercise |
| `deleteCustomExercise()` | delete exercise |

### 7. Data Migration
`migrateRootDataIfNeeded(uid)` — runs on first sign-in:
1. Check if root `workouts` collection has data AND user subcollection is empty
2. Copy all root `workouts` → `users/{uid}/workouts`
3. Copy all root `customExercises` → `users/{uid}/customExercises`
4. Delete root-level data after successful copy
5. Handle batch size limit (chunk at 499 per batch for Firestore's 500 limit)

### 8. Replace `init()` Call
Remove standalone `init()` at bottom of script. It now only fires from `onAuthStateChanged` after authentication.

### 9. Bump Service Worker Cache
In `sw.js`, change `CACHE_NAME` from `'lift-v4'` to `'lift-v5'`.

### 10. Firestore Security Rules (deploy via Firebase Console)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User-scoped data: each user can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Legacy root collections: allow read/delete for migration only
    match /workouts/{docId} {
      allow read, delete: if request.auth != null;
    }
    match /customExercises/{docId} {
      allow read, delete: if request.auth != null;
    }
    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## Verification
1. Open app → auth screen appears with Google Sign-In button
2. Sign in → existing data migrates automatically, app loads normally
3. All 5 tabs work with data (Log, History, Progress, Exercises, Data)
4. Sign out → returns to auth screen
5. Sign in as a different Google account → sees empty data (isolated)
6. Import/export/clear all work correctly
7. Header shows user avatar and sign-out button

## Edge Cases
- **Batch size**: If >500 workouts, migration must chunk into multiple batches
- **Popup blockers**: Fall back to `signInWithRedirect` if popup fails on mobile
- **Offline**: Auth screen shows but sign-in requires network — consider showing an offline message
- **Post-migration cleanup**: After all users have migrated, tighten root-level rules to deny all access
