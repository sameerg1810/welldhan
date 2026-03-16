export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  } catch {
    return dateStr;
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function getSportIcon(sport: string): string {
  const icons: Record<string, string> = {
    Badminton: '🏸',
    Yoga: '🧘',
    Karate: '🥋',
    Swimming: '🏊',
  };
  return icons[sport] || '🏃';
}

export function getSpotsColor(spots: number): string {
  if (spots === 0) return '#ef4444';
  if (spots <= 3) return '#f59e0b';
  return '#22c55e';
}

export function getRelationColor(relation: string): string {
  const colors: Record<string, string> = {
    Self: '#4ade80',
    Spouse: '#a78bfa',
    Child: '#38bdf8',
    Parent: '#f59e0b',
  };
  return colors[relation] || '#9ca3af';
}

export function getDaysText(days: string[]): string {
  if (!days || days.length === 0) return '';
  if (days.length === 7) return 'Every day';
  if (days.length === 5 && !days.includes('Sat') && !days.includes('Sun')) return 'Weekdays';
  return days.join(', ');
}

export function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}
