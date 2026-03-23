'use client';

import { useEffect, useState } from 'react';
import { auth, db, firebaseConfigError } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
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
import { SiteNavbar } from '@/components/site-navbar';

export const dynamic = 'force-dynamic';

interface Payment {
  id: string;
  userId: string;
  email: string;
  name: string;
  amount: number;
  createdAt: any;
  status: 'pending' | 'approved' | 'rejected';
  notes: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [reason, setReason] = useState<string>('');
  const [globalAmount, setGlobalAmount] = useState<number>(20);
  const [amountUpdating, setAmountUpdating] = useState(false);

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
        router.push('/admin/login');
        return;
      }

      // Check if user is admin
      const adminDoc = await getDoc(doc(firestore, 'admins', currentUser.email || ''));
      if (!adminDoc.exists()) {
        setError('Access denied. Admin privileges required.');
        await signOut(firebaseAuth);
        router.push('/admin/login');
        return;
      }

      // Subscribe to payment updates
      const configDoc = await getDoc(doc(firestore, 'config', 'payment'));
      const savedAmount = configDoc.data()?.amount;
      if (typeof savedAmount === 'number' && Number.isFinite(savedAmount)) {
        setGlobalAmount(savedAmount);
      }

      let paymentsQuery;
      if (filter === 'all') {
        paymentsQuery = query(collection(firestore, 'payments'));
      } else {
        paymentsQuery = query(
          collection(firestore, 'payments'),
          where('status', '==', filter)
        );
      }

      const unsubscribePayments = onSnapshot(paymentsQuery, (snapshot) => {
        const data = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Payment
        );

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
  }, [filter, router]);

  const handleUpdateStatus = async (paymentId: string, newStatus: 'approved' | 'rejected', rejectionReason?: string) => {
    setUpdating(paymentId);
    try {
      const idToken = await auth?.currentUser?.getIdToken();
      if (!idToken) {
        setError('Not authenticated');
        setUpdating(null);
        return;
      }

      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          paymentId,
          status: newStatus,
          notes: rejectionReason || reason,
        }),
      });

      // Handle response
      const contentType = response.headers.get('content-type');
      let data;
      
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Server error (${response.status}): ${text.substring(0, 100)}`);
      }

      data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status})`);
      }

      setReason('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to update payment status');
      console.error('Update status error:', err);
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateGlobalAmount = async () => {
    setAmountUpdating(true);
    try {
      if (!db) {
        throw new Error(firebaseConfigError);
      }
      if (!Number.isFinite(globalAmount) || globalAmount <= 0) {
        throw new Error('Please enter a valid payment amount.');
      }

      await setDoc(doc(db, 'config', 'payment'), {
        amount: globalAmount,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to update payment amount');
    } finally {
      setAmountUpdating(false);
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
          Loading admin dashboard...
        </div>
      </div>
    );
  }

  const statusCounts = {
    all: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    approved: payments.filter(p => p.status === 'approved').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SiteNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage and verify payments</p>
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

        {/* Settings Card */}
        <Card className="mb-6 border-slate-200 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Global Settings</CardTitle>
            <CardDescription>Manage payment amount and other settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Payment Amount (₹)</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={globalAmount}
                    onChange={(e) => setGlobalAmount(Number(e.target.value))}
                    disabled={amountUpdating}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleUpdateGlobalAmount}
                    disabled={amountUpdating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {amountUpdating ? 'Updating...' : 'Update'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {['all', 'pending', 'approved', 'rejected'].map((status) => (
            <Card key={status} className="border-slate-200 shadow-card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setFilter(status as any)}>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600 capitalize">{status}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">{statusCounts[status as keyof typeof statusCounts]}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'pending', 'approved', 'rejected'].map((s) => (
            <Button
              key={s}
              variant={filter === s ? 'default' : 'outline'}
              onClick={() => setFilter(s as any)}
              className={filter === s ? 'bg-blue-600' : ''}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        {/* Payments Table */}
        <Card className="border-slate-200 shadow-card">
          <CardHeader>
            <CardTitle>Payments ({payments.length})</CardTitle>
            <CardDescription>
              {filter === 'all' && 'All payments'}
              {filter === 'pending' && 'Pending verification'}
              {filter === 'approved' && 'Approved payments'}
              {filter === 'rejected' && 'Rejected payments'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-3 text-left font-semibold text-slate-900">Name</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-900">Email</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-900">Amount</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-900">Date</th>
                      <th className="px-6 py-3 text-left font-semibold text-slate-900">Status</th>
                      <th className="px-6 py-3 text-right font-semibold text-slate-900">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="px-6 py-5 font-medium text-slate-900">{payment.name}</td>
                        <td className="px-6 py-5 text-slate-600 text-xs">{payment.email}</td>
                        <td className="px-6 py-5 font-semibold text-slate-900">₹{payment.amount}</td>
                        <td className="px-6 py-5 text-slate-600 text-xs">
                          {payment.createdAt?.toDate?.().toLocaleDateString()}
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
                        <td className="px-6 py-5 text-right">
                          {payment.status === 'pending' && (
                            <div className="flex flex-wrap gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="secondary"
                                disabled={updating === payment.id}
                                onClick={() => handleUpdateStatus(payment.id, 'approved')}
                                className="rounded-xl"
                              >
                                {updating === payment.id ? 'Processing...' : 'Approve'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={updating === payment.id}
                                onClick={() => handleUpdateStatus(payment.id, 'rejected', `Payment rejected - ${reason || 'Invalid UPI'}`)}
                                className="rounded-xl"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                          {payment.status !== 'pending' && (
                            <span className="text-xs text-slate-400">No action</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600">No payments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
