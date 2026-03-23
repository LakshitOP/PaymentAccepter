'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, db, firebaseConfigError, isFirebaseConfigured } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteNavbar } from '@/components/site-navbar';

export const dynamic = 'force-dynamic';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('id');
  
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!auth || !db) {
      setError(firebaseConfigError);
      setLoading(false);
      return;
    }

    if (!paymentId) {
      setError('Payment ID not found');
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

      // Fetch payment details
      try {
        const paymentDoc = await getDoc(doc(firestore, 'payments', paymentId));
        if (paymentDoc.exists()) {
          setPayment(paymentDoc.data());
        } else {
          setError('Payment not found');
        }
      } catch (err) {
        setError('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, paymentId]);

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
          Loading your payment confirmation...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <SiteNavbar />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Payment Confirmed</h1>
            <p className="text-slate-600 mt-1">Your payment has been successfully verified</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            Logout
          </Button>
        </div>

        {error && <Alert variant="danger" className="mb-6">{error}</Alert>}
        {!isFirebaseConfigured && (
          <Alert variant="warning" className="mb-6">{firebaseConfigError}</Alert>
        )}

        {/* Success Animation */}
        <div className="mb-8 flex justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="relative"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-500 border-r-green-500"
            />
            <div className="relative h-24 w-24 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-4xl text-white"
              >
                ✓
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Success Message Card */}
        <Card className="border-2 border-green-200 bg-green-50 shadow-lg mb-8">
          <CardHeader className="text-center">
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <CardTitle className="text-3xl text-green-900">Payment Successful! 🎉</CardTitle>
              <CardDescription className="text-base text-green-700 mt-2">
                Thank you for your payment. You're all set!
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Details */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <h3 className="font-semibold text-slate-900">Payment Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-white p-4 border border-green-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">₹{payment?.amount || 0}</p>
                </div>
                <div className="rounded-lg bg-white p-4 border border-green-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment ID</p>
                  <p className="text-sm font-mono text-slate-900 mt-1 truncate">{paymentId}</p>
                </div>
                <div className="rounded-lg bg-white p-4 border border-green-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</p>
                  <p className="text-sm font-semibold text-green-600 mt-1">Approved ✓</p>
                </div>
                <div className="rounded-lg bg-white p-4 border border-green-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</p>
                  <p className="text-sm text-slate-900 mt-1">{payment?.name || 'User'}</p>
                </div>
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="rounded-lg bg-white/50 border border-green-200 p-4"
            >
              <p className="text-sm text-slate-700">
                Your payment has been verified and approved by the admin. You can now proceed with your registration.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex gap-3 pt-4"
            >
              <Link href="/user/dashboard" className="flex-1">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full">
                  Home
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="border-slate-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white flex-shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <p className="font-medium text-slate-900">Payment Verified</p>
                <p className="text-sm text-slate-600">Your UPI payment has been confirmed</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-xs font-bold text-white flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium text-slate-900">Registration Processing</p>
                <p className="text-sm text-slate-600">Your registration is now being processed</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-xs font-bold text-white flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium text-slate-900">Confirmation Email</p>
                <p className="text-sm text-slate-600">Check your email for further instructions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-lg">
          Loading...
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
