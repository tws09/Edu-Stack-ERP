import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export default function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-6', className)}>
      <div className="flex items-start gap-3">
        {/* Left accent bar */}
        <div className="w-1 h-8 rounded-full bg-blue-600 shrink-0 mt-0.5" />
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-slate-100 tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-gray-400 dark:text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 ml-4 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
