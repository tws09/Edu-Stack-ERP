import { cn } from '../../lib/utils';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'amber';

const variants: Record<Variant, string> = {
  default:  'bg-gray-100 text-gray-700 border border-gray-200/60',
  success:  'bg-emerald-100 text-emerald-700 border border-emerald-200/60',
  warning:  'bg-yellow-100 text-yellow-700 border border-yellow-200/60',
  danger:   'bg-red-100 text-red-700 border border-red-200/60',
  info:     'bg-blue-100 text-blue-700 border border-blue-200/60',
  purple:   'bg-violet-100 text-violet-700 border border-violet-200/60',
  amber:    'bg-amber-100 text-amber-700 border border-amber-200/60',
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
