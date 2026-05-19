import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'PKR'): string {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }).format(
    new Date(date)
  );
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function roleLabel(role: string): string {
  const labels: Record<string, string> = {
    super_admin: 'Super Admin',
    group_admin: 'Group Admin',
    branch_principal: 'Principal',
    teacher: 'Teacher',
    student: 'Student',
    accountant: 'Accountant',
    it_admin: 'IT Admin',
  };
  return labels[role] ?? role;
}
