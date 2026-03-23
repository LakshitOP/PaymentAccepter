'use client';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db, firebaseConfigError, isFirebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth || !db) {
      setError(firebaseConfigError);
      return;
    }

    const firebaseAuth = auth;
    const firestore = db;

    setLoading(true);
    setError('');

    try {
      const adminDoc = await getDoc(doc(firestore, 'admins', email));
      if (!adminDoc.exists()) {
        setError('Access denied. Not an admin.');
        setLoading(false);
        return;
      }

      await signInWithEmailAndPassword(firebaseAuth, email, password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Admin account not found.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError(err.message || 'Failed to login');
      }
      console.error('Login error:', err);
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-800">Admin Login</h1>
          <p className="text-gray-600">Verify payments and manage transactions</p>
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

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-purple-500"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:border-purple-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isFirebaseConfigured}
            className="w-full rounded-lg bg-purple-500 px-4 py-3 font-bold text-white transition-colors hover:bg-purple-600 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="mb-2 text-sm text-gray-600">
            Note: Only authorized admins can access this panel
          </p>
          <Link href="/" className="text-sm text-purple-500 hover:text-purple-700">
            Back to Home
          </Link>
        </div>

        <div className="mt-4 rounded border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800">
          <strong>Demo Note:</strong> Admin accounts must be manually created in
          Firebase. Contact your administrator for access.
        </div>
      </div>
    </div>
  );
}
