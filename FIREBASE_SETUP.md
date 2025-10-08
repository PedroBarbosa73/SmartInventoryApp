# Firebase Setup Guide

Your Smart Inventory app has been converted to use Firebase! Here's what you need to do to get it running:

## 1. Firebase Console Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `smartinventory-7586b`
3. Make sure the following services are enabled:
   - **Authentication** (Email/Password) - ✅ **REQUIRED**
   - **Firestore Database** - ✅ **REQUIRED**
   - **Storage** - ⚠️ **OPTIONAL** (requires billing account)

## 2. Firestore Database Setup

1. In Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
4. Select a location close to your users
5. Click **Done**

## 3. Authentication Setup

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click **Save**

## 4. Storage Setup (OPTIONAL)

**⚠️ IMPORTANT**: Firebase Storage requires a billing account and may incur costs.

### Option A: Skip Storage (Recommended for now)
- Photos will be stored locally on the device
- App will work perfectly without cloud storage
- You can add this later when ready

### Option B: Enable Storage (if you want cloud photo storage)
1. In Firebase Console, go to **Storage**
2. Click **Get Started**
3. Choose **Start in test mode** (for development)
4. Select a location close to your users
5. Click **Done**

**Free Tier Limits**: 5GB storage, 1GB download, 20,000 uploads per month

## 5. Security Rules

Copy the contents of `firestore.rules` to your Firestore Database rules in the Firebase Console:

1. Go to **Firestore Database** > **Rules**
2. Replace the existing rules with the contents of `firestore.rules`
3. Click **Publish**

## 6. Configure Your App

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your Firebase configuration values from step 1

3. Update `services/firebase.js` with your actual Firebase config (or use environment variables)

## 7. Run Your App

Now you can start your app:

```bash
npm start
# or
expo start
```

## What's Changed

- ✅ **Database**: SQLite → Firebase Firestore
- ✅ **Authentication**: Firebase Auth with email/password
- ⚠️ **Storage**: Local storage (can upgrade to Firebase Storage later)
- ✅ **Real-time**: Data syncs across devices
- ✅ **Cloud**: Data backed up in the cloud

## Features

- **User Authentication**: Sign up, login, logout
- **Data Isolation**: Each user only sees their own data
- **Real-time Updates**: Changes sync immediately
- **Offline Support**: Works offline, syncs when online
- **Photo Storage**: Images stored locally (can upgrade to cloud later)

## Cost Considerations

- **Firestore Database**: Free tier includes 1GB storage, 50,000 reads, 20,000 writes per day
- **Authentication**: Free tier includes 10,000 monthly active users
- **Storage**: Free tier includes 5GB storage, 1GB download per month
- **Billing**: Required for Storage, optional for other services

## Troubleshooting

If you encounter issues:

1. Check Firebase Console for any error messages
2. Verify your Firebase configuration in `services/firebase.js`
3. Make sure Authentication and Firestore are enabled
4. Check the browser console for error logs

## Next Steps

- Test the app with local photo storage
- Add Firebase Storage later if you need cloud photo backup
- Add more authentication methods (Google, Facebook, etc.)
- Implement data export/import
- Add user profile management
