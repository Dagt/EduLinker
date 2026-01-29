export function userRole(): string {
  if (typeof window === 'undefined') return 'guest';
  return localStorage.getItem('role') || 'guest';
}

export function requireRole(allowed: string[]): boolean {
  return allowed.includes(userRole());
}

export const protectedRoutes: Record<string, string[]> = {
  "/groups": ["admin"],
  "/groups/create": ["admin"],
  "/groups/edit": ["admin"],
  "/groups/assign-homeroom": ["admin"],
  "/groups/assign-specialist": ["admin"],
  "/groups/assign-vocal": ["admin"],
  "/users": ["admin"],
  "/users/create": ["admin"],
  "/students": ["admin"],
  "/students/create": ["admin"],
  "/students/edit": ["admin"],
  "/audit": ["director"],
};

export function canAccessRoute(path: string, role?: string): boolean {
  const r = role || userRole();
  for (const [p, roles] of Object.entries(protectedRoutes)) {
    if (path.startsWith(p)) return roles.includes(r);
  }
  return true;
}
