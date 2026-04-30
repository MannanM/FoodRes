import { differenceInDays } from 'date-fns';

export function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function getExpirationStatus(useByDate?: string | null, bestBeforeDate?: string | null): 'RED' | 'YELLOW' | 'GREEN' {
  const targetDateStr = useByDate || bestBeforeDate;
  if (!targetDateStr) return 'GREEN';

  const targetDate = new Date(targetDateStr);
  const now = new Date();
  
  const daysDiff = differenceInDays(targetDate, now);

  if (daysDiff <= 30) return 'RED';
  if (daysDiff <= 180) return 'YELLOW'; // ~6 months
  return 'GREEN';
}

export function formatBaseAmount(amount: number, unit: string) {
  if (unit === 'g') {
    if (amount >= 1000) return `${+(amount / 1000).toFixed(2)} kg`;
    return `${amount} g`;
  }
  if (unit === 'ml') {
    if (amount >= 1000) return `${+(amount / 1000).toFixed(2)} L`;
    return `${amount} ml`;
  }
  return `${amount} units`;
}

export function calculateSurvival(totalBaseAmount: number, weeklyConsumptionRate: number) {
  if (!weeklyConsumptionRate || weeklyConsumptionRate <= 0) return null;
  const weeks = totalBaseAmount / weeklyConsumptionRate;
  const days = Math.floor(weeks * 7);
  
  let label = '';
  if (days < 14) {
    label = `${days}d`;
  } else if (days < 60) {
    label = `${Math.floor(weeks)}w`;
  } else if (days < 730) {
    label = `${Math.floor(days / 30.44)}m`;
  } else {
    label = `${(days / 365.25).toFixed(1)}y`;
  }

  return {
    days,
    weeks: +weeks.toFixed(1),
    label
  };
}

export function getTagColor(tag: string) {
  const colors = [
    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
    { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
    { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
    { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200' },
    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },
    { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
    { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    { bg: 'bg-slate-200', text: 'text-slate-700', border: 'border-slate-300' },
    { bg: 'bg-stone-200', text: 'text-stone-700', border: 'border-stone-300' },
    { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  ];
  
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
