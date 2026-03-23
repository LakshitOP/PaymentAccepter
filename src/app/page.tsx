'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user: any) => {
      if (user) {
        router.push('/user/dashboard');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-3xl border border-white/70 bg-white/80 px-6 py-4 text-sm font-medium text-slate-600 shadow-lg backdrop-blur">
          Loading experience...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteNavbar />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        {!isFirebaseConfigured && (
          <Alert variant="warning">{firebaseConfigError}</Alert>
        )}

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <Badge variant="default" className="bg-emerald-500 text-slate-950">
              Modern payment flow for UNO No Mercy
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Collect player payments with a cleaner, faster fintech-style flow.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                A polished access portal for players and admins with Google login,
                secure payment checkout, and instant verification tracking.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/user/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Start as Player
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Open Admin Panel
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                ['20 Rs', 'Flat payment'],
                ['Google', 'Instant sign-in'],
                ['Razorpay', 'Secure checkout'],
              ].map(([value, label]) => (
                <Card key={label} className="border-slate-200/80 bg-white/70">
                  <CardContent className="p-5">
                    <p className="text-2xl font-semibold text-slate-950">{value}</p>
                    <p className="mt-1 text-sm text-slate-500">{label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card className="overflow-hidden border-slate-200/80 bg-slate-950 text-white">
            <CardContent className="p-0">
              <div className="border-b border-white/10 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">
                      Live Preview
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold">Smart access hub</h2>
                  </div>
                  <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-slate-200">
                    Online
                  </div>
                </div>
              </div>
              <div className="space-y-5 p-6">
                <div className="rounded-2xl bg-white/5 p-5">
                  <p className="text-sm text-slate-300">Player journey</p>
                  <p className="mt-2 text-lg font-medium">Login, pay, play.</p>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Minimal friction for users joining the match.
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-400/10 p-5 ring-1 ring-emerald-300/20">
                  <p className="text-sm text-emerald-200">Admin journey</p>
                  <p className="mt-2 text-lg font-medium text-white">
                    Review transactions in one place.
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">
                    Built for quick approvals and cleaner visibility.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Status</p>
                    <p className="mt-2 text-xl font-semibold">Secure</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-sm text-slate-400">Platform</p>
                    <p className="mt-2 text-xl font-semibold">Responsive</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card className="border-slate-200/80">
            <CardHeader>
              <CardTitle>Player Access</CardTitle>
              <CardDescription>
                Clean login and payment flow for fast entry into the game.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-lg font-semibold text-emerald-700">
                P
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-slate-950">Fast onboarding</p>
                <p className="text-sm leading-6 text-slate-500">
                  Sign in with Google, pay the fixed amount, and move into the
                  play flow without extra steps.
                </p>
              </div>
              <Link href="/user/login">
                <Button variant="secondary" className="w-full">
                  Continue as Player
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80">
            <CardHeader>
              <CardTitle>Admin Workspace</CardTitle>
              <CardDescription>
                Review pending transactions and manage approvals confidently.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-lg font-semibold text-cyan-700">
                A
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-slate-950">Clear oversight</p>
                <p className="text-sm leading-6 text-slate-500">
                  Filter transactions, verify payments, and keep the back-office
                  flow simple on desktop and mobile.
                </p>
              </div>
              <Link href="/admin/login">
                <Button variant="outline" className="w-full">
                  Continue as Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
