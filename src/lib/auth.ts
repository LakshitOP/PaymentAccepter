import { User } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    if (!auth) {
      resolve(null);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    if (!db) {
      return false;
    }

    const firestore = db;
    const adminDoc = await getDoc(doc(firestore, 'admins', uid));
    return adminDoc.exists() && adminDoc.data()?.isAdmin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

export async function checkAdminEmail(email: string): Promise<boolean> {
  try {
    if (!db) {
      return false;
    }

    const firestore = db;
    const adminDoc = await getDoc(doc(firestore, 'admins', email));
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin email:', error);
    return false;
  }
}

export const USER_ROLE = 'user';
export const ADMIN_ROLE = 'admin';
