"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import { usePathname, useRouter } from "next/navigation";
import { clearRefreshToken, clearToken, getToken, refreshToken } from "@/lib/auth";
import { getMe } from "@/lib/api";
import { canAccessRoute, requireRole, setUserRole, userRole } from "@/lib/roles";

export default function Nav() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const locale = pathname.split("/")[1] === "es" ? "es" : "en";
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const ensureAuth = async () => {
      const tk = getToken();
      if (!tk) {
        router.replace("/login");
        return;
      }
      if (userRole() === "guest") {
        try {
          const me = await getMe(tk);
          if (me?.role) setUserRole(me.role);
        } catch {
          const refreshed = await refreshToken();
          if (!refreshed) {
            clearToken();
            clearRefreshToken();
            router.replace("/login");
            return;
          }
          try {
            const me = await getMe(getToken());
            if (me?.role) setUserRole(me.role);
          } catch {}
        }
      }
      if (!canAccessRoute(pathname, userRole())) {
        router.replace("/dashboard");
        return;
      }
      if (active) setReady(true);
    };
    ensureAuth();
    return () => {
      active = false;
    };
  }, [pathname, router]);
  const suggPath = locale === "es" ? "/sugerencias" : "/suggestions";
  const links = [
    { href: "/dashboard", label: t("Nav.dashboard") },
    { href: "/calendar", label: t("Nav.calendar") },
    { href: "/complaints", label: t("Nav.complaints") },
    { href: suggPath, label: t("Nav.suggestions") },
    { href: "/surveys", label: t("Nav.surveys") },
    { href: "/fundraising", label: t("Nav.fundraising") },
    requireRole(["director"]) ? { href: "/analytics", label: t("Nav.analytics") } : null,
    requireRole(["admin", "director"]) ? { href: "/users", label: t("Nav.users") } : null,
    requireRole(["admin", "director"]) ? { href: "/students", label: t("Nav.students") } : null,
    requireRole(["admin", "director"]) ? { href: "/groups", label: t("Nav.groups") } : null,
    requireRole(["admin", "director"]) ? { href: "/parent-students", label: t("Nav.parentStudents") } : null,
    { href: "/profile", label: t("Nav.profile") },
  ].filter(Boolean) as { href: string; label: string }[];
  if (!ready) return null;

  return (
    <>
      <nav className="nav">
        <div className="brand">
          <span className="brand-mark">EL</span>
          <span className="brand-name">EduLinker</span>
        </div>
        <div className="links">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname.startsWith(l.href) ? "active" : ""}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="actions">
          <LanguageSwitcher />
        </div>
      </nav>
      <style jsx>{`
        .nav {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1.5rem;
          padding: 1rem 1.5rem;
          background: rgba(15, 23, 42, 0.72);
          color: #f8fafc;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(14px);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .brand-mark {
          background: linear-gradient(135deg, #38bdf8, #f59e0b);
          color: #0b1020;
          border-radius: 10px;
          padding: 6px 10px;
          font-weight: 800;
        }
        .brand-name {
          font-size: 1.05rem;
        }
        .links {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .nav :global(a) {
          color: inherit;
          padding: 0.35rem 0.7rem;
          border-radius: 999px;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
          border: 1px solid transparent;
        }
        .nav :global(a:hover) {
          background: rgba(56, 189, 248, 0.15);
          border-color: rgba(56, 189, 248, 0.5);
        }
        .nav :global(a.active) {
          background: rgba(245, 158, 11, 0.2);
          border-color: rgba(245, 158, 11, 0.6);
          color: #fef3c7;
        }
        .actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .nav :global(select) {
          color: #0f172a;
          padding: 0.35rem 0.6rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </>
  );
}
