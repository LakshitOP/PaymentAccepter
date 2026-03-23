'use client';

import { useEffect, useState } from 'react';
import { auth, db, firebaseConfigError, isFirebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import SuccessAnimation from '@/components/SuccessAnimation';
import Script from 'next/script';

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white md:text-4xl">UNO No Mercy</h1>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white transition-colors hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-4">
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="h-16 w-16 rounded-full"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {user?.displayName || 'Player'}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-lg bg-white p-6 shadow-lg md:p-8">
            <h3 className="mb-6 text-2xl font-bold text-gray-800">Pay to Play</h3>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6">
                <div className="mb-4 flex h-48 w-48 items-center justify-center rounded-lg bg-gray-200">
                  <div className="text-center">
                    <p className="mb-2 font-semibold text-gray-600">UPI QR Code</p>
                    <p className="text-sm text-gray-500">
                      Upload your QR image to Firebase Storage
                    </p>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-600">
                  Scan this QR code to send Rs 20
                </p>
              </div>

              <div className="flex flex-col justify-center">
                <div className="mb-6">
                  <p className="mb-2 text-sm text-gray-600">Amount to Pay</p>
                  <p className="text-4xl font-bold text-green-600">Rs 20</p>
                </div>

                <div className="mb-6 rounded-lg bg-gray-100 p-4">
                  <p className="mb-2 text-sm text-gray-600">UPI ID</p>
                  <p className="break-all font-mono text-lg font-semibold text-gray-800">
                    your-upi@paytm
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    You can also use UPI apps directly
                  </p>
                </div>

                <button
                  onClick={handlePayment}
                  disabled={paymentLoading || !isFirebaseConfigured}
                  className="w-full rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 text-lg font-bold text-white transition-all hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500"
                >
                  {paymentLoading ? 'Processing...' : 'Pay Rs 20'}
                </button>

                <p className="mt-4 text-center text-xs text-gray-500">
                  Secure payment via Razorpay
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="mb-2 font-semibold text-blue-900">How it works:</h4>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>1. Click "Pay Rs 20" to initiate secure payment.</li>
                <li>2. Complete payment via Razorpay.</li>
                <li>3. Receive instant confirmation.</li>
                <li>4. Admin will verify and you can start playing.</li>
              </ul>
            </div>
          </div>
        </div>

        {showSuccess && <SuccessAnimation onClose={() => setShowSuccess(false)} />}
      </div>
    </>
  );
}
