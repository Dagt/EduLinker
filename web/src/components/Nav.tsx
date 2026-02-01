"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "@/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import { usePathname, useRouter } from "next/navigation";
import { clearRefreshToken, clearToken, getToken, refreshToken } from "@/lib/auth";
import { getMe, listSchoolYears, listSchools, setCurrentSchoolYear } from "@/lib/api";
import { canAccessRoute, requireRole, setUserRole, userRole } from "@/lib/roles";

function Icon({ name }: { name: string }) {
  switch (name) {
    case "overview":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 13h7v7H4zM13 3h7v7h-7zM13 12h7v8h-7zM4 4h7v7H4z" />
        </svg>
      );
    case "comm":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h16v10H7l-3 4V4zm9 4h5v2h-5z" />
        </svg>
      );
    case "transparency":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3l8 5v5c0 4.5-3.5 7.8-8 9-4.5-1.2-8-4.5-8-9V8l8-5zm-1 6h2v5h-2zm0 7h2v2h-2z" />
        </svg>
      );
    case "admin":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 7h16v4H4zM4 13h10v4H4zM16 13h4v4h-4z" />
        </svg>
      );
    case "account":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 9a7 7 0 0 1 14 0H5z" />
        </svg>
      );
    case "dashboard":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h7v7H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 13h7v7H4z" />
        </svg>
      );
    case "feed":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h16v4H4zM4 10h10v4H4zM4 16h16v4H4z" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 2v3H4a2 2 0 0 0-2 2v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a2 2 0 0 0-2-2h-3V2h-2v3H9V2H7zm13 8H4v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9z" />
        </svg>
      );
    case "incidents":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2 2 20h20L12 2zm0 6 3 8H9l3-8zm-1 10h2v2h-2z" />
        </svg>
      );
    case "announce":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 10v4h4l8 4V6l-8 4H2zm16-4h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2v-2h2V8h-2V6z" />
        </svg>
      );
    case "homework":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1v5h5" />
        </svg>
      );
    case "survey":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h16v4H4zM4 10h10v4H4zM4 16h7v4H4z" />
        </svg>
      );
    case "suggest":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h16v10H7l-3 4V4zm6 4h6v2h-6z" />
        </svg>
      );
    case "fund":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 6h16v4H4zM4 12h10v6H4zM16 12h4v6h-4z" />
        </svg>
      );
    case "analytics":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20h16v2H4zM6 10h3v8H6zM11 6h3v12h-3zM16 12h3v6h-3z" />
        </svg>
      );
    case "audit":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4zm-1 6h2v6h-2zm0 8h2v2h-2z" />
        </svg>
      );
    case "groups":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm10 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zM2 20a5 5 0 0 1 10 0H2zm10 0a5 5 0 0 1 10 0H12z" />
        </svg>
      );
    case "users":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 9a7 7 0 0 1 14 0H5z" />
        </svg>
      );
    case "students":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3 2 8l10 5 10-5-10-5zm-6 9v5l6 3 6-3v-5l-6 3-6-3z" />
        </svg>
      );
    case "parents":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 12a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm10 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3zM3 20a4 4 0 0 1 8 0H3zm10 0a4 4 0 0 1 8 0h-8z" />
        </svg>
      );
    case "years":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 4h16v16H4zM7 7h10v3H7zM7 12h6v3H7z" />
        </svg>
      );
    case "schools":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3 2 8l10 5 10-5-10-5zm-6 9v7h4v-5h4v5h4v-7l-6 3-6-3z" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm-7 9a7 7 0 0 1 14 0H5z" />
        </svg>
      );
    case "notify":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2a4 4 0 0 1 4 4v2.5a6 6 0 0 0 2 4.5l1 1H5l1-1a6 6 0 0 0 2-4.5V6a4 4 0 0 1 4-4zm-2 19h4a2 2 0 0 1-4 0z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="6" />
        </svg>
      );
  }
}

