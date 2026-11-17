import { useRouter } from '../lib/router.tsx';

export function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="font-display text-sm font-semibold text-slate-900">
            ExamReady A1
          </p>
          <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
            Practice readiness estimate for Goethe-Zertifikat A1 and ÖSD Zertifikat A1 learners. Not affiliated with the Goethe-Institut or ÖSD.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs font-medium text-slate-600 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
            className="hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap"
          >
            Overview
          </a>
          <a
            href="/check?fresh=1"
            onClick={(e) => {
              e.preventDefault();
              navigate('/check?fresh=1');
            }}
            className="hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap"
          >
            Start Check
          </a>
          <a
            href="/about"
            onClick={(e) => {
              e.preventDefault();
              navigate('/about');
            }}
            className="hover:text-slate-900 hover:underline underline-offset-4 whitespace-nowrap"
          >
            Scoring Method
          </a>
        </div>
      </div>
    </footer>
  );
}
