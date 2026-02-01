"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import RequireRole from "@/components/RequireRole";
import { createSchool, listSchools } from "@/lib/api";
import { getToken } from "@/lib/auth";
import "@/i18n";

export default function SchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [directorEmail, setDirectorEmail] = useState("");
  const [directorPassword, setDirectorPassword] = useState("");
  const [directorFirst, setDirectorFirst] = useState("");
  const [directorLast, setDirectorLast] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const tk = getToken();
        const data = await listSchools(tk);
        const list = Array.isArray(data) ? data : data?.results || [];
        setSchools(list);
      } catch (err: any) {
        setError(err?.message || "Failed to load schools");
      }
    })();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const tk = getToken();
      const created = await createSchool(
        {
          name,
          slug,
          subdomain,
          logo_url: logoUrl || undefined,
          director_email: directorEmail || undefined,
          director_password: directorPassword || undefined,
          director_first_name: directorFirst || undefined,
          director_last_name: directorLast || undefined,
        },
        tk,
      );
      setSchools([created, ...schools]);
      setName("");
      setSlug("");
      setSubdomain("");
      setLogoUrl("");
      setDirectorEmail("");
      setDirectorPassword("");
      setDirectorFirst("");
      setDirectorLast("");
    } catch (err: any) {
      setError(err?.message || "Failed to create school");
    }
  }

  return (
    <RequireRole allowed={["admin"]}>
      <Nav />
      <main className="page">
        <header className="page-header">
          <div>
            <span className="pill">Schools</span>
            <h2>Schools</h2>
            <p className="subtle">
              Create a school tenant with its subdomain and director credentials.
            </p>
          </div>
        </header>

        <section className="card form">
          <h3>Create school</h3>
          <form className="form" onSubmit={submit}>
            <label>
              School name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Slug
              <input value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </label>
            <label>
              Subdomain
              <input value={subdomain} onChange={(e) => setSubdomain(e.target.value)} required />
            </label>
            <label>
              Logo URL (optional)
              <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} />
            </label>
            <label>
              Director email (optional)
              <input value={directorEmail} onChange={(e) => setDirectorEmail(e.target.value)} />
            </label>
            <label>
              Director password (optional)
              <input type="password" value={directorPassword} onChange={(e) => setDirectorPassword(e.target.value)} />
            </label>
            <label>
              Director first name (optional)
              <input value={directorFirst} onChange={(e) => setDirectorFirst(e.target.value)} />
            </label>
            <label>
              Director last name (optional)
              <input value={directorLast} onChange={(e) => setDirectorLast(e.target.value)} />
            </label>
            <div className="form-actions">
              <button className="button" type="submit">Create</button>
            </div>
          </form>
        </section>

        {error && <p className="alert error">{error}</p>}

        <section className="grid cards">
          {schools.map((s) => (
            <article key={s.id} className="card">
              <div className="card-header">
                <span className="chip">#{s.id}</span>
              </div>
              <p className="card-title">{s.name}</p>
              <p className="subtle">@{s.subdomain}</p>
              {s.logo_url && (
                <div className="media-card" style={{ maxWidth: 180 }}>
                  <img src={s.logo_url} alt="Logo" />
                </div>
              )}
            </article>
          ))}
        </section>
      </main>
    </RequireRole>
  );
}
