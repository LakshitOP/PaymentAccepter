'use client';

import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db, firebaseConfigError, isFirebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function UserLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    if (!auth || !db) {
      setError(firebaseConfigError);
      return;
    }

    const firebaseAuth = auth;
    const firestore = db;

    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(firebaseAuth, provider);
      const user = result.user;

      await setDoc(
        doc(firestore, 'users', user.uid),
        {
          email: user.email,
          photoURL: user.photoURL,
          displayName: user.displayName,
          createdAt: new Date(),
          status: 'active',
        },
        { merge: true }
      );

      router.push('/user/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to login with Google');
      console.error('Login error:', err);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Play UNO No Mercy</h1>
          <p className="text-gray-600">Pay Rs 20 to play</p>
        </div>

        {!isFirebaseConfigured && (
          <div className="mb-4 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {firebaseConfigError}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading || !isFirebaseConfigured}
          className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 font-bold text-gray-800 transition-colors hover:bg-gray-50 disabled:bg-gray-100"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#1f2937"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34a853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#fbbc05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#ea4335"
            />
          </svg>
          {loading ? 'Logging in...' : 'Sign in with Google'}
        </button>

        <div className="text-center">
          <Link href="/" className="text-sm text-blue-500 hover:text-blue-700">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
