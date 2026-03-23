'use client';

import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth, db, firebaseConfigError, isFirebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

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
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          hasPaid: false,
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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1fr_440px]">
        <section className="flex flex-col justify-center space-y-6">
          <Badge variant="default" className="w-fit bg-emerald-500 text-slate-950">
            Google Sign In
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Login to continue to payment.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Use your Google account to continue to the payment screen and complete
              your confirmation flow.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['01', 'Google authentication'],
              ['02', 'UPI QR payment view'],
              ['03', 'Manual paid confirmation'],
            ].map(([step, label]) => (
              <Card key={label} className="border-slate-200/80 bg-white/70">
                <CardContent className="space-y-3 p-5">
                  <div className="text-sm font-semibold text-emerald-500">{step}</div>
                  <p className="text-sm leading-6 text-slate-600">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Card className="border-slate-200/80">
          <CardHeader className="space-y-3">
            <Badge variant="muted" className="w-fit">
              Access account
            </Badge>
            <CardTitle className="text-2xl">Continue as player</CardTitle>
            <CardDescription>
              Securely sign in, then pay using UPI and mark your payment status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {!isFirebaseConfigured && (
              <Alert variant="warning">{firebaseConfigError}</Alert>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            <Button
              onClick={handleGoogleLogin}
              disabled={loading || !isFirebaseConfigured}
              variant="outline"
              size="lg"
              className="w-full justify-center gap-3 rounded-2xl border-slate-200"
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
              {loading ? 'Signing you in...' : 'Continue with Google'}
            </Button>

            <div className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-500">
              One-click sign in and a clean payment card with amount, QR code, and timer.
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Need to switch roles?</span>
              <Link href="/" className="font-medium text-slate-950">
                Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
