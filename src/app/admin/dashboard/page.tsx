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

export const dynamic = 'force-dynamic';

interface Transaction {
  id: string;
  userId: string;
  name: string;
  email: string;
  amount: number;
  timestamp: any;
  status: 'pending' | 'verified' | 'rejected';
  razorpayPaymentId?: string;
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-3xl border border-white/70 bg-white/80 px-6 py-4 text-sm font-medium text-slate-600 shadow-lg backdrop-blur">
          Loading admin workspace...
        </div>
      </div>
    );
  }

  const pendingCount = transactions.filter((transaction) => transaction.status === 'pending').length;
  const verifiedCount = transactions.filter((transaction) => transaction.status === 'verified').length;

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <section className="flex flex-col gap-6 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_-32px_rgba(15,23,42,0.35)] backdrop-blur lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div className="space-y-4">
            <Badge variant="default" className="bg-cyan-300 text-slate-950">
              Admin Dashboard
            </Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Payment verification workspace
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                Review player transactions, filter by status, and approve or reject
                payments from a cleaner responsive table layout.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Pending</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{pendingCount}</p>
            </div>
            <Button variant="outline" className="rounded-2xl" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </section>

        {error && <Alert variant="danger">{error}</Alert>}

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['Pending', pendingCount.toString(), 'Awaiting action'],
            ['Verified', verifiedCount.toString(), 'Approved payments'],
            ['Total', transactions.length.toString(), 'Loaded records'],
          ].map(([label, value, hint]) => (
            <Card key={label} className="border-slate-200/80">
              <CardContent className="space-y-2 p-6">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-3xl font-semibold text-slate-950">{value}</p>
                <p className="text-sm text-slate-400">{hint}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-slate-200/80">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-2xl">Transactions</CardTitle>
                <CardDescription>
                  Filter and verify incoming payments without changing the underlying
                  approval logic.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'verified', 'rejected'] as const).map((tab) => (
                  <Button
                    key={tab}
                    variant={filter === tab ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilter(tab)}
                    className="rounded-xl capitalize"
                  >
                    {tab}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500">
                No {filter === 'all' ? 'transactions' : `${filter} transactions`} found.
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                      <tr className="text-left">
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Name
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Email
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Date
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Status
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-slate-50/80">
                          <td className="px-6 py-5">
                            <div>
                              <p className="font-medium text-slate-950">
                                {transaction.name || 'N/A'}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                User ID: {transaction.userId || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {transaction.email}
                          </td>
                          <td className="px-6 py-5 text-sm font-semibold text-slate-950">
                            Rs {transaction.amount}
                          </td>
                          <td className="px-6 py-5 text-sm text-slate-600">
                            {new Date(
                              transaction.timestamp?.toDate?.() || transaction.timestamp
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-5">
                            <Badge
                              variant={
                                transaction.status === 'verified'
                                  ? 'success'
                                  : transaction.status === 'rejected'
                                    ? 'danger'
                                    : 'warning'
                              }
                            >
                              {transaction.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-5">
                            {transaction.status === 'pending' ? (
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  disabled={verifying === transaction.id}
                                  onClick={() => handleVerify(transaction.id, 'verified')}
                                  className="rounded-xl"
                                >
                                  {verifying === transaction.id ? 'Processing...' : 'Verify'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={verifying === transaction.id}
                                  onClick={() => handleVerify(transaction.id, 'rejected')}
                                  className="rounded-xl"
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">No action needed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
