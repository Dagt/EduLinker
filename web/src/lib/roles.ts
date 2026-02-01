const roleAliases: Record<string, string> = {
  ADMIN_TENANT: "admin",
  DIRECTOR: "director",
  PADRE: "parent",
  MAESTRO_TITULAR: "teacher",
  MAESTRO_ITINERANTE: "teacher",
  VOCAL: "vocal",
};

export function normalizeRole(role?: string): string {
  if (!role) return "guest";
  const upper = role.toUpperCase();
  if (roleAliases[upper]) return roleAliases[upper];
  return role.toLowerCase();
}

export function setUserRole(role: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("role", role);
}

export function userRole(): string {
  if (typeof window === "undefined") return "guest";
  return normalizeRole(localStorage.getItem("role") || "guest");
}

export function requireRole(allowed: string[]): boolean {
  const current = userRole();
  return allowed.map(normalizeRole).includes(current);
}

export const protectedRoutes: Record<string, string[]> = {
  "/groups": ["admin", "director"],
  "/groups/create": ["admin", "director"],
  "/groups/edit": ["admin", "director"],
  "/groups/assign-homeroom": ["admin", "director"],
  "/groups/assign-specialist": ["admin", "director"],
  "/groups/assign-vocal": ["admin", "director"],
  "/groups/": ["admin", "director"],
  "/users": ["admin", "director"],
  "/users/create": ["admin", "director"],
  "/students": ["admin", "director"],
  "/students/create": ["admin", "director"],
  "/students/edit": ["admin", "director"],
  "/audit": ["director"],
  "/parent-students": ["admin", "director"],
  "/schools": ["admin"],
  "/suggestions": ["admin", "director", "teacher"],
  "/sugerencias": ["admin", "director", "teacher"],
};

export function canAccessRoute(path: string, role?: string): boolean {
  const r = normalizeRole(role || userRole());
  for (const [p, roles] of Object.entries(protectedRoutes)) {
    if (path.startsWith(p)) return roles.map(normalizeRole).includes(r);
  }
  return true;
}
