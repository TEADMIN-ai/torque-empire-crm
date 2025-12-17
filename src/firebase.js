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

const isConfigMissing = Object.values(config).some((value) => !value);

export const firebaseConfigMissing = isConfigMissing;

export const firebaseApp =
  getApps().length || isConfigMissing ? getApps()[0] : initializeApp(config);

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
