'use client';

import { useEffect, useState } from 'react';
import { auth, db, firebaseConfigError } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    );
  }

  const pendingCount = transactions.filter((transaction) => transaction.status === 'pending').length;
  const verifiedCount = transactions.filter((transaction) => transaction.status === 'verified').length;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="mt-1 text-gray-600">Payment Verification</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-4 py-2 font-bold text-white transition-colors hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-600">Pending</p>
            <p className="text-3xl font-bold text-blue-900">{pendingCount}</p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-600">Verified</p>
            <p className="text-3xl font-bold text-green-900">{verifiedCount}</p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <p className="text-sm font-semibold text-purple-600">Total</p>
            <p className="text-3xl font-bold text-purple-900">{transactions.length}</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {(['all', 'pending', 'verified', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-4 py-2 font-semibold transition-colors ${
                filter === tab
                  ? 'bg-purple-500 text-white'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No {filter === 'all' ? 'transactions' : `${filter} transactions`} found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {transaction.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {transaction.email}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">
                        Rs {transaction.amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(
                          transaction.timestamp?.toDate?.() || transaction.timestamp
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            transaction.status === 'verified'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {transaction.status === 'pending' ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerify(transaction.id, 'verified')}
                              disabled={verifying === transaction.id}
                              className="rounded bg-green-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-green-600 disabled:bg-gray-400"
                            >
                              {verifying === transaction.id ? 'Processing...' : 'Verify'}
                            </button>
                            <button
                              onClick={() => handleVerify(transaction.id, 'rejected')}
                              disabled={verifying === transaction.id}
                              className="rounded bg-red-500 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-red-600 disabled:bg-gray-400"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
