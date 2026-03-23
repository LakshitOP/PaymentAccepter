'use client';

import { useEffect, useState } from 'react';
import { auth, db, firebaseConfigError, isFirebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SiteNavbar } from '@/components/site-navbar';

export const dynamic = 'force-dynamic';

interface Payment {
  id: string;
  email: string;
  name: string;
  amount: number;
  createdAt: any;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
}

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
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

      // Subscribe to user's payments
      const paymentsQuery = query(
        collection(firestore, 'payments'),
        where('email', '==', currentUser.email)
      );

      const unsubscribePayments = onSnapshot(paymentsQuery, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Payment[];

        data.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const timeB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return timeB.getTime() - timeA.getTime();
        });

        setPayments(data);
        setLoading(false);
      });

      return () => unsubscribePayments();
    });

    return () => unsubscribe();
  }, [router]);

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
          Loading your payment history...
        </div>
      </div>
    );
  }

  const stats = {
    total: payments.length,
    approved: payments.filter(p => p.status === 'approved').length,
    pending: payments.filter(p => p.status === 'pending').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SiteNavbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Payment History</h1>
            <p className="text-slate-600 mt-1">View all your submitted payments</p>
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

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="border-slate-200 shadow-card">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600">Total Payments</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 shadow-card bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-3xl font-bold text-green-700 mt-2">{stats.approved}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200 shadow-card bg-amber-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-amber-600">Pending</p>
                <p className="text-3xl font-bold text-amber-700 mt-2">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-200 shadow-card bg-red-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm font-medium text-red-600">Rejected</p>
                <p className="text-3xl font-bold text-red-700 mt-2">{stats.rejected}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className="border-slate-200 shadow-card">
          <CardHeader>
            <CardTitle>All Payments</CardTitle>
            <CardDescription>Manage and track your payment submissions</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-3 text-left font-semibold text-slate-900">Amount</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-900">Submitted</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-900">Notes</th>
                      <th className="px-6 py-3 text-right font-semibold text-slate-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-6 py-5 font-semibold text-slate-900">₹{payment.amount}</td>
                        <td className="px-6 py-5 text-slate-600 text-xs">
                          {payment.createdAt?.toDate?.().toLocaleDateString()} at{' '}
                          {payment.createdAt?.toDate?.().toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-5">
                          <Badge
                            variant={
                              payment.status === 'approved'
                                ? 'success'
                                : payment.status === 'rejected'
                                  ? 'danger'
                                  : 'warning'
                            }
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-slate-600 text-sm max-w-xs truncate">
                          {payment.notes || '—'}
                        </td>
                        <td className="px-6 py-5 text-right">
                          {payment.status === 'pending' && (
                            <Link href={`/user/payment-pending?id=${payment.id}`}>
                              <Button size="sm" variant="secondary" className="rounded-xl">
                                View
                              </Button>
                            </Link>
                          )}
                          {payment.status === 'approved' && (
                            <Link href={`/user/payment-success?id=${payment.id}`}>
                              <Button size="sm" className="rounded-xl bg-green-600 hover:bg-green-700">
                                View
                              </Button>
                            </Link>
                          )}
                          {payment.status === 'rejected' && (
                            <Link href="/user/dashboard">
                              <Button size="sm" variant="destructive" className="rounded-xl">
                                Retry
                              </Button>
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600 mb-4">No payment history yet</p>
                <Link href="/user/dashboard">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Make Your First Payment
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Link href="/user/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
