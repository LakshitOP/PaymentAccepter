'use client';

import { useEffect, useState } from 'react';
import { auth, db, firebaseConfigError, isFirebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import SuccessAnimation from '@/components/SuccessAnimation';
import Script from 'next/script';
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

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

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

      const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
      setUser({
        ...currentUser.toJSON(),
        ...userDoc.data(),
        uid: currentUser.uid,
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handlePayment = async () => {
    if (!user) return;
    if (!window.Razorpay) {
      setError('Payment gateway is still loading. Please try again in a moment.');
      return;
    }

    setPaymentLoading(true);
    setError('');

    try {
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          name: user.displayName,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderResponse.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'UNO No Mercy',
        description: 'Payment for playing UNO No Mercy',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              setShowSuccess(true);
            } else {
              setError('Payment verification failed');
            }
          } catch (err: any) {
            setError(err.message);
          }
          setPaymentLoading(false);
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      setError(err.message);
      setPaymentLoading(false);
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
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <section className="flex flex-col gap-6 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_-32px_rgba(15,23,42,0.35)] backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <div className="space-y-4">
              <Badge variant="default" className="bg-emerald-500 text-slate-950">
                Player Dashboard
              </Badge>
              <div className="flex items-center gap-4">
                {user?.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="h-14 w-14 rounded-2xl object-cover ring-4 ring-white"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                    {user?.displayName || 'Player'}
                  </h1>
                  <p className="text-sm text-slate-500">{user?.email}</p>
                </div>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-600">
                Complete the payment below to unlock your play session with a clean,
                secure checkout experience.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.24em] text-emerald-600">
                  Amount
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">Rs 20</p>
              </div>
              <Button variant="outline" className="rounded-2xl" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </section>

          {error && <Alert variant="danger">{error}</Alert>}

          {!isFirebaseConfigured && (
            <Alert variant="warning">{firebaseConfigError}</Alert>
          )}

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="border-slate-200/80">
              <CardHeader className="space-y-3">
                <Badge variant="muted" className="w-fit">
                  Payment Form
                </Badge>
                <CardTitle className="text-2xl">Complete your payment</CardTitle>
                <CardDescription>
                  Choose the quick Razorpay checkout or use the UPI details on the
                  right for direct payment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    ['Flat fee', 'Rs 20'],
                    ['Gateway', 'Razorpay'],
                    ['Status', 'Secure'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-sm text-slate-500">{label}</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
                        Checkout
                      </p>
                      <h3 className="mt-2 text-3xl font-semibold">Pay Rs 20</h3>
                      <p className="mt-3 max-w-lg text-sm leading-7 text-slate-300">
                        Open the hosted checkout, complete payment, and get instant
                        confirmation once verification succeeds.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                      <p className="text-xs text-slate-300">Order total</p>
                      <p className="mt-1 text-2xl font-semibold">Rs 20</p>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={paymentLoading || !isFirebaseConfigured}
                    variant="secondary"
                    size="lg"
                    className="mt-6 w-full rounded-2xl"
                  >
                    {paymentLoading ? 'Processing payment...' : 'Launch Razorpay Checkout'}
                  </Button>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                    How it works
                  </h4>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {[
                      'Login with your account',
                      'Complete checkout securely',
                      'Get confirmation instantly',
                    ].map((item, index) => (
                      <div key={item} className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold text-emerald-500">Step {index + 1}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-slate-200/80">
                <CardHeader>
                  <CardTitle>UPI details</CardTitle>
                  <CardDescription>
                    Use the QR or UPI ID if you want to pay directly from a UPI app.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="flex min-h-[280px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50">
                    <div className="space-y-2 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-semibold text-emerald-700">
                        QR
                      </div>
                      <p className="font-medium text-slate-700">UPI QR Code</p>
                      <p className="max-w-xs text-sm leading-6 text-slate-500">
                        Upload your QR image to Firebase Storage for a production-ready
                        payment card.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      UPI ID
                    </p>
                    <p className="mt-2 break-all font-mono text-lg font-semibold text-slate-950">
                      your-upi@paytm
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200/80">
                <CardContent className="p-6">
                  <p className="text-sm leading-7 text-slate-600">
                    Payments are processed through Razorpay and the app keeps the
                    same checkout and verification logic intact.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        {showSuccess && <SuccessAnimation onClose={() => setShowSuccess(false)} />}
      </main>
    </>
  );
}
