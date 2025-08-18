"use client";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@/i18n";
import LanguageSwitcher from "./LanguageSwitcher";
import { usePathname } from "next/navigation";

export default function Nav() {
  const { t } = useTranslation();
  const pathname = usePathname() || "/";
  const locale = pathname.split("/")[1] === "es" ? "es" : "en";
  const suggPath = locale === "es" ? "/sugerencias" : "/suggestions";
  const links = [
    { href: "/dashboard", label: t("Nav.dashboard") },
    { href: "/calendar", label: t("Nav.calendar") },
    { href: "/complaints", label: t("Nav.complaints") },
    { href: suggPath, label: t("Nav.suggestions") },
    { href: "/surveys", label: t("Nav.surveys") },
    { href: "/fundraising", label: t("Nav.fundraising") },
    { href: "/analytics", label: t("Nav.analytics") },
  ];
  return (
    <>
      <nav className="nav">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={pathname.startsWith(l.href) ? "active" : ""}
          >
            {l.label}
          </Link>
        ))}
        <LanguageSwitcher />
      </nav>
      <style jsx>{`
        .nav {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: #1d4ed8;
          color: white;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .nav :global(a) {
          color: inherit;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          transition: background 0.2s;
        }
        .nav :global(a:hover) {
          background: #2563eb;
        }
        .nav :global(a.active) {
          background: #1e40af;
        }
        .nav :global(select) {
          color: #111827;
          padding: 0.25rem;
          border-radius: 0.25rem;
          border: none;
        }
      `}</style>
    </>
  );
}
