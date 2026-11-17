import { ArrowRight, CheckCircle2, Headphones, Mic, ShieldCheck } from 'lucide-react';
import { useRouter } from '../lib/router.tsx';

export function AboutPage() {
  const { navigate } = useRouter();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      <header className="space-y-3 border-b border-slate-200 pb-8">
        <p className="text-xs sm:text-sm font-medium text-slate-500">
          Scoring & Methodology · ExamReady A1
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 text-balance">
          How your German A1 readiness score is calculated
        </h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
          Every check serves 15 questions drawn from a 45-question A1 bank and four everyday German reading passages, graded transparently on the server.
        </p>
      </header>

      {/* Formula Section */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900">
          01. Difficulty weights & skill balance
        </h2>
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
          Not every A1 question tests the same level of detail. Easy foundational items carry a weight of <span className="font-mono font-semibold tabular-nums">1</span>, medium everyday items carry <span className="font-mono font-semibold tabular-nums">2</span>, and subtle exam traps carry <span className="font-mono font-semibold tabular-nums">3</span>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
            <p className="text-xs text-slate-500">Vocabulary · 5 questions</p>
            <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">30%</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Time, numbers, everyday signs, shopping, housing, and polite phrases.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
            <p className="text-xs text-slate-500">Grammar · 5 questions</p>
            <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">30%</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Articles, V2 word order, modal &amp; separable verbs, prepositions, and Perfekt.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
            <p className="text-xs text-slate-500">Reading · 5 questions</p>
            <p className="font-mono text-2xl font-bold text-slate-900 tabular-nums">40%</p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Authentic hallway notices, personal emails, library rules, and community flyers.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 text-sm text-slate-700 space-y-2">
          <p className="font-semibold text-slate-900">Exact weighted formula</p>
          <p className="font-mono text-xs sm:text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-x-auto">
            Skill Score = round((Weighted Points Earned / Weighted Points Available) × 100)
            {'\n'}
            Overall Score = round(Vocabulary × 0.30 + Grammar × 0.30 + Reading × 0.40)
          </p>
        </div>
      </section>

      {/* Verdict Thresholds */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900">
          02. Readiness verdict rules
        </h2>
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-emerald-900">Ready to book</p>
              <p className="text-sm text-slate-600">
                Overall weighted score is 75% or higher, and every single skill is at least 60%.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-emerald-800 tabular-nums shrink-0">
              Overall ≥ 75% &amp; All Skills ≥ 60%
            </span>
          </div>
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-amber-900">Almost there</p>
              <p className="text-sm text-slate-600">
                Overall score reaches 60% or higher, but one skill is below 60% or overall is below 75%.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-amber-800 tabular-nums shrink-0">
              Overall ≥ 60% (Ready rule not met)
            </span>
          </div>
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-rose-900">Not yet</p>
              <p className="text-sm text-slate-600">
                Overall weighted score is under 60%. Focus on your highest-urgency priority before booking.
              </p>
            </div>
            <span className="font-mono text-xs font-semibold text-rose-800 tabular-nums shrink-0">
              Overall &lt; 60%
            </span>
          </div>
        </div>
      </section>

      {/* What it doesn't cover */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-slate-900">
          03. Scope &amp; exam integrity
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Headphones className="w-4 h-4 text-[#1D4ED8]" aria-hidden="true" />
              <Mic className="w-4 h-4 text-[#1D4ED8]" aria-hidden="true" />
              <span>Remember Listening &amp; Speaking</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Official Goethe-Zertifikat A1 and ÖSD Zertifikat A1 exams include <em>Hören</em> (Listening), <em>Lesen</em> (Reading), <em>Schreiben</em> (Writing), and <em>Sprechen</em> (Speaking). Use this check as a fast diagnostic, and pair it with audio mock papers and spoken introduction practice.
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" aria-hidden="true" />
              <span>Server-side grading &amp; fresh retakes</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Answer keys and explanations stay on the server until you submit your 15 answers. When you retake the check, the server prioritizes unseen questions and passages from the 45-question bank.
            </p>
          </div>
        </div>
      </section>

      <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
          <span>Ready to benchmark your A1 level?</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/check?fresh=1')}
          className="inline-flex items-center gap-2 px-5 py-3 min-h-[44px] text-sm font-semibold text-white bg-[#1D4ED8] rounded-xl hover:bg-[#1E40AF] transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>Start 15-Question Check</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
