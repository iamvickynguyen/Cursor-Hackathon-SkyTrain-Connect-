# SkyTrain Connect

A PWA that connects SkyTrain commuters based on professional profile similarity. Open the app to "board the train", get matched with nearby professionals who share your interests.

## Tech Stack

React 18, TypeScript, Vite, Tailwind CSS, Firebase v10 (Firestore), vite-plugin-pwa

## Prerequisites

- Node.js (v18+)
- npm (v9+)
- A Google account (for Firebase)

## Setup

### 1. Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and give it a name (e.g. `skytrain-connect`).
3. Disable Google Analytics if you don't need it, then click **Create project**.

### 2. Enable Firestore

1. In your Firebase project, go to **Build > Firestore Database** in the left sidebar.
2. Click **Create database**.
3. Choose a location closest to your users (e.g. `us-central1` or `northamerica-northeast1` for Canada).
4. Select **Start in test mode** for development (allows all reads/writes for 30 days).
5. Click **Enable**.

### 3. Register a web app

1. In the Firebase Console, go to **Project Settings** (gear icon) > **General**.
2. Under **Your apps**, click the web icon (`</>`) to add a new web app.
3. Enter a nickname (e.g. `skytrain-connect-web`) and click **Register app**.
4. Firebase will display your app's configuration object — you'll need these values in the next step.

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the values from the Firebase config object:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Note:** `.env.local` is gitignored and should never be committed. Each developer needs their own copy.

### 5. Install dependencies and run

```bash
npm install
npm run dev
```

The app will be available at http://localhost:5173.

## Scripts

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start dev server               |
| `npm run build`     | Type-check + production build  |
| `npm run preview`   | Preview the production build   |

## How It Works

1. Fill out your profile (name, role, what you're open to).
2. The app marks you as active and listens for other active users in real time via Firestore.
3. A matching algorithm (Jaccard similarity on role + interests) finds the best match from nearby active users.
4. A keepalive updates your presence every 30 seconds. Closing the app sets you as inactive.

Users are considered "co-present" if they are active and were last seen within 5 minutes.

## Firestore Security Rules (Production)

Before going to production, replace the test-mode rules in **Firestore > Rules** with something more restrictive. A minimal example:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.resource.data.keys().hasAll(['name', 'role', 'openTo', 'lastSeen', 'isActive']);
    }
  }
}
```

Adjust these rules based on your authentication and authorization needs.

## Deployment

Build the production bundle and deploy to Firebase Hosting (or any static host):

```bash
npm run build
```

This outputs to `dist/`. To deploy with Firebase Hosting:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # select your project, set public dir to "dist", configure as SPA
firebase deploy
```

## Project Structure

```
src/
├── components/
│   └── MatchCard.tsx        # Matched user card UI
├── pages/
│   ├── ProfileSetup.tsx     # Onboarding form, writes to Firestore
│   └── TrainView.tsx        # Real-time listener, keepalive, match display
├── utils/
│   └── matching.ts          # Jaccard similarity + findBestMatch()
├── firebase.ts              # Firebase initialization
├── App.tsx                  # Root component / routing
└── main.tsx                 # Entry point
```
