// Helper to generate initials from username
export function getInitials(name?: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Generate stable unique UID
export function generateUid(userName?: string): number {
  if (userName) {
    let hash = 0;
    for (let i = 0; i < userName.length; i++) {
      const char = userName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash) % 2147483647;
  }
  return Math.floor(Math.random() * 2147483647);
}
