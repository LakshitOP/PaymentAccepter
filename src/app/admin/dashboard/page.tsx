'use client';

import { useEffect, useState } from 'react';
import { auth, db, firebaseConfigError } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
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

interface Transaction {
  id: string;
  userId: string;
  name: string;
  email: string;
  amount: number;
  timestamp: any;
  status: 'pending' | 'verified' | 'rejected';
}

export default function AdminDashboard() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>(
    'pending'
  );

  useEffect(() => {
    if (!auth) {
      setError(firebaseConfigError);
      setLoading(false);
      return;
    }

    const firebaseAuth = auth;

    const unsubscribe = firebaseAuth.onAuthStateChanged(async (currentUser: any) => {
      if (!currentUser) {
        router.push('/admin/login');
        return;
      }

      await fetchTransactions(filter);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter, router]);

  const fetchTransactions = async (statusFilter: typeof filter) => {
    try {
      setError('');

      if (!db) {
        setError(firebaseConfigError);
        return;
      }

      const firestore = db;

      let transactionsQuery;

      if (statusFilter === 'all') {
        transactionsQuery = query(collection(firestore, 'transactions'));
      } else {
        transactionsQuery = query(
          collection(firestore, 'transactions'),
          where('status', '==', statusFilter)
        );
      }

      const querySnapshot = await getDocs(transactionsQuery);
      const data = querySnapshot.docs.map(
        (snapshot) =>
          ({
            id: snapshot.id,
            ...snapshot.data(),
          }) as Transaction
      );

      data.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
        const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
        return timeB.getTime() - timeA.getTime();
      });

      setTransactions(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVerify = async (
    transactionId: string,
    newStatus: 'verified' | 'rejected'
  ) => {
    setVerifying(transactionId);
    try {
      const idToken = await auth?.currentUser?.getIdToken();
      if (!idToken) {
        setError('Not authenticated');
        setVerifying(null);
        return;
      }

      const response = await fetch('/api/transactions/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          transactionId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        setTransactions((prev) =>
          prev.map((transaction) =>
            transaction.id === transactionId
              ? { ...transaction, status: newStatus }
              : transaction
          )
        );
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to verify transaction');
      }
    } catch (err: any) {
      setError(err.message);
    }

    setVerifying(null);
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
          Loading admin workspace...
        </div>
      </div>
    );
  }

  const pendingCount = transactions.filter((transaction) => transaction.status === 'pending').length;
  const verifiedCount = transactions.filter((transaction) => transaction.status === 'verified').length;
  const rejectedCount = transactions.filter((transaction) => transaction.status === 'rejected').length;
  const totalAmount = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SiteNavbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Transaction Dashboard</h1>
            <p className="text-slate-600 mt-1">Review and verify all player payments</p>
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-slate-200 shadow-card hover:shadow-card-hover transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{pendingCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                  <span className="text-lg">⏳</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card hover:shadow-card-hover transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Verified</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{verifiedCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card hover:shadow-card-hover transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rejected</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{rejectedCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <span className="text-lg">✕</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card hover:shadow-card-hover transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">₹{totalAmount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-lg">💰</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Card */}
        <Card className="border-slate-200 shadow-card">
          <CardHeader className="border-b border-slate-200">
            <div className="space-y-4">
              <div>
                <CardTitle className="text-2xl text-slate-900">Transactions</CardTitle>
                <CardDescription className="mt-2">
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'verified', 'rejected'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                      filter === tab
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {transactions.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                <p className="text-slate-500 font-medium">No {filter === 'all' ? 'transactions' : `${filter} transactions`} found</p>
                <p className="text-sm text-slate-400 mt-1">Transactions will appear here when players complete payments</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Player</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-900">{transaction.name || 'N/A'}</p>
                            <p className="text-xs text-slate-500 mt-0.5">ID: {transaction.userId?.slice(0, 8)}...</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{transaction.email}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">₹{transaction.amount}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(
                            transaction.timestamp?.toDate?.() || transaction.timestamp
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`${
                              transaction.status === 'verified'
                                ? 'bg-green-100 text-green-700'
                                : transaction.status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {transaction.status === 'pending' ? (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleVerify(transaction.id, 'verified')}
                                disabled={verifying === transaction.id}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                              >
                                {verifying === transaction.id ? 'Processing...' : 'Approve'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleVerify(transaction.id, 'rejected')}
                                disabled={verifying === transaction.id}
                                className="text-xs"
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
