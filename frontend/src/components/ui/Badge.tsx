import { cn } from '../../lib/utils';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'amber';

const variants: Record<Variant, string> = {
  default:  'bg-gray-100 text-gray-700 border border-gray-200/60 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600/60',
  success:  'bg-emerald-100 text-emerald-700 border border-emerald-200/60 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-700/40',
  warning:  'bg-yellow-100 text-yellow-700 border border-yellow-200/60 dark:bg-yellow-900/40 dark:text-yellow-400 dark:border-yellow-700/40',
  danger:   'bg-red-100 text-red-700 border border-red-200/60 dark:bg-red-900/40 dark:text-red-400 dark:border-red-700/40',
  info:     'bg-blue-100 text-blue-700 border border-blue-200/60 dark:bg-blue-900/40 dark:text-blue-400 dark:border-blue-700/40',
  purple:   'bg-violet-100 text-violet-700 border border-violet-200/60 dark:bg-violet-900/40 dark:text-violet-400 dark:border-violet-700/40',
  amber:    'bg-amber-100 text-amber-700 border border-amber-200/60 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-700/40',
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  dot?: boolean;
}

const dotColors: Record<Variant, string> = {
  default: 'bg-gray-500',
  success: 'bg-emerald-500',
  warning: 'bg-yellow-500',
  danger:  'bg-red-500',
  info:    'bg-blue-500',
  purple:  'bg-violet-500',
  amber:   'bg-amber-500',
};

export default function Badge({ children, variant = 'default', className, dot }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold',
      variants[variant],
      className
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])} />}
      {children}
    </span>
  );
}
