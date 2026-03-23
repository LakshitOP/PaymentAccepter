import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => value !== ''
);

export const firebaseConfigError =
  'Firebase configuration is incomplete. Add the required NEXT_PUBLIC_FIREBASE_* variables to .env.local.';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  app = firebaseApp;
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
} else if (typeof window !== 'undefined') {
  console.warn(firebaseConfigError);
}

export { app, auth, db, storage };
export default app;
