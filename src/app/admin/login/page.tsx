'use client';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db, firebaseConfigError, isFirebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { Alert } from '@/components/ui/alert';
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

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!auth || !db) {
      setError(firebaseConfigError);
      return;
    }

    const firebaseAuth = auth;
    const firestore = db;

    setLoading(true);
    setError('');

    try {
      const adminDoc = await getDoc(doc(firestore, 'admins', email));
      if (!adminDoc.exists()) {
        setError('Access denied. This email is not registered as an admin.');
        setLoading(false);
        return;
      }

      await signInWithEmailAndPassword(firebaseAuth, email, password);
      router.push('/admin/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('Admin account not found. Please check setup guide.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else {
        setError(err.message || 'Failed to login');
      }
      console.error('Login error:', err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SiteNavbar />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        {!isFirebaseConfigured && (
          <Alert variant="warning">{firebaseConfigError}</Alert>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Login Form */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-card">
              <CardHeader className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center">
                    <span className="text-2xl">⚙️</span>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-900">Admin Login</CardTitle>
                  <CardDescription className="mt-2">
                    Access the transaction management panel
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">
                      Admin Email
                    </label>
                    <Input
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">
                      Password
                    </label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 text-white hover:from-cyan-700 hover:to-cyan-800 shadow-md hover:shadow-lg transition-all h-11 font-semibold"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Logging in...
                      </span>
                    ) : (
                      'Login to Dashboard'
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <p className="text-sm text-slate-600">
                    Please set up both a Firestore document and Firebase Auth user with the same email.
                  </p>
                </div>

                <div className="text-sm text-center text-slate-500 p-4 bg-slate-50 rounded-lg">
                  Back to <Link href="/" className="text-blue-600 hover:underline font-medium">home</Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Setup Guide */}
          <div className="space-y-4">
            <div className="sticky top-20">
              <Card className="border-slate-200 shadow-card bg-gradient-to-br from-slate-50 to-white">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">Setup Instructions</CardTitle>
                  <CardDescription>Complete these steps to enable admin access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="space-y-3 pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                          1
                        </div>
                        <h3 className="font-semibold text-slate-900">Create Firestore Collection</h3>
                      </div>
                      <div className="ml-11 space-y-2 text-sm text-slate-600">
                        <p>Go to <strong>Firebase Console</strong> → <strong>Firestore</strong></p>
                        <p>Create a new collection named <code className="bg-slate-200 px-2 py-1 rounded">"admins"</code></p>
                        <p>Click <strong>Add document</strong></p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="space-y-3 pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                          2
                        </div>
                        <h3 className="font-semibold text-slate-900">Set Document ID to Email</h3>
                      </div>
                      <div className="ml-11 space-y-2 text-sm text-slate-600">
                        <p>In <strong>Document ID</strong>, paste your admin email</p>
                        <p className="text-xs text-slate-500">Example: <code className="bg-slate-200 px-2 py-1 rounded">admin@yourcompany.com</code></p>
                        <p>Click <strong>Auto ID</strong> to generate it automatically if you prefer</p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="space-y-3 pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                          3
                        </div>
                        <h3 className="font-semibold text-slate-900">Add Any Field</h3>
                      </div>
                      <div className="ml-11 space-y-2 text-sm text-slate-600">
                        <p>Add a field like <code className="bg-slate-200 px-2 py-1 rounded">role</code> with value <code className="bg-slate-200 px-2 py-1 rounded">"admin"</code></p>
                        <p>Click <strong>Save</strong></p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="space-y-3 pb-4 border-b border-slate-200 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                          4
                        </div>
                        <h3 className="font-semibold text-slate-900">Create Firebase Auth User</h3>
                      </div>
                      <div className="ml-11 space-y-2 text-sm text-slate-600">
                        <p>Go to <strong>Firebase Console</strong> → <strong>Authentication</strong></p>
                        <p>Click <strong>Create user</strong></p>
                        <p>Enter the <strong>same email</strong> and set a <strong>strong password</strong></p>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 font-semibold text-sm">
                          ✓
                        </div>
                        <h3 className="font-semibold text-slate-900">Login Here</h3>
                      </div>
                      <div className="ml-11 space-y-2 text-sm text-slate-600">
                        <p>Use your email and password above</p>
                        <p className="text-xs bg-green-50 border border-green-200 p-2 rounded text-green-700">
                          💡 Email must exist in BOTH Firestore admins collection AND Firebase Authentication
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
                    <p className="font-semibold text-sm text-yellow-900">⚠️ Important</p>
                    <p className="text-xs text-yellow-700">
                      If you get "Access denied. This email is not registered as an admin", make sure:
                    </p>
                    <ul className="text-xs text-yellow-700 list-disc pl-4 space-y-1">
                      <li>The email exists in the <code className="bg-white px-1">"admins"</code> Firestore collection</li>
                      <li>The email exists in Firebase Authentication</li>
                      <li>Both use the exact same email address</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
