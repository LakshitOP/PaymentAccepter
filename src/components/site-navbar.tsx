import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
            UN
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-500">
              UNO Pay
            </p>
            <p className="text-sm text-slate-500">Fast access for players and admins</p>
          </div>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/user/login">
            <Button variant="ghost" size="sm">Player Login</Button>
          </Link>
          <Link href="/admin/login">
            <Button variant="outline" size="sm">Admin Panel</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
