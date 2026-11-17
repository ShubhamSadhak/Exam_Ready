import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Send,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { difficultyLabel, SKILL_LABELS } from '../../shared/scoring.ts';
import type { PublicQuestion } from '../../shared/types.ts';
import { createAttempt, fetchAttempt, submitAttempt } from '../lib/api.ts';
import { useAuth } from '../lib/auth-context.tsx';
import { useRouter } from '../lib/router.tsx';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

function storageKey(attemptId: string): string {
  return `examready_answers_${attemptId}`;
}

export function CheckPage({ attemptIdParam }: { attemptIdParam: string | null }) {
  const { navigate, search } = useRouter();
  const { refreshSession } = useAuth();
  const [attemptId, setAttemptId] = useState<string | null>(attemptIdParam);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incompleteNotice, setIncompleteNotice] = useState<string | null>(null);
  const [passageExpandedMobile, setPassageExpandedMobile] = useState(true);

  const initRef = useRef<string | null>(null);

  const loadOrStart = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIncompleteNotice(null);

    const params = new URLSearchParams(search);
    const isFresh = params.get('fresh') === '1';

    try {
      if (attemptIdParam && !isFresh) {
        const res = await fetchAttempt(attemptIdParam);
        if (res.status === 'completed') {
          navigate(`/results/${encodeURIComponent(attemptIdParam)}`);
          return;
        }
        setAttemptId(res.attemptId);
        setQuestions(res.questions);
        try {
          const saved = sessionStorage.getItem(storageKey(res.attemptId));
          if (saved) {
            setAnswers(JSON.parse(saved));
          }
        } catch {
          // ignore storage parse failure
        }
      } else {
        const created = await createAttempt();
        setAttemptId(created.attemptId);
        setQuestions(created.questions);
        setAnswers({});
        setCurrentIndex(0);
        window.history.replaceState(
          {},
          '',
          `/check?attemptId=${encodeURIComponent(created.attemptId)}`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load your readiness check right now.'
      );
    } finally {
      setLoading(false);
    }
  }, [attemptIdParam, navigate, search]);

  useEffect(() => {
    const key = `${attemptIdParam ?? 'new'}|${search}`;
    if (initRef.current === key) return;
    initRef.current = key;
    loadOrStart();
  }, [attemptIdParam, search, loadOrStart]);

  const currentQuestion = questions[currentIndex];
  const answeredCount = useMemo(() => {
    return questions.filter((q) => answers[q.id] !== undefined).length;
  }, [questions, answers]);

  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const selectOption = useCallback(
    (questionId: string, optionIndex: number) => {
      setIncompleteNotice(null);
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: optionIndex };
        if (attemptId) {
          try {
            sessionStorage.setItem(storageKey(attemptId), JSON.stringify(next));
          } catch {
            // ignore storage errors
          }
        }
        return next;
      });
    },
    [attemptId]
  );

  // Keyboard navigation (1-4 to select, ArrowLeft / ArrowRight to step)
  useEffect(() => {
    if (loading || submitting || !currentQuestion) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      if (e.key >= '1' && e.key <= '4') {
        selectOption(currentQuestion.id, Number(e.key) - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [loading, submitting, currentQuestion, currentIndex, questions.length, selectOption]);

  const handleSubmit = async () => {
    if (!attemptId || submitting) return;
    const firstUnansweredIndex = questions.findIndex(
      (q) => answers[q.id] === undefined
    );
    if (firstUnansweredIndex !== -1) {
      const remaining = questions.length - answeredCount;
      setCurrentIndex(firstUnansweredIndex);
      setIncompleteNotice(
        `Please answer all questions before submitting (${remaining} remaining). Jumped to Question ${firstUnansweredIndex + 1}.`
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id],
      }));
      await submitAttempt(attemptId, payload);
      try {
        sessionStorage.removeItem(storageKey(attemptId));
      } catch {
        // ignore
      }
      refreshSession();
      navigate(`/results/${encodeURIComponent(attemptId)}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to submit your check.'
      );
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center justify-center text-center space-y-3">
        <Loader2 className="w-7 h-7 text-[#1D4ED8] animate-spin" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-700">
          Preparing your 15-question German A1 check...
        </p>
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white border border-rose-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2.5 text-rose-900">
            <AlertCircle className="w-5 h-5 text-rose-700 shrink-0" aria-hidden="true" />
            <h1 className="font-display text-lg font-bold">Could not start check</h1>
          </div>
          <p className="text-sm text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => {
              initRef.current = null;
              loadOrStart();
            }}
            className="px-4 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-[#1D4ED8] rounded-xl hover:bg-[#1E40AF] transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isReading = currentQuestion.skill === 'reading' && Boolean(currentQuestion.passage);
  const selectedForCurrent = answers[currentQuestion.id];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-28 sm:py-8 space-y-5">
      {/* Compact Assessment Progress Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              Question {String(currentIndex + 1).padStart(2, '0')} / {questions.length}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-slate-900">
              {SKILL_LABELS[currentQuestion.skill]}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              {difficultyLabel(currentQuestion.difficulty)} (Weight {currentQuestion.difficulty})
            </span>
          </div>

          <span className="font-mono text-xs text-slate-500 tabular-nums">
            {answeredCount} of {questions.length} answered
          </span>
        </div>

        {/* Continuous Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1D4ED8] transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Step Navigator */}
        <div
          className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
          role="navigation"
          aria-label="Question navigator"
        >
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isAnswered = answers[q.id] !== undefined;
            let pillClass =
              'bg-slate-100 text-slate-600 hover:bg-slate-200 border-transparent';
            if (isCurrent) {
              pillClass =
                'bg-[#1D4ED8] text-white border-[#1D4ED8] font-semibold';
            } else if (isAnswered) {
              pillClass =
                'bg-blue-50 text-[#1D4ED8] border-blue-200 font-medium';
            }
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Jump to question ${idx + 1}${isAnswered ? ' (answered)' : ''}`}
                aria-current={isCurrent ? 'step' : undefined}
                className={`min-w-[34px] h-8 px-1.5 rounded-lg border text-xs font-mono tabular-nums transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] ${pillClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Validation or Network Banner */}
      {(incompleteNotice || error) && (
        <div
          role="alert"
          className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5 text-sm text-amber-900"
        >
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{incompleteNotice ?? error}</span>
        </div>
      )}

      {/* Main Question Stage (2-column split for Reading on desktop, clean single column otherwise) */}
      <div
        className={
          isReading
            ? 'grid grid-cols-1 lg:grid-cols-12 gap-5 items-start'
            : 'max-w-3xl mx-auto'
        }
      >
        {/* Reading Passage Panel */}
        {isReading && currentQuestion.passage && (
          <aside className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl overflow-hidden lg:sticky lg:top-20">
            <button
              type="button"
              onClick={() => setPassageExpandedMobile((v) => !v)}
              className="w-full px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 text-left lg:cursor-default cursor-pointer"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs font-medium text-[#1D4ED8]">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Reading Passage</span>
                </div>
                <h2 className="font-display text-base font-bold text-slate-900 truncate mt-0.5">
                  {currentQuestion.passage.title}
                </h2>
              </div>
              <span className="lg:hidden text-slate-500 shrink-0">
                {passageExpandedMobile ? (
                  <ChevronUp className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-5 h-5" aria-hidden="true" />
                )}
              </span>
            </button>

            <div
              className={`px-5 py-4 space-y-3 ${
                passageExpandedMobile ? 'block' : 'hidden lg:block'
              }`}
            >
              <p className="text-xs text-slate-500">
                {currentQuestion.passage.context}
              </p>
              <div className="text-sm sm:text-[15px] text-slate-800 leading-relaxed whitespace-pre-line bg-[#F7F8FA] border border-slate-200/80 rounded-xl p-4">
                {currentQuestion.passage.body}
              </div>
            </div>
          </aside>
        )}

        {/* Question & Options Card */}
        <section
          className={`${
            isReading ? 'lg:col-span-7' : ''
          } bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-6`}
        >
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500">
              {currentQuestion.topic}
            </p>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {currentQuestion.prompt}
            </h1>
          </div>

          {/* 4 Answer Choices */}
          <div className="space-y-3" role="radiogroup" aria-label="Answer options">
            {currentQuestion.options.map((optionText, idx) => {
              const isSelected = selectedForCurrent === idx;
              return (
                <button
                  key={`${currentQuestion.id}-${idx}`}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => selectOption(currentQuestion.id, idx)}
                  className={`w-full text-left px-4 py-3.5 min-h-[54px] rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1D4ED8] focus-visible:ring-offset-1 ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#1D4ED8] text-slate-900 shadow-[0_0_0_1px_#1D4ED8]'
                      : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg font-mono text-xs font-semibold flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#1D4ED8] text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {OPTION_LETTERS[idx]}
                    </span>
                    <span className="text-sm sm:text-base font-medium leading-snug">
                      {optionText}
                    </span>
                  </span>

                  {isSelected && (
                    <Check
                      className="w-5 h-5 text-[#1D4ED8] shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop Inline Controls */}
          <div className="hidden sm:flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={currentIndex === 0 || submitting}
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-3">
              {currentIndex < questions.length - 1 && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}

              {(currentIndex === questions.length - 1 || allAnswered) && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white bg-[#1D4ED8] rounded-xl hover:bg-[#1E40AF] disabled:opacity-60 transition-colors cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Grading...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" aria-hidden="true" />
                      <span>Submit Check</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Mobile Sticky Bottom Thumb Bar (compact <= 60px, well under 15% cap) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2">
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          <button
            type="button"
            disabled={currentIndex === 0 || submitting}
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            aria-label="Previous question"
            className="px-3.5 min-h-[44px] text-sm font-medium text-slate-700 bg-slate-100 rounded-xl disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Back</span>
          </button>

          {currentIndex < questions.length - 1 && !allAnswered ? (
            <button
              type="button"
              disabled={submitting}
              onClick={() =>
                setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))
              }
              className="flex-1 min-h-[44px] text-sm font-semibold text-white bg-slate-900 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Next Question</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="flex-1 min-h-[44px] text-sm font-semibold text-white bg-[#1D4ED8] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Grading...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" aria-hidden="true" />
                  <span>Submit ({answeredCount}/{questions.length})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
