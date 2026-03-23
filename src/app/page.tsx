'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { auth, firebaseConfigError, isFirebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (user) {
        router.push('/user/dashboard');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4">
        {!isFirebaseConfigured && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {firebaseConfigError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="rounded-lg bg-white p-8 text-center shadow-lg transition-shadow hover:shadow-xl">
            <div className="mb-6">
              <div className="mb-4 text-5xl font-bold text-blue-500">P</div>
              <h2 className="mb-2 text-3xl font-bold text-gray-800">Player</h2>
              <p className="text-gray-600">Pay Rs 20 to play UNO No Mercy</p>
            </div>
            <Link
              href="/user/login"
              className="inline-block w-full rounded-lg bg-blue-500 px-6 py-3 font-bold text-white transition-colors hover:bg-blue-600"
            >
              Login as Player
            </Link>
          </div>

          <div className="rounded-lg bg-white p-8 text-center shadow-lg transition-shadow hover:shadow-xl">
            <div className="mb-6">
              <div className="mb-4 text-5xl font-bold text-purple-500">A</div>
              <h2 className="mb-2 text-3xl font-bold text-gray-800">Admin</h2>
              <p className="text-gray-600">Verify payments and manage transactions</p>
            </div>
            <Link
              href="/admin/login"
              className="inline-block w-full rounded-lg bg-purple-500 px-6 py-3 font-bold text-white transition-colors hover:bg-purple-600"
            >
              Login as Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
