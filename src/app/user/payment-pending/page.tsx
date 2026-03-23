'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { auth, db, firebaseConfigError, isFirebaseConfigured } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteNavbar } from '@/components/site-navbar';

export const dynamic = 'force-dynamic';

function PaymentPendingContent() {
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

    const unsubscribe = firebaseAuth.onAuthStateChanged(async (currentUser: any) => {
      if (!currentUser) {
        router.push('/user/login');
        return;
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, paymentId]);

  // Listen for payment status changes
  useEffect(() => {
    if (!db || !paymentId) return;

    const unsubscribe = onSnapshot(doc(db, 'payments', paymentId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPayment(data);

        // Auto-redirect on approval
        if (data.status === 'approved') {
          router.push(`/user/payment-success?id=${paymentId}`);
        }
      }
    });

    return () => unsubscribe();
  }, [db, paymentId, router]);

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
          Loading payment status...
        </div>
      </div>
    );
  }

  const statusColors: { [key: string]: string } = {
    pending: 'bg-amber-50 border-amber-200',
    approved: 'bg-green-50 border-green-200',
    rejected: 'bg-red-50 border-red-200',
  };

  const statusBadgeVariants: { [key: string]: 'warning' | 'success' | 'danger' } = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SiteNavbar />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Payment Verification</h1>
            <p className="text-slate-600 mt-1">Your payment is being reviewed by admin</p>
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

        {/* Main Status Card */}
        <Card className={`border-2 shadow-lg ${statusColors[payment?.status || 'pending']}`}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Payment Submitted</CardTitle>
                <CardDescription className="mt-1">
                  {payment?.status === 'pending' && 'Waiting for admin verification...'}
                  {payment?.status === 'approved' && 'Your payment has been approved!'}
                  {payment?.status === 'rejected' && 'Your payment was rejected.'}
                </CardDescription>
              </div>
              <Badge variant={statusBadgeVariants[payment?.status || 'pending']} className="text-lg px-4 py-2">
                {payment?.status?.toUpperCase() || 'PENDING'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">Payment Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-white/50 p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">₹{payment?.amount || 0}</p>
                </div>
                <div className="rounded-lg bg-white/50 p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment ID</p>
                  <p className="text-sm font-mono text-slate-900 mt-1 truncate">{paymentId}</p>
                </div>
                <div className="rounded-lg bg-white/50 p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Submitted At</p>
                  <p className="text-sm text-slate-900 mt-1">
                    {payment?.createdAt
                      ? new Date(payment.createdAt.seconds * 1000).toLocaleString()
                      : 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg bg-white/50 p-4 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</p>
                  <p className="text-sm text-slate-900 mt-1">{payment?.email}</p>
                </div>
              </div>
            </div>

            {/* Status Messages */}
            {payment?.status === 'pending' && (
              <div className="rounded-lg bg-amber-100/50 border border-amber-300 p-4 space-y-2">
                <p className="font-semibold text-amber-900">⏳ Payment Under Review</p>
                <p className="text-sm text-amber-800">
                  The admin team is reviewing your payment. This usually takes a few minutes.
                  You'll be notified once it's been verified.
                </p>
                <p className="text-xs text-amber-700 mt-3">
                  💡 Keep this page open or check back later for updates.
                </p>
              </div>
            )}

            {payment?.status === 'approved' && (
              <div className="rounded-lg bg-green-100/50 border border-green-300 p-4 space-y-2">
                <p className="font-semibold text-green-900">✓ Payment Approved</p>
                <p className="text-sm text-green-800">
                  Congratulations! Your payment has been successfully verified. You're all set!
                </p>
              </div>
            )}

            {payment?.status === 'rejected' && (
              <div className="rounded-lg bg-red-100/50 border border-red-300 p-4 space-y-3">
                <p className="font-semibold text-red-900">✗ Payment Rejected</p>
                <p className="text-sm text-red-800">
                  Your payment was rejected by the admin.
                  {payment?.notes && ` Reason: ${payment.notes}`}
                </p>
                <Button
                  onClick={() => router.push('/user/dashboard')}
                  className="mt-3 bg-red-600 hover:bg-red-700"
                  size="sm"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => router.push('/user/dashboard')}
                className="flex-1"
              >
                Go Back
              </Button>
              {payment?.status !== 'approved' && (
                <Button
                  onClick={() => location.reload()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Refresh Status
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">What Happens Next?</h3>
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white flex-shrink-0">
                1
              </div>
              <p className="text-sm text-slate-700">Admin reviews your payment</p>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white flex-shrink-0">
                2
              </div>
              <p className="text-sm text-slate-700">Payment status is updated</p>
            </div>
            <div className="flex gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white flex-shrink-0">
                3
              </div>
              <p className="text-sm text-slate-700">You're redirected to success page</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-600 shadow-lg">
          Loading...
        </div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  );
}
