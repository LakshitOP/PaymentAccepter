import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export default admin;
