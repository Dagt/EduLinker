export function userRole(): string {
  if (typeof window === 'undefined') return 'guest';
  return localStorage.getItem('role') || 'guest';
}

export function requireRole(allowed: string[]): boolean {
  return allowed.includes(userRole());
}
