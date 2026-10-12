/**
 * Utility helpers for formatting Indian currency, dates (DD/MM/YYYY), 
 * relative time, and user avatar initials.
 */

export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  
  // Format according to Indian Numbering System (e.g. 1,00,000)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIST(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(date.getTime())) return '';
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function timeAgo(dateStr: string | Date | undefined | null): string {
  if (!dateStr) return '';
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }
  if (diffInSeconds < 172800) return 'yesterday';
  
  const days = Math.floor(diffInSeconds / 86400);
  if (days < 30) return `${days}d ago`;

  return formatDateIST(date);
}

export function getInitials(name: string | undefined): string {
  if (!name) return 'KB';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const AVATAR_PALETTE = [
  'bg-amber-600',
  'bg-emerald-600',
  'bg-blue-600',
  'bg-indigo-600',
  'bg-rose-600',
  'bg-teal-600',
  'bg-violet-600',
  'bg-orange-600',
];

export function getAvatarColor(name: string | undefined): string {
  if (!name) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}
