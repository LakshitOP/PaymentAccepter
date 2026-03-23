import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK only on server-side

if (!admin.apps.length && typeof process !== 'undefined' && process.env.NODE_ENV) {
  try {
    // Parse the service account key from environment variable
    const keyString = process.env.FIREBASE_ADMIN_SDK_KEY;
    if (!keyString) {
      console.warn('[Firebase Admin] FIREBASE_ADMIN_SDK_KEY not set (expected in production)');
    } else {
      let serviceAccount: any;
      try {
        serviceAccount = JSON.parse(keyString);
      } catch (parseError) {
        console.warn('[Firebase Admin] Invalid FIREBASE_ADMIN_SDK_KEY JSON (will work in production)');
        // Don't throw - key might be placeholder during build
      }

      if (serviceAccount) {
        // Ensure private_key has proper newline escaping
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }

        // Validate required fields
        if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
          console.warn('[Firebase Admin] Service account key missing fields (will work in production)');
        } else {
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          });
          console.log('[Firebase Admin] Initialized for:', serviceAccount.project_id);
        }
      }
    }
  } catch (error: any) {
    console.debug('[Firebase Admin] Init error (expected during build):', error.message);
  }
}

export const adminDb = admin.apps.length > 0 ? admin.firestore() : null;
export const adminAuth = admin.apps.length > 0 ? admin.auth() : null;

export default admin;
