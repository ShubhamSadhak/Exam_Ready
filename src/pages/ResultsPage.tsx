import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Headphones,
  Loader2,
  Mic,
  RotateCcw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { AttemptResultSummary } from '../../shared/types.ts';
import { VERDICT_META, VerdictIcon } from '../components/VerdictDisplay.tsx';
import { fetchAttempt } from '../lib/api.ts';
import { useAuth } from '../lib/auth-context.tsx';
import { useRouter } from '../lib/router.tsx';

export function ResultsPage({ attemptId }: { attemptId: string }) {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const [summary, setSummary] = useState<AttemptResultSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchAttempt(attemptId)
      .then((res) => {
        if (!active) return;
        if (res.status === 'in_progress') {
          navigate(`/check?attemptId=${encodeURIComponent(attemptId)}`);
          return;
        }
        setSummary(res.summary);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : 'Unable to load results.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attemptId, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-7 h-7 text-[#1D4ED8] animate-spin" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-700">
          Loading your readiness verdict...
        </p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-900">
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" aria-hidden="true" />
            <h1 className="font-display text-lg font-bold">Result unavailable</h1>
          </div>
          <p className="text-sm text-slate-600">
            {error ?? 'We could not find this assessment in your current guest session.'}
          </p>
          <button
            type="button"
            onClick={() => navigate('/check?fresh=1')}
            className="px-4 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-[#1D4ED8] rounded-xl hover:bg-[#1E40AF] transition-colors cursor-pointer"
          >
            Start a Fresh Check
          </button>
        </div>
      </div>
    );
  }

  const meta = VERDICT_META[summary.verdict];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
      {/* Verdict Summary Header */}
      <section
        className={`rounded-2xl border p-6 sm:p-8 ${meta.bg} ${meta.border}`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${meta.iconBg}`}
              >
                <VerdictIcon verdict={summary.verdict} className="w-5 h-5" />
              </span>
              <span className={`text-sm font-semibold ${meta.text}`}>
                A1 Readiness Verdict
              </span>
            </div>
            <h1
              className={`font-display text-3xl sm:text-4xl font-bold tracking-tight ${meta.text}`}
            >
              {summary.verdict}
            </h1>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
              {meta.summary}
            </p>
          </div>

          <div className="bg-white/90 border border-slate-200/80 rounded-2xl px-6 py-5 flex md:flex-col items-center md:items-end justify-between gap-4 shrink-0">
            <div className="text-left md:text-right">
              <p className="text-xs font-medium text-slate-500">
                Weighted Score
              </p>
              <p className="font-mono text-4xl sm:text-5xl font-bold text-slate-900 tabular-nums mt-0.5">
                {summary.overallScore}%
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-semibold text-slate-800 tabular-nums">
                {summary.totalCorrect} / {summary.totalQuestions} correct
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Ready threshold: ≥ 75%
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-6 mt-6 border-t border-slate-900/10">
          <button
            type="button"
            onClick={() => navigate(`/review/${encodeURIComponent(summary.attemptId)}`)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[46px] text-sm font-semibold text-white bg-[#1D4ED8] rounded-xl hover:bg-[#1E40AF] transition-colors cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            <span>Review All 15 Answers</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/check?fresh=1')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[46px] text-sm font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" aria-hidden="true" />
            <span>Retake with Fresh Questions</span>
          </button>
        </div>
      </section>

      {/* Skill Breakdown Grid */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Skill Breakdown
            </h2>
            <p className="text-sm text-slate-600">
              Every skill requires at least 60% to satisfy the Ready to book rule.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {summary.skills.map((skill) => {
            const pass = skill.meetsReadyMinimum;
            return (
              <div
                key={skill.skill}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      {skill.label}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {skill.weightPercent}% of overall score
                    </p>
                  </div>
                  <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                    {skill.score}%
                  </span>
                </div>

                {/* Progress Bar with 60% Minimum Marker */}
                <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      pass ? 'bg-emerald-600' : 'bg-amber-600'
                    }`}
                    style={{ width: `${skill.score}%` }}
                  />
                  <div
                    title="60% minimum threshold"
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-900/40"
                    style={{ left: '60%' }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-600 tabular-nums">
                    {skill.correctCount}/{skill.totalCount} right · {skill.earnedPoints}/{skill.availablePoints} pts
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 font-medium ${
                      pass ? 'text-emerald-800' : 'text-amber-800'
                    }`}
                  >
                    {pass ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Meets 60%</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Below 60%</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Practice Priorities */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            Practice Priorities
          </h2>
          <p className="text-sm text-slate-600">
            Ordered from highest impact to maintenance based on your weighted results and missed topics.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          {summary.priorities.map((priority, idx) => {
            const urgencyLabel =
              priority.urgency === 'high'
                ? 'High Priority'
                : priority.urgency === 'medium'
                ? 'Strengthen'
                : 'Maintain';
            const urgencyText =
              priority.urgency === 'high'
                ? 'text-rose-800'
                : priority.urgency === 'medium'
                ? 'text-amber-800'
                : 'text-emerald-800';

            return (
              <div key={priority.skill} className="p-5 sm:p-6 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
                      0{idx + 1}.
                    </span>
                    <h3 className="font-display text-base font-bold text-slate-900">
                      {priority.headline}
                    </h3>
                  </div>
                  <span className={`text-xs font-semibold ${urgencyText}`}>
                    {urgencyLabel}
                  </span>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {priority.guidance}
                </p>

                {priority.missedTopics.length > 0 && (
                  <p className="text-xs text-slate-500 pt-1">
                    <span className="font-semibold text-slate-700">
                      Topics to review:{' '}
                    </span>
                    {priority.missedTopics.join(' · ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Listening & Speaking Reminder */}
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-4">
        <div className="flex items-center gap-2 text-[#1D4ED8] bg-blue-50 p-3 rounded-xl shrink-0">
          <Headphones className="w-5 h-5" aria-hidden="true" />
          <Mic className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="font-display text-base font-bold text-slate-900">
            Do not forget Listening (Hören) &amp; Speaking (Sprechen)
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            {summary.speakingListeningReminder}
          </p>
        </div>
      </section>

      {(!user || user.isAnonymous) && (
        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-base font-bold text-slate-900">
              Save this result to your account
            </h2>
            <p className="text-sm text-slate-600">
              Create a free account or sign in to keep your check history and track your progress across devices.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-4 py-2.5 min-h-[44px] text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
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
          </div>
        </section>
      )}
    </div>
  );
}
