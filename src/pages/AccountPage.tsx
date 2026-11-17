import { ArrowRight, BookOpen, Clock, LogOut, RotateCcw, User } from 'lucide-react';
import { useState } from 'react';
import { VerdictIcon } from '../components/VerdictDisplay.tsx';
import { useAuth } from '../lib/auth-context.tsx';
import { useRouter } from '../lib/router.tsx';

export function AccountPage() {
  const { navigate } = useRouter();
  const { user, attempts, loading, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/');
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-sm text-slate-600">
        Loading account...
      </div>
    );
  }

  const isGuest = !user || user.isAnonymous;
  const completedAttempts = attempts.filter((a) => a.status === 'completed');
  const inProgressAttempts = attempts.filter((a) => a.status === 'in_progress');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Account Profile Card */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0">
            <User className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500">
              {isGuest ? 'Guest Session' : 'Signed-In Learner'}
            </p>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 truncate">
              {isGuest ? 'Guest Learner' : user.name}
            </h1>
            <p className="text-sm text-slate-600 truncate">
              {isGuest
                ? 'Sign up or log in to keep your A1 check history across devices.'
                : user.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {isGuest ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="px-4 py-2.5 min-h-[44px] text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="px-4 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Create Account
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={signingOut}
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
            </button>
          )}
        </div>
      </section>

      {/* Assessment History */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Your Readiness Check History
            </h2>
            <p className="text-sm text-slate-600">
              {completedAttempts.length} completed{' '}
              {completedAttempts.length === 1 ? 'check' : 'checks'}
              {inProgressAttempts.length > 0
                ? ` · ${inProgressAttempts.length} in progress`
                : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/check?fresh=1')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[42px] text-xs sm:text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>New Check</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {attempts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
            <p className="font-display text-base font-bold text-slate-900">
              No readiness checks yet
            </p>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Take a 15-question German A1 diagnostic to see your weighted Vocabulary, Grammar, and Reading scores.
            </p>
            <button
              type="button"
              onClick={() => navigate('/check?fresh=1')}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-[#1D4ED8] rounded-xl hover:bg-[#1E40AF] transition-colors cursor-pointer"
            >
              <span>Start First Check</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
            {attempts.map((item) => (
              <div
                key={item.attemptId}
                className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.verdict && (
                    <VerdictIcon
                      verdict={item.verdict}
                      className="w-5 h-5 shrink-0 text-slate-700"
                    />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <span>
                        {item.status === 'in_progress'
                          ? 'In-progress check'
                          : item.verdict ?? 'Completed'}
                      </span>
                      {item.overallScore !== null && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {item.overallScore}%
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>
                        {new Date(item.completedAt ?? item.createdAt).toLocaleString(
                          undefined,
                          { dateStyle: 'medium', timeStyle: 'short' }
                        )}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status === 'in_progress' ? (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/check?attemptId=${encodeURIComponent(item.attemptId)}`
                        )
                      }
                      className="px-3.5 py-2 min-h-[40px] text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Resume</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/results/${encodeURIComponent(item.attemptId)}`
                          )
                        }
                        className="px-3.5 py-2 min-h-[40px] text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        View Results
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/review/${encodeURIComponent(item.attemptId)}`
                          )
                        }
                        className="px-3.5 py-2 min-h-[40px] text-xs font-semibold text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Review Answers</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
