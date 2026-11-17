import { ArrowRight, BookOpen, Check, Clock, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { VerdictIcon } from '../components/VerdictDisplay.tsx';
import { useAuth } from '../lib/auth-context.tsx';
import { useRouter } from '../lib/router.tsx';

const SAMPLE_PREVIEW = {
  skill: 'Grammar · Medium · Weight 2',
  prompt: 'Which sentence has correct German word order?',
  options: [
    'Morgen fahre ich mit dem Zug nach Köln.',
    'Morgen ich fahre mit dem Zug nach Köln.',
    'Morgen mit dem Zug fahre ich nach Köln.',
    'Ich morgen fahre mit dem Zug nach Köln.',
  ],
  correctIndex: 0,
  explanation: 'In German main clauses, the conjugated verb always holds position 2.',
};

export function LandingPage() {
  const { navigate } = useRouter();
  const { user, attempts, loading: loadingHistory } = useAuth();
  const [previewSelected, setPreviewSelected] = useState<number | null>(null);

  const completedAttempts = attempts.filter((a) => a.status === 'completed');
  const inProgressAttempt = attempts.find((a) => a.status === 'in_progress');
  const isSignedIn = Boolean(user && !user.isAnonymous);

  return (
    <div className="bg-[#F7F8FA]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Primary Proposition & CTA */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Goethe-Zertifikat A1 · ÖSD Zertifikat A1 · No signup required
              </p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-900 leading-[1.12] text-balance">
                Check if you are ready to book your German A1 exam.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Answer 15 weighted questions across Vocabulary, Grammar, and Reading. Get an honest readiness verdict, targeted practice priorities, and full rule explanations in under 8 minutes.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/check?fresh=1')}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 min-h-[48px] text-sm sm:text-base font-semibold text-white bg-[#1D4ED8] rounded-xl hover:bg-[#1E40AF] active:scale-[0.98] transition-all shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-2 whitespace-nowrap"
                >
                  <span>Start 15-Question Check</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                {inProgressAttempt && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/check?attemptId=${encodeURIComponent(inProgressAttempt.attemptId)}`)
                    }
                    className="inline-flex items-center justify-center gap-2 px-5 py-3.5 min-h-[48px] text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-600" aria-hidden="true" />
                    <span>Resume In-Progress Check</span>
                  </button>
                )}

                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/about');
                  }}
                  className="inline-flex items-center justify-center px-3 py-2.5 min-h-[44px] text-sm font-medium text-slate-600 hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap"
                >
                  How scoring works
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-slate-500 pt-1">
                <span>15 questions per check</span>
                <span aria-hidden="true">·</span>
                <span>45-question bank for fresh retakes</span>
                <span aria-hidden="true">·</span>
                <span>Server-graded with explanations</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Diagnostic Blueprint Card */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
                <h2 className="font-display text-base font-semibold text-slate-900">
                  Assessment Structure
                </h2>
                <span className="font-mono text-xs text-slate-500 tabular-nums">
                  15 questions · ~7 min
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-left">
                <div className="p-3 rounded-xl bg-[#F7F8FA] border border-slate-200/80">
                  <p className="text-xs text-slate-500">Vocabulary</p>
                  <p className="font-mono text-lg font-semibold text-slate-900 tabular-nums mt-0.5">
                    30%
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">5 questions</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F8FA] border border-slate-200/80">
                  <p className="text-xs text-slate-500">Grammar</p>
                  <p className="font-mono text-lg font-semibold text-slate-900 tabular-nums mt-0.5">
                    30%
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">5 questions</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F8FA] border border-slate-200/80">
                  <p className="text-xs text-slate-500">Reading</p>
                  <p className="font-mono text-lg font-semibold text-slate-900 tabular-nums mt-0.5">
                    40%
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">5 questions</p>
                </div>
              </div>
            </div>

            {/* Interactive Sample Question Preview */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Try a sample question</span>
                <span>{SAMPLE_PREVIEW.skill}</span>
              </div>
              <p className="text-sm font-medium text-slate-900">
                {SAMPLE_PREVIEW.prompt}
              </p>
              <div className="space-y-1.5">
                {SAMPLE_PREVIEW.options.map((opt, idx) => {
                  const isPicked = previewSelected === idx;
                  const isRight = idx === SAMPLE_PREVIEW.correctIndex;
                  let btnStyle =
                    'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50';
                  if (previewSelected !== null) {
                    if (isRight) {
                      btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-medium';
                    } else if (isPicked) {
                      btnStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                    }
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setPreviewSelected(idx)}
                      className={`w-full text-left px-3 py-2 min-h-[40px] rounded-lg border text-xs sm:text-[13px] transition-colors flex items-center justify-between gap-2 cursor-pointer ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {previewSelected !== null && isRight && (
                        <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  );
                })}
              </div>
              {previewSelected !== null && (
                <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  {SAMPLE_PREVIEW.explanation}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Verdict Benchmark Strip */}
      <section className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-1.5">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Three clear readiness verdicts
              </h2>
              <p className="text-sm text-slate-600 max-w-2xl">
                Questions are weighted by difficulty (Easy 1 pt, Medium 2 pts, Hard 3 pts) so harder A1 items count accurately toward your readiness.
              </p>
            </div>
            <a
              href="/about"
              onClick={(e) => {
                e.preventDefault();
                navigate('/about');
              }}
              className="text-sm font-medium text-[#1D4ED8] hover:underline underline-offset-4 whitespace-nowrap"
            >
              Read full scoring rules
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2.5">
              <div className="flex items-center gap-2.5 text-emerald-900">
                <VerdictIcon verdict="Ready to book" className="w-5 h-5 text-emerald-700" />
                <h3 className="font-display text-base font-semibold">Ready to book</h3>
              </div>
              <p className="font-mono text-xs font-medium text-emerald-800 tabular-nums">
                Overall ≥ 75% · Every skill ≥ 60%
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Consistent command across vocabulary, grammar, and reading comprehension. Combine with listening and speaking practice before exam day.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2.5">
              <div className="flex items-center gap-2.5 text-amber-900">
                <VerdictIcon verdict="Almost there" className="w-5 h-5 text-amber-700" />
                <h3 className="font-display text-base font-semibold">Almost there</h3>
              </div>
              <p className="font-mono text-xs font-medium text-amber-800 tabular-nums">
                Overall ≥ 60% · Ready rule not yet met
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Solid baseline, but either your overall weighted score is under 75% or one skill dipped below 60%. Focus on your lowest-ranked priority first.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-rose-200 bg-rose-50/40 space-y-2.5">
              <div className="flex items-center gap-2.5 text-rose-900">
                <VerdictIcon verdict="Not yet" className="w-5 h-5 text-rose-700" />
                <h3 className="font-display text-base font-semibold">Not yet</h3>
              </div>
              <p className="font-mono text-xs font-medium text-rose-800 tabular-nums">
                Overall &lt; 60%
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                Core A1 patterns need reinforcement before paying for an exam slot. Review every explanation and retake with a fresh question set once ready.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Guest Attempts (if any) */}
      {!loadingHistory && completedAttempts.length > 0 && (
        <section className="border-t border-slate-200 bg-[#F7F8FA]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  Your recent readiness checks
                </h2>
                <p className="text-sm text-slate-600 mt-0.5">
                  {isSignedIn
                    ? `Saved to ${user?.email}`
                    : 'Saved to your guest session — create a free account to keep them across devices.'}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {!isSignedIn && (
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                  >
                    Save with account
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/check?fresh=1')}
                  className="text-sm font-semibold text-[#1D4ED8] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap"
                >
                  New check
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
              {completedAttempts.slice(0, 5).map((item) => (
                <div
                  key={item.attemptId}
                  className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {item.verdict && (
                      <VerdictIcon verdict={item.verdict} className="w-5 h-5 shrink-0 text-slate-700" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <span>{item.verdict ?? 'Completed'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {item.overallScore ?? 0}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {new Date(item.completedAt ?? item.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => navigate(`/results/${encodeURIComponent(item.attemptId)}`)}
                      className="px-3.5 py-2 min-h-[40px] text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                    >
                      View Results
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/review/${encodeURIComponent(item.attemptId)}`)}
                      className="px-3.5 py-2 min-h-[40px] text-xs font-semibold text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Review Answers</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
