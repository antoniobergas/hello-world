import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(date: Date): string {
  return format(date, 'PPP');
}

export function timeAgo(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function isOverdue(dueDate: Date, completed = false): boolean {
  if (completed) return false;
  return dueDate < new Date();
}

export function formatDueDate(dueDate: Date): string {
  return format(dueDate, 'MMM d, yyyy');
}
