'use client';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db, firebaseConfigError, isFirebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
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
import { Input } from '@/components/ui/input';

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
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="border-slate-200/80 bg-slate-950 text-white">
          <CardHeader className="space-y-3">
            <Badge className="w-fit bg-cyan-300 text-slate-950">Admin workspace</Badge>
            <CardTitle className="text-3xl text-white">
              Review and verify payments with clarity.
            </CardTitle>
            <CardDescription className="text-slate-300">
              A cleaner admin access screen for transaction oversight and quick action.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-slate-300">
            <div className="rounded-2xl bg-white/5 p-5">
              Pending transactions, verified receipts, and rejection actions in one
              responsive view.
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="text-2xl font-semibold text-white">Fast</p>
                <p className="mt-1 text-slate-400">Quick verification workflow</p>
              </div>
              <div className="rounded-2xl border border-white/10 p-4">
                <p className="text-2xl font-semibold text-white">Secure</p>
                <p className="mt-1 text-slate-400">Protected auth and review path</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardHeader className="space-y-3">
            <Badge variant="muted" className="w-fit">
              Login
            </Badge>
            <CardTitle className="text-2xl">Admin Sign In</CardTitle>
            <CardDescription>
              Use your authorized admin credentials to access the dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {!isFirebaseConfigured && (
              <Alert variant="warning">{firebaseConfigError}</Alert>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !isFirebaseConfigured}
                className="w-full rounded-2xl"
              >
                {loading ? 'Logging in...' : 'Enter dashboard'}
              </Button>
            </form>

            <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Admin accounts must exist in both Firebase Authentication and the
              `admins` Firestore collection.
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Need player access instead?</span>
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
