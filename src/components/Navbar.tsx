import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../lib/auth-context.tsx';
import { useRouter } from '../lib/router.tsx';

export function Navbar() {
  const { route, navigate } = useRouter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCheckPage = route.page === 'check';
  const isResultsOrReview = route.page === 'results' || route.page === 'review';
  const isSignedIn = Boolean(user && !user.isAnonymous);

  const handleNav = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNav('/');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] rounded-sm"
        >
          ExamReady A1
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/');
            }}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 hover:underline underline-offset-4 ${
              route.page === 'landing' ? 'text-slate-900 underline' : ''
            }`}
          >
            Overview
          </a>
          <a
            href="/check"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/check');
            }}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 hover:underline underline-offset-4 ${
              route.page === 'check' ? 'text-slate-900 underline' : ''
            }`}
          >
            Readiness Check
          </a>
          <a
            href="/about"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/about');
            }}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 hover:underline underline-offset-4 ${
              route.page === 'about' ? 'text-slate-900 underline' : ''
            }`}
          >
            Scoring Method
          </a>
          <a
            href={isSignedIn ? '/account' : '/login'}
            onClick={(e) => {
              e.preventDefault();
              handleNav(isSignedIn ? '/account' : '/login');
            }}
            className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-slate-900 hover:underline underline-offset-4 ${
              route.page === 'login' ||
              route.page === 'signup' ||
              route.page === 'account'
                ? 'text-slate-900 underline'
                : ''
            }`}
          >
            {isSignedIn ? 'Account' : 'Sign In'}
          </a>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          {!isCheckPage && (
            <button
              type="button"
              onClick={() => handleNav('/check?fresh=1')}
              className="px-4 py-2 min-h-[40px] text-xs sm:text-sm font-semibold text-white bg-[#1D4ED8] rounded-lg hover:bg-[#1E40AF] active:scale-[0.98] transition-all whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 cursor-pointer"
            >
              {isResultsOrReview ? 'Retake Check' : 'Start Check'}
            </button>
          )}
          {isCheckPage && (
            <button
              type="button"
              onClick={() => handleNav('/')}
              className="px-3.5 py-2 min-h-[40px] text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] cursor-pointer"
            >
              Exit Check
            </button>
          )}

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/');
            }}
            className="block px-3 py-2.5 min-h-[44px] text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50"
          >
            Overview
          </a>
          <a
            href="/check"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/check');
            }}
            className="block px-3 py-2.5 min-h-[44px] text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50"
          >
            Readiness Check
          </a>
          <a
            href="/about"
            onClick={(e) => {
              e.preventDefault();
              handleNav('/about');
            }}
            className="block px-3 py-2.5 min-h-[44px] text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50"
          >
            Scoring Method
          </a>
          {isSignedIn ? (
            <a
              href="/account"
              onClick={(e) => {
                e.preventDefault();
                handleNav('/account');
              }}
              className="block px-3 py-2.5 min-h-[44px] text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50"
            >
              Account ({user?.name})
            </a>
          ) : (
            <>
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('/login');
                }}
                className="block px-3 py-2.5 min-h-[44px] text-sm font-medium text-slate-800 rounded-lg hover:bg-slate-50"
              >
                Sign In
              </a>
              <a
                href="/signup"
                onClick={(e) => {
                  e.preventDefault();
                  handleNav('/signup');
                }}
                className="block px-3 py-2.5 min-h-[44px] text-sm font-medium text-[#1D4ED8] rounded-lg hover:bg-blue-50"
              >
                Create Account
              </a>
            </>
          )}
        </div>
      )}
    </header>
  );
}
