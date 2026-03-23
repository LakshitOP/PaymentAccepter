'use client';

import { useEffect, useState } from 'react';
import { auth, db, firebaseConfigError, isFirebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import SuccessAnimation from '@/components/SuccessAnimation';
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
import { SiteNavbar } from '@/components/site-navbar';

export const dynamic = 'force-dynamic';

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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
    if (secondsLeft <= 0 || user?.hasPaid) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((previous) => (previous > 0 ? previous - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft, user?.hasPaid]);

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
      setShowSuccess(true);
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-lg">
          Preparing your payment dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SiteNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Payment Confirmation</h1>
            <p className="text-slate-600 mt-1">Complete your UNO No Mercy entry fee</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Logout
          </Button>
        </div>

        {error && (
          <Alert variant="danger" className="mb-6">{error}</Alert>
        )}
        {!isFirebaseConfigured && (
          <Alert variant="warning" className="mb-6">{firebaseConfigError}</Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Payment Card */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Info */}
            <Card className="border-slate-200 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Your Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</p>
                    <p className="text-lg font-semibold text-slate-900 mt-1">{user?.name || 'User'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</p>
                    <p className="text-lg font-semibold text-slate-900 mt-1 truncate">{user?.email || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Section */}
            <Card className="border-slate-200 shadow-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Payment Method</CardTitle>
                    <CardDescription>Scan the QR code or use UPI ID</CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">UPI</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-2xl border-4 border-slate-200 bg-white p-4">
                    <img
                      src={qrImageUrl}
                      alt="UPI payment QR code"
                      className="h-48 w-48"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-600 text-center">UPI ID</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm font-semibold text-slate-900 break-all">
                      {upiId}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Instructions */}
            <Card className="border-slate-200 shadow-card bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">How to Pay</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white flex-shrink-0">
                    1
                  </div>
                  <p className="text-sm text-slate-700">Open your UPI app (Google Pay, PhonePe, etc.)</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white flex-shrink-0">
                    2
                  </div>
                  <p className="text-sm text-slate-700">Scan the QR code or enter UPI ID {upiId}</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white flex-shrink-0">
                    3
                  </div>
                  <p className="text-sm text-slate-700">Pay ₹{amount}</p>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white flex-shrink-0">
                    4
                  </div>
                  <p className="text-sm text-slate-700">Click "I have paid" below to confirm</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Status */}
            <Card className={`border-slate-200 shadow-card ${user?.hasPaid ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
              <CardHeader>
                <CardTitle className="text-lg">Payment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Amount</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">₹{amount}</p>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${user?.hasPaid ? 'bg-green-500' : 'bg-amber-500'}`} />
                    <p className={`text-sm font-semibold ${user?.hasPaid ? 'text-green-700' : 'text-amber-700'}`}>
                      {user?.hasPaid ? 'Paid ✓' : 'Pending'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timer */}
            <Card className="border-slate-200 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg text-sm">Timer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-bold tabular-nums ${secondsLeft <= 10 ? 'text-red-600' : secondsLeft <= 30 ? 'text-amber-600' : 'text-green-600'}`}>
                    {String(secondsLeft).padStart(2, '0')}
                  </span>
                  <span className="text-slate-600 font-medium">seconds</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      secondsLeft <= 10 ? 'bg-red-500' :
                      secondsLeft <= 30 ? 'bg-amber-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(secondsLeft / 60) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-600">Complete payment within the time</p>
              </CardContent>
            </Card>

            {/* Action Button */}
            <Button
              onClick={handleMarkPaid}
              disabled={markingPaid || user?.hasPaid === true || !isFirebaseConfigured || secondsLeft <= 0}
              size="lg"
              className={`w-full h-12 font-semibold rounded-xl shadow-lg transition-all ${
                user?.hasPaid
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {user?.hasPaid ? (
                <span className="flex items-center gap-2">
                  <span>✓ Payment Confirmed</span>
                </span>
              ) : markingPaid ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Confirming...
                </span>
              ) : secondsLeft <= 0 ? (
                'Time Expired'
              ) : (
                'I Have Paid ✓'
              )}
            </Button>
          </div>
        </div>
      </main>

      {showSuccess && <SuccessAnimation onClose={() => setShowSuccess(false)} />}
    </div>
  );
}