export default function Nav() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname() || "/";
  const locale = pathname.split("/")[1] === "es" ? "es" : "en";
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<any>(null);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [activeYearId, setActiveYearId] = useState<number | null>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

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
          const meData = await getMe(tk);
          if (meData?.role) setUserRole(meData.role);
          if (active) setMe(meData);
        } catch {
          const refreshed = await refreshToken();
          if (!refreshed) {
            clearToken();
            clearRefreshToken();
            localStorage.removeItem("role");
            router.replace("/login");
            return;
          }
          try {
            const meData = await getMe(getToken());
            if (meData?.role) setUserRole(meData.role);
            if (active) setMe(meData);
          } catch {}
        }
      }
      if (active) {
        const currentRole = userRole();
        if (["director", "admin"].includes(currentRole)) {
          try {
            const years = await listSchoolYears(getToken());
            const list = Array.isArray(years) ? years : years.results || [];
            const current = list.find((y: any) => y.is_current);
            setSchoolYears(list);
            setActiveYearId(current?.id ?? null);
          } catch {}
        }
        if (currentRole === "admin") {
          try {
            const data = await listSchools(getToken());
            const list = Array.isArray(data) ? data : data.results || [];
            setSchools(list);
            const stored = typeof window !== "undefined" ? localStorage.getItem("school_id") : null;
            const nextId = stored || (list[0] ? String(list[0].id) : null);
            if (nextId) {
              setSelectedSchoolId(nextId);
              if (typeof window !== "undefined" && !stored) {
                localStorage.setItem("school_id", nextId);
              }
            }
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

  const linkGroups = useMemo(() => {
    const coreLinks = [
      { href: "/dashboard", label: t("Nav.dashboard"), icon: "dashboard" },
      { href: "/feed", label: t("Nav.feed"), icon: "feed" },
      { href: "/calendar", label: t("Nav.calendar"), icon: "calendar" },
    ];
    const communicationLinks = [
      { href: "/complaints", label: t("Nav.complaints"), icon: "incidents" },
      { href: "/announcements", label: t("Nav.announcements"), icon: "announce" },
      !requireRole(["director", "admin"]) ? { href: "/homeworks", label: t("Nav.homeworks"), icon: "homework" } : null,
      { href: "/surveys", label: t("Nav.surveys"), icon: "survey" },
      requireRole(["teacher", "director", "admin"]) ? { href: suggPath, label: t("Nav.suggestions"), icon: "suggest" } : null,
    ].filter(Boolean) as { href: string; label: string; icon: string }[];
    const transparencyLinks = [
      { href: "/fundraising", label: t("Nav.fundraising"), icon: "fund" },
      requireRole(["director"]) ? { href: "/analytics", label: t("Nav.analytics"), icon: "analytics" } : null,
      requireRole(["director"]) ? { href: "/audit", label: t("Nav.audit"), icon: "audit" } : null,
    ].filter(Boolean) as { href: string; label: string; icon: string }[];
    const adminLinks = [
      requireRole(["admin"]) ? { href: "/schools", label: t("Nav.schools", { defaultValue: "Schools" }), icon: "schools" } : null,
      requireRole(["admin", "director"]) ? { href: "/groups", label: t("Nav.groups"), icon: "groups" } : null,
      requireRole(["admin", "director"]) ? { href: "/users", label: t("Nav.users"), icon: "users" } : null,
      requireRole(["admin", "director"]) ? { href: "/students", label: t("Nav.students"), icon: "students" } : null,
      requireRole(["admin", "director"]) ? { href: "/parent-students", label: t("Nav.parentStudents"), icon: "parents" } : null,
      requireRole(["admin", "director"]) ? { href: "/school-years", label: t("Nav.schoolYears"), icon: "years" } : null,
    ].filter(Boolean) as { href: string; label: string; icon: string }[];
    const accountLinks = [
      { href: "/profile", label: t("Nav.profile"), icon: "profile" },
      { href: "/settings/notifications", label: t("Nav.notifications", { defaultValue: "Notificaciones" }), icon: "notify" },
    ];

    return [
      { label: t("Nav.dashboard", { defaultValue: "Inicio" }), icon: "overview", items: coreLinks },
      { label: t("Nav.communication", { defaultValue: "Comunicacion" }), icon: "comm", items: communicationLinks },
      transparencyLinks.length ? { label: t("Nav.transparency", { defaultValue: "Transparencia" }), icon: "transparency", items: transparencyLinks } : null,
      adminLinks.length ? { label: t("Nav.administration", { defaultValue: "Administracion" }), icon: "admin", items: adminLinks } : null,
      { label: t("Nav.account", { defaultValue: "Cuenta" }), icon: "account", items: accountLinks },
    ].filter(Boolean) as { label: string; icon: string; items: { href: string; label: string; icon: string }[] }[];
  }, [locale, t]);

  const displayName = me ? `${me.first_name ?? ""} ${me.last_name ?? ""}`.trim() : "";

  function handleLogout() {
    clearToken();
    clearRefreshToken();
    localStorage.removeItem("role");
    router.replace("/login");
  }

  function handleSchoolChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextId = event.target.value;
    setSelectedSchoolId(nextId);
    if (typeof window !== "undefined") {
      localStorage.setItem("school_id", nextId);
    }
    router.refresh();
  }

  async function handleYearChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const nextId = Number(event.target.value);
    setActiveYearId(nextId);
    try {
      await setCurrentSchoolYear(nextId, getToken());
      router.refresh();
    } catch {
      setActiveYearId(activeYearId);
    }
  }

  if (!ready) return null;

  const currentSchoolName =
    userRole() === "admin" && schools.length > 0
      ? (schools.find((s: any) => String(s.id) === String(selectedSchoolId)) || {}).name
      : me?.school?.name;

  return (
    <>
      <nav className="nav">
        <div className="nav-top">
          <div className="brand">
            {me?.school?.logo_url ? (
              <img className="brand-logo" src={me.school.logo_url} alt="School logo" />
            ) : (
              <span className="brand-mark">EL</span>
            )}
            <div className="brand-text">
              <span className="brand-name">{currentSchoolName || "EduLinker"}</span>
              <span className="brand-sub">{me?.school?.subdomain ? `@${me.school.subdomain}` : t("Nav.tagline", { defaultValue: "Gobernanza escolar" })}</span>
            </div>
          </div>
          <div className="actions">
            {userRole() === "admin" && schools.length > 0 && (
              <select className="school-year" value={selectedSchoolId ?? ""} onChange={handleSchoolChange}>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
            )}
            {schoolYears.length > 0 && (
              <select className="school-year" value={activeYearId ?? ""} onChange={handleYearChange}>
                {schoolYears.map((year) => (
                  <option key={year.id} value={year.id}>{year.name}</option>
                ))}
              </select>
            )}
            {me && (
              <div className="user" title={displayName || undefined}>
                <div className="avatar">{displayName ? displayName[0] : "U"}</div>
                <span className="user-name">{displayName || t("Nav.unknownUser", { defaultValue: "Usuario" })}</span>
              </div>
            )}
            <LanguageSwitcher />
            <button className="logout" onClick={handleLogout}>{t("Nav.logout", { defaultValue: "Salir" })}</button>
          </div>
        </div>
        <div className="nav-menu">
          {linkGroups.map((group) => (
            <div
              key={group.label}
              className="nav-group"
              data-open={openGroup === group.label}
              onMouseEnter={() => setOpenGroup(group.label)}
              onMouseLeave={() => setOpenGroup(null)}
            >
              <button
                type="button"
                className="nav-trigger"
                aria-expanded={openGroup === group.label}
                onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
              >
                <span className="group-icon" aria-hidden="true"><Icon name={group.icon} /></span>
                {group.label}
                <span className="chev" aria-hidden="true" />
              </button>
              <div className="nav-panel">
                {group.items.map((l) => (
                  <Link key={l.href} href={l.href} className={pathname.startsWith(l.href) ? "active" : ""}>
                    <span className="icon" aria-hidden="true"><Icon name={l.icon} /></span>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
      <style jsx>{`
        .nav {
          display: grid;
          gap: 0.6rem;
          padding: 0.7rem 1.2rem 0.85rem;
          background: rgba(255, 255, 255, 0.94);
          color: #0f172a;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .nav-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .brand { display: flex; align-items: center; gap: 0.6rem; font-weight: 700; }
        .brand-text { display: grid; }
        .brand-logo {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid rgba(16, 24, 40, 0.12);
          background: #fff;
        }
        .brand-mark {
          background: linear-gradient(135deg, #2563eb, #10b981);
          color: #ffffff;
          border-radius: 12px;
          padding: 7px 11px;
          font-weight: 800;
          font-size: 0.82rem;
        }
        .brand-name { font-size: 1rem; display: block; }
        .brand-sub { font-size: 0.72rem; color: #667085; display: block; }
        .actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .user {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.2rem 0.4rem;
          border-radius: 999px;
          border: 1px solid rgba(16, 24, 40, 0.1);
          background: rgba(255, 255, 255, 0.85);
        }
        .user-name { font-size: 0.8rem; color: #344054; }
        .avatar {
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: linear-gradient(135deg, #14b8a6, #2563eb);
          color: #fff;
          font-weight: 700;
          font-size: 0.75rem;
        }
        .logout {
          background: #fff0ea;
          color: #9a3412;
          border: 1px solid rgba(154, 52, 18, 0.2);
          box-shadow: none;
          padding: 6px 10px;
          border-radius: 10px;
          font-size: 0.8rem;
        }
        .school-year {
          padding: 0.3rem 0.5rem;
          border-radius: 10px;
          border: 1px solid rgba(16, 24, 40, 0.18);
          background: rgba(255, 255, 255, 0.9);
          font-size: 0.8rem;
        }
        .nav-menu {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .nav-group {
          position: relative;
          padding-bottom: 4px;
        }
        .nav-trigger {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.65rem;
          border-radius: 999px;
          border: 1px solid rgba(16, 24, 40, 0.1);
          background: rgba(255, 255, 255, 0.9);
          color: #101828;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 16px rgba(16, 24, 40, 0.05);
        }
        .group-icon { width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; }
        .group-icon :global(svg) { width: 18px; height: 18px; fill: #2563eb; }
        .chev {
          width: 6px;
          height: 6px;
          border-right: 2px solid #667085;
          border-bottom: 2px solid #667085;
          transform: rotate(45deg);
          margin-left: 2px;
        }
        .nav-panel {
          position: absolute;
          top: 100%;
          left: 0;
          min-width: 250px;
          background: #ffffff;
          border: 1px solid rgba(16, 24, 40, 0.12);
          border-radius: 18px;
          box-shadow: 0 24px 55px rgba(15, 23, 42, 0.16);
          padding: 0.55rem;
          display: grid;
          gap: 0.25rem;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transform: translateY(8px);
          transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease;
          z-index: 20;
        }
        .nav-group[data-open="true"] .nav-panel,
        .nav-group:focus-within .nav-panel {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
          transform: translateY(0);
        }
        .nav-panel :global(a) {
          display: grid;
          grid-template-columns: 20px 1fr;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 0.7rem;
          border-radius: 14px;
          border: 1px solid transparent;
          color: #101828;
          font-size: 0.88rem;
        }
        .icon { width: 18px; height: 18px; display: inline-flex; align-items: center; justify-content: center; }
        .icon :global(svg) { width: 18px; height: 18px; fill: #667085; }
        .nav-panel :global(a:hover) {
          background: rgba(37, 99, 235, 0.08);
          border-color: rgba(37, 99, 235, 0.2);
        }
        .nav-panel :global(a.active) {
          background: rgba(249, 115, 22, 0.12);
          border-color: rgba(249, 115, 22, 0.35);
          font-weight: 600;
        }
        @media (max-width: 960px) {
          .nav-panel {
            position: static;
            margin-top: 0.5rem;
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
            transform: none;
            display: none;
          }
          .nav-group[data-open="true"] .nav-panel { display: grid; }
          .nav-trigger { width: 100%; justify-content: space-between; }
          .nav-group { width: 100%; }
        }
      `}</style>
    </>
  );
}
