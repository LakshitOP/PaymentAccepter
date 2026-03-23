'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { auth, firebaseConfigError, isFirebaseConfigured } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
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

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (user) {
        router.push('/user/dashboard');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <SiteNavbar />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        {!isFirebaseConfigured && (
          <Alert variant="warning">{firebaseConfigError}</Alert>
        )}

        {/* Hero Section */}
        <section className="space-y-8">
          <div className="space-y-6 text-center">
            <Badge className="mx-auto bg-blue-100 text-blue-700 hover:bg-blue-100">
              🎮 UNO No Mercy Payment Hub
            </Badge>
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900">
                Simple payment,<br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  instant play
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
                The cleanest way for UNO players to enter the game. One Google login, one UPI payment, done.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/user/login" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
                >
                  Play as Player
                </Button>
              </Link>
              <Link href="/admin/login" className="w-full sm:w-auto">
                <Button 
                  variant="outline"
                  size="lg" 
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Admin Panel
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto w-full">
            {[
              { value: '₹20', label: 'Per game' },
              { value: 'Google', label: 'Fast login' },
              { value: 'UPI', label: 'Instant pay' },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-2xl bg-white border border-slate-200 p-4 text-center shadow-sm hover:shadow-md transition-all">
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Cards */}
        <section className="grid md:grid-cols-2 gap-6 lg:gap-8">
          <Card className="border-slate-200 shadow-card hover:shadow-card-hover transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div>
                <CardTitle className="text-xl">For Players</CardTitle>
              </div>
              <CardDescription>Fast, frictionless payment flow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="text-blue-600 font-bold text-sm">1</div>
                  <p className="text-sm text-slate-600">Sign in with Google in seconds</p>
                </div>
                <div className="flex gap-3">
                  <div className="text-blue-600 font-bold text-sm">2</div>
                  <p className="text-sm text-slate-600">Scan UPI QR code to pay ₹20</p>
                </div>
                <div className="flex gap-3">
                  <div className="text-blue-600 font-bold text-sm">3</div>
                  <p className="text-sm text-slate-600">Confirm payment and enter game</p>
                </div>
              </div>
              <Link href="/user/login" className="block pt-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Join as Player
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-card hover:shadow-card-hover transition-all">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <span className="text-lg">⚙️</span>
                </div>
                <CardTitle className="text-xl">For Admins</CardTitle>
              </div>
              <CardDescription>Manage transactions with ease</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="text-cyan-600 font-bold text-sm">1</div>
                  <p className="text-sm text-slate-600">View pending payment requests</p>
                </div>
                <div className="flex gap-3">
                  <div className="text-cyan-600 font-bold text-sm">2</div>
                  <p className="text-sm text-slate-600">Verify UPI receipts quickly</p>
                </div>
                <div className="flex gap-3">
                  <div className="text-cyan-600 font-bold text-sm">3</div>
                  <p className="text-sm text-slate-600">Approve or reject with one click</p>
                </div>
              </div>
              <Link href="/admin/login" className="block pt-2">
                <Button variant="outline" className="w-full">
                  Admin Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* How Admin Login Works */}
        <section className="space-y-6 bg-slate-900 rounded-3xl p-8 lg:p-12 text-white">
          <div>
            <h2 className="text-3xl font-bold mb-2">Admin Setup Guide</h2>
            <p className="text-slate-300">Follow these steps to set up your admin account</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">1</div>
              <h3 className="font-semibold text-lg">Create Admin in Firestore</h3>
              <p className="text-slate-300 text-sm">Go to Firebase Console → Firestore → Create collection "admins" → Add document with your email as ID</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">2</div>
              <h3 className="font-semibold text-lg">Set Admin Password</h3>
              <p className="text-slate-300 text-sm">Go to Firebase Auth → Create a new user with your admin email and set a strong password</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">3</div>
              <h3 className="font-semibold text-lg">Login to Admin Panel</h3>
              <p className="text-slate-300 text-sm">Use your email and password on the Admin Login page to access the transaction dashboard</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-700">
            <p className="text-slate-300 text-sm">💡 <strong>Tip:</strong> The admin email must exist in BOTH Firebase Authentication and the "admins" Firestore collection for login to work.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
