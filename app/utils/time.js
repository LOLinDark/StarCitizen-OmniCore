export function formatRelativeTime(isoString) {
  const target = Date.parse(String(isoString || ''));
  if (!Number.isFinite(target)) {
    return 'Unknown time';
  }

  const diffMs = Date.now() - target;
  const absMs = Math.max(0, diffMs);
  const minutes = Math.floor(absMs / (60 * 1000));
  const hours = Math.floor(absMs / (60 * 60 * 1000));
  const days = Math.floor(absMs / (24 * 60 * 60 * 1000));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  const years = Math.floor(months / 12);
  return `${years}y ago`;
}
