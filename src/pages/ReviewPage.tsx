import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { difficultyLabel, SKILL_LABELS } from '../../shared/scoring.ts';
import type { AttemptReviewResponse, Skill } from '../../shared/types.ts';
import { fetchAttemptReview } from '../lib/api.ts';
import { useRouter } from '../lib/router.tsx';

type ReviewFilter = 'all' | 'incorrect' | Skill;

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export function ReviewPage({ attemptId }: { attemptId: string }) {
  const { navigate } = useRouter();
  const [data, setData] = useState<AttemptReviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [openPassages, setOpenPassages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetchAttemptReview(attemptId)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load answer review.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attemptId]);

  const filteredItems = useMemo(() => {
    if (!data) return [];
    if (filter === 'all') return data.items;
    if (filter === 'incorrect') return data.items.filter((i) => !i.isCorrect);
    return data.items.filter((i) => i.skill === filter);
  }, [data, filter]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-7 h-7 text-[#1D4ED8] animate-spin" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-700">
          Loading answer explanations...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-900">
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" aria-hidden="true" />
            <h1 className="font-display text-lg font-bold">Review unavailable</h1>
          </div>
          <p className="text-sm text-slate-600">
            {error ?? 'Completed review is only available after submitting all 15 questions.'}
          </p>
          <button
            type="button"
            onClick={() => navigate(`/results/${encodeURIComponent(attemptId)}`)}
            className="px-4 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-[#1D4ED8] rounded-xl hover:bg-[#1E40AF] transition-colors cursor-pointer"
          >
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  const incorrectCount = data.items.filter((i) => !i.isCorrect).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => navigate(`/results/${encodeURIComponent(attemptId)}`)}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back to Results</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Answer Review &amp; Explanations
          </h1>
          <p className="text-sm text-slate-600">
            <span>{data.summary.verdict}</span>
            <span aria-hidden="true"> · </span>
            <span className="font-mono tabular-nums">
              {data.summary.overallScore}% overall ({data.summary.totalCorrect}/{data.summary.totalQuestions} correct)
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/check?fresh=1')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-[#1D4ED8] rounded-xl hover:bg-[#1E40AF] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Retake with Fresh Questions</span>
        </button>
      </div>

      {/* Interactive Filter Tabs */}
      <div
        className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto"
        role="tablist"
        aria-label="Filter reviewed answers"
      >
        {(
          [
            { id: 'all', label: `All (${data.items.length})` },
            { id: 'incorrect', label: `Needs Review (${incorrectCount})` },
            { id: 'vocabulary', label: 'Vocabulary' },
            { id: 'grammar', label: 'Grammar' },
            { id: 'reading', label: 'Reading' },
          ] as Array<{ id: ReviewFilter; label: string }>
        ).map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-2 min-h-[38px] text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Empty Filter State */}
      {filteredItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
          <CheckCircle2 className="w-7 h-7 text-emerald-700 mx-auto" aria-hidden="true" />
          <p className="font-display text-base font-bold text-slate-900">
            Zero missed questions in this view
          </p>
          <p className="text-sm text-slate-600">
            You answered every question in this selection correctly.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredItems.map((item) => {
            const passageKey = item.questionId;
            const isPassageOpen = Boolean(openPassages[passageKey]);

            return (
              <article
                key={item.questionId}
                className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4"
              >
                {/* Question Header Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono font-semibold text-slate-900 tabular-nums">
                      Q{String(item.orderIndex + 1).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium text-slate-700">
                      {SKILL_LABELS[item.skill]}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {difficultyLabel(item.difficulty)} (Weight {item.difficulty})
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.topic}</span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                      item.isCorrect ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {item.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" aria-hidden="true" />
                        <span>Needs review</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Collapsible Reading Passage Reference */}
                {item.passage && (
                  <div className="border border-slate-200 rounded-xl bg-[#F7F8FA] overflow-hidden">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenPassages((prev) => ({
                          ...prev,
                          [passageKey]: !prev[passageKey],
                        }))
                      }
                      className="w-full px-4 py-2.5 flex items-center justify-between gap-2 text-xs font-medium text-slate-700 hover:bg-slate-100/70 transition-colors cursor-pointer"
                    >
                      <span className="inline-flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-[#1D4ED8]" aria-hidden="true" />
                        <span>Passage: {item.passage.title}</span>
                      </span>
                      {isPassageOpen ? (
                        <ChevronUp className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                    {isPassageOpen && (
                      <div className="px-4 pb-4 pt-1 text-sm text-slate-800 whitespace-pre-line leading-relaxed border-t border-slate-200/80">
                        {item.passage.body}
                      </div>
                    )}
                  </div>
                )}

                <h2 className="font-display text-lg font-bold text-slate-900 leading-snug">
                  {item.prompt}
                </h2>

                {/* Options Breakdown */}
                <div className="space-y-2">
                  {item.options.map((opt, optIdx) => {
                    const isCorrectOpt = optIdx === item.correctIndex;
                    const isUserPick = optIdx === item.selectedIndex;

                    let rowStyle = 'border-slate-200 bg-white text-slate-700';
                    let statusTag: string | null = null;

                    if (isCorrectOpt && isUserPick) {
                      rowStyle = 'border-emerald-300 bg-emerald-50/70 text-emerald-950 font-medium';
                      statusTag = 'Your answer · Correct';
                    } else if (isCorrectOpt) {
                      rowStyle = 'border-emerald-300 bg-emerald-50/70 text-emerald-950 font-medium';
                      statusTag = 'Correct answer';
                    } else if (isUserPick) {
                      rowStyle = 'border-rose-300 bg-rose-50/70 text-rose-950';
                      statusTag = 'Your answer';
                    }

                    return (
                      <div
                        key={`${item.questionId}-${optIdx}`}
                        className={`px-3.5 py-2.5 rounded-xl border text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 ${rowStyle}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className="font-mono text-xs font-semibold text-slate-500 w-5 shrink-0">
                            {OPTION_LETTERS[optIdx]}.
                          </span>
                          <span>{opt}</span>
                        </span>
                        {statusTag && (
                          <span className="text-xs font-semibold shrink-0 pl-8 sm:pl-0">
                            {statusTag}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Rule Explanation */}
                <div className="bg-[#F7F8FA] border border-slate-200/80 rounded-xl px-4 py-3 text-sm text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900">Explanation: </span>
                  {item.explanation}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
