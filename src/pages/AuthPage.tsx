import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth-context.tsx';
import { useRouter } from '../lib/router.tsx';

export function AuthPage({ initialMode }: { initialMode: 'login' | 'signup' }) {
  const { navigate } = useRouter();
  const { user, attempts, signIn, signUp } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setError(null);
  }, [initialMode]);

  useEffect(() => {
    if (user && !user.isAnonymous) {
      navigate('/account');
    }
  }, [user, navigate]);

  const completedGuestCount = attempts.filter((a) => a.status === 'completed').length;

  const handleSwitchMode = (nextMode: 'login' | 'signup') => {
    setMode(nextMode);
    setError(null);
    navigate(nextMode === 'login' ? '/login' : '/signup');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (mode === 'login' && !password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signup') {
        await signUp({ name: name.trim(), email: email.trim(), password });
      } else {
        await signIn({ email: email.trim(), password });
      }
      navigate('/account');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Authentication failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500">
            ExamReady A1 · Learner Account
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {mode === 'signup' ? 'Create your free account' : 'Sign in to your account'}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {mode === 'signup'
              ? 'Save your German A1 readiness scores, track retakes over time, and review past explanations from any device.'
              : 'Access your saved German A1 readiness checks, skill trends, and answer reviews.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div
          className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            onClick={() => handleSwitchMode('login')}
            className={`py-2 min-h-[40px] text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            onClick={() => handleSwitchMode('signup')}
            className={`py-2 min-h-[40px] text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Guest Attempt Preservation Callout */}
        {completedGuestCount > 0 && (
          <div className="flex items-start gap-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              Your {completedGuestCount} completed guest{' '}
              {completedGuestCount === 1 ? 'check' : 'checks'} will be linked automatically to your account.
            </span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-900"
          >
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === 'signup' && (
            <div className="space-y-1.5">
              <label
                htmlFor="auth-name"
                className="block text-sm font-medium text-slate-800"
              >
                Full name
              </label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sara Müller"
                className="w-full px-3.5 py-2.5 min-h-[44px] text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8]"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label
              htmlFor="auth-email"
              className="block text-sm font-medium text-slate-800"
            >
              Email address
            </label>
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 min-h-[44px] text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="auth-password"
              className="block text-sm font-medium text-slate-800"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
                className="w-full px-3.5 py-2.5 pr-11 min-h-[44px] text-sm text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-[#1D4ED8]"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 min-h-[46px] text-sm font-semibold text-white bg-[#1D4ED8] rounded-xl hover:bg-[#1E40AF] disabled:opacity-60 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>
                  {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                </span>
              </>
            ) : (
              <span>{mode === 'signup' ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Prefer not to register?{' '}
          <button
            type="button"
            onClick={() => navigate('/check?fresh=1')}
            className="font-semibold text-[#1D4ED8] hover:underline underline-offset-4 cursor-pointer"
          >
            Continue as a guest
          </button>
        </div>
      </div>
    </div>
  );
}
