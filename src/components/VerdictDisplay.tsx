import { AlertCircle, CheckCircle2, Compass } from 'lucide-react';
import type { ReadinessVerdict } from '../../shared/types.ts';

interface VerdictStyles {
  bg: string;
  border: string;
  text: string;
  iconBg: string;
  summary: string;
}

export const VERDICT_META: Record<ReadinessVerdict, VerdictStyles> = {
  'Ready to book': {
    bg: 'bg-emerald-50/70',
    border: 'border-emerald-200',
    text: 'text-emerald-900',
    iconBg: 'bg-emerald-100 text-emerald-700',
    summary:
      'Your overall weighted score is at least 75% and every individual skill meets the 60% minimum threshold.',
  },
  'Almost there': {
    bg: 'bg-amber-50/70',
    border: 'border-amber-200',
    text: 'text-amber-900',
    iconBg: 'bg-amber-100 text-amber-800',
    summary:
      'Your overall score is 60% or higher, but either overall is under 75% or one skill is still below the 60% minimum.',
  },
  'Not yet': {
    bg: 'bg-rose-50/70',
    border: 'border-rose-200',
    text: 'text-rose-900',
    iconBg: 'bg-rose-100 text-rose-800',
    summary:
      'Your overall weighted score is below 60%. Review your missed explanations and strengthen core A1 patterns before booking.',
  },
};

export function VerdictIcon({
  verdict,
  className = 'w-5 h-5',
}: {
  verdict: ReadinessVerdict;
  className?: string;
}) {
  if (verdict === 'Ready to book') {
    return <CheckCircle2 className={className} aria-hidden="true" />;
  }
  if (verdict === 'Almost there') {
    return <AlertCircle className={className} aria-hidden="true" />;
  }
  return <Compass className={className} aria-hidden="true" />;
}
