import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const env = (key) => process.env[key];

const config = {
  apiKey: env('NEXT_PUBLIC_FIREBASE_API_KEY') || env('REACT_APP_FIREBASE_API_KEY'),
  authDomain: env('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN') || env('REACT_APP_FIREBASE_AUTH_DOMAIN'),
  projectId: env('NEXT_PUBLIC_FIREBASE_PROJECT_ID') || env('REACT_APP_FIREBASE_PROJECT_ID'),
  storageBucket: env('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET') || env('REACT_APP_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: env('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID') || env('REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
  appId: env('NEXT_PUBLIC_FIREBASE_APP_ID') || env('REACT_APP_FIREBASE_APP_ID'),
};

const missingKeys = Object.entries(config)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const firebaseConfigMissing = missingKeys.length > 0;

const existingApp = getApps()[0];
export const firebaseApp = firebaseConfigMissing ? null : existingApp || initializeApp(config);

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
