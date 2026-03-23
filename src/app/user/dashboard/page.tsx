'use client';

import { useEffect, useState } from 'react';
import { auth, db, firebaseConfigError, isFirebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
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

export const dynamic = 'force-dynamic';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState<number>(20);
  const [secondsLeft, setSecondsLeft] = useState(60);

  const upiId = '9461062645@axl';
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    'UNO No Mercy'
  )}&am=${amount}&cu=INR`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
    upiLink
  )}`;

  useEffect(() => {
    if (!auth || !db) {
      setError(firebaseConfigError);
      setLoading(false);
      return;
    }

    const firebaseAuth = auth;
    const firestore = db;

    const unsubscribe = firebaseAuth.onAuthStateChanged(async (currentUser: any) => {
      if (!currentUser) {
        router.push('/user/login');
        return;
      }

      try {
        const userRef = doc(firestore, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          await setDoc(
            userRef,
            {
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
              email: currentUser.email || '',
              hasPaid: false,
            },
            { merge: true }
          );
        }

        const configDoc = await getDoc(doc(firestore, 'config', 'payment'));
        const configAmount = configDoc.data()?.amount;
        if (typeof configAmount === 'number' && Number.isFinite(configAmount)) {
          setAmount(configAmount);
        }

        const latestUserDoc = await getDoc(userRef);
        setUser({
          uid: currentUser.uid,
          name:
            latestUserDoc.data()?.name ||
            currentUser.displayName ||
            currentUser.email?.split('@')[0] ||
            'User',
          email: latestUserDoc.data()?.email || currentUser.email || '',
          hasPaid: latestUserDoc.data()?.hasPaid === true,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load payment information.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const handleMarkPaid = async () => {
    if (!user || !db) {
      return;
    }

    setMarkingPaid(true);
    setError('');
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        hasPaid: true,
      });

      setUser((prev: any) => ({
        ...prev,
        hasPaid: true,
      }));
    } catch (err: any) {
      setError(err.message || 'Unable to update payment status.');
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleLogout = async () => {
    if (!auth) {
      router.push('/');
      return;
    }

    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-3xl border border-white/70 bg-white/80 px-6 py-4 text-sm font-medium text-slate-600 shadow-lg backdrop-blur">
          Preparing your dashboard...
        </div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
      <Card className="w-full max-w-2xl rounded-3xl border-slate-200/80 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]">
        <CardHeader className="space-y-4 border-b border-slate-100 pb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Badge variant="default" className="bg-emerald-500 text-slate-950">
                Payment
              </Badge>
              <CardTitle className="mt-3 text-2xl text-slate-950">Pay Rs {amount}</CardTitle>
              <CardDescription className="mt-2">
                Complete your payment in 60 seconds.
              </CardDescription>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">User</p>
              <p className="mt-2 font-semibold text-slate-950">{user?.name || 'User'}</p>
              <p className="text-sm text-slate-500">{user?.email || '-'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Status</p>
              <p className="mt-2 font-semibold text-slate-950">
                {user?.hasPaid ? 'Paid' : 'Not Paid'}
              </p>
              <p className="text-sm text-slate-500">{secondsLeft}s remaining</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {error && <Alert variant="danger">{error}</Alert>}
          {!isFirebaseConfigured && <Alert variant="warning">{firebaseConfigError}</Alert>}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-medium text-slate-700">
              Complete your payment in {secondsLeft} seconds
            </p>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${(secondsLeft / 60) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-[1fr_220px] sm:items-center">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">UPI ID</p>
              <p className="break-all rounded-xl bg-slate-100 px-3 py-2 font-mono text-sm font-semibold text-slate-900">
                {upiId}
              </p>
              <p className="text-sm text-slate-500">Amount: Rs {amount}</p>
            </div>
            <div className="flex justify-center">
              <img
                src={qrImageUrl}
                alt="UPI payment QR code"
                className="h-44 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
              />
            </div>
          </div>

          <Button
            onClick={handleMarkPaid}
            disabled={markingPaid || user?.hasPaid === true || !isFirebaseConfigured}
            size="lg"
            className="w-full rounded-2xl"
          >
            {user?.hasPaid ? 'Payment already marked as paid' : markingPaid ? 'Updating status...' : 'I have paid'}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
