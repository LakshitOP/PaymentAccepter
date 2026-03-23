import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/50 bg-white/90 backdrop-blur-lg shadow-sm">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-sm font-bold text-white shadow-md group-hover:shadow-lg transition-all">
            UN
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">UNO Gate</p>
            <p className="text-xs text-slate-500">Payment Hub</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/user/login">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-slate-700 hover:text-slate-900 hover:bg-slate-100"
            >
              Player Login
            </Button>
          </Link>
          <Link href="/admin/login">
            <Button 
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm"
            >
              Admin Panel
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
