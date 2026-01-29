"use client";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import RequireRole from "@/components/RequireRole";
import { getToken } from "@/lib/auth";
import { listUsers, updateUserRole } from "@/lib/api";
import { useTranslation } from "react-i18next";
import "@/i18n";
import Link from "next/link";

type UserRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active?: boolean;
};

export default function UserList() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [filters, setFilters] = useState({ name: "", email: "", status: "", role: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [updates, setUpdates] = useState<Record<number, { role: string; is_active: boolean }>>({});

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const tk = getToken();
      const data = await listUsers(
        {
          name: filters.name || undefined,
          email: filters.email || undefined,
          status: filters.status || undefined,
          role: filters.role || undefined,
        },
        tk,
      );
      const rows = Array.isArray(data?.results) ? data.results : data;
      setUsers(rows);
      const defaultUpdates = rows.reduce(
        (acc: Record<number, { role: string; is_active: boolean }>, row: UserRow) => {
          acc[row.id] = { role: row.role, is_active: row.is_active ?? true };
          return acc;
        },
        {},
      );
      setUpdates(defaultUpdates);
    } catch (err: any) {
      setError(err.message || t("UserList.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  async function submitFilters(e: React.FormEvent) {
    e.preventDefault();
    await load();
  }

  async function saveRow(userId: number) {
    const payload = updates[userId];
    if (!payload) return;
    setSavingId(userId);
    setError("");
    try {
      const tk = getToken();
      await updateUserRole(userId, payload, tk);
      await load();
    } catch (err: any) {
      setError(err.message || t("UserList.error"));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <RequireRole allowed={["admin", "director"]}>
      <Nav />
      <main style={{ padding: 16 }}>
        <h2>{t("UserList.header")}</h2>
        <p>
          <Link href="/users/create">{t("UserList.create")}</Link>
        </p>
        <form onSubmit={submitFilters} style={{ display: "grid", gap: 8, maxWidth: 600 }}>
          <input
            placeholder={t("UserList.filterName")}
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            style={{ padding: 8 }}
          />
          <input
            placeholder={t("UserList.filterEmail")}
            value={filters.email}
            onChange={(e) => setFilters({ ...filters, email: e.target.value })}
            style={{ padding: 8 }}
          />
          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            style={{ padding: 8 }}
          >
            <option value="">{t("UserList.filterRole")}</option>
            <option value="DIRECTOR">{t("UserList.roleDirector")}</option>
            <option value="MAESTRO_TITULAR">{t("UserList.roleHomeroom")}</option>
            <option value="MAESTRO_ITINERANTE">{t("UserList.roleSpecialist")}</option>
            <option value="PADRE">{t("UserList.roleParent")}</option>
            <option value="VOCAL">{t("UserList.roleVocal")}</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            style={{ padding: 8 }}
          >
            <option value="">{t("UserList.filterStatus")}</option>
            <option value="active">{t("UserList.statusActive")}</option>
            <option value="inactive">{t("UserList.statusInactive")}</option>
          </select>
          <button type="submit">{t("UserList.applyFilters")}</button>
        </form>
        {loading && <p>{t("UserList.loading")}</p>}
        {error && <p>{error}</p>}
        <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>{t("UserList.name")}</th>
              <th style={{ textAlign: "left", padding: 8 }}>{t("UserList.email")}</th>
              <th style={{ textAlign: "left", padding: 8 }}>{t("UserList.role")}</th>
              <th style={{ textAlign: "left", padding: 8 }}>{t("UserList.status")}</th>
              <th style={{ padding: 8 }}>{t("UserList.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderTop: "1px solid #e5e7eb" }}>
                <td style={{ padding: 8 }}>{user.first_name} {user.last_name}</td>
                <td style={{ padding: 8 }}>{user.email}</td>
                <td style={{ padding: 8 }}>
                  <select
                    value={updates[user.id]?.role || user.role}
                    onChange={(e) =>
                      setUpdates({
                        ...updates,
                        [user.id]: {
                          role: e.target.value,
                          is_active: updates[user.id]?.is_active ?? user.is_active ?? true,
                        },
                      })
                    }
                    style={{ padding: 4 }}
                  >
                    <option value="DIRECTOR">{t("UserList.roleDirector")}</option>
                    <option value="MAESTRO_TITULAR">{t("UserList.roleHomeroom")}</option>
                    <option value="MAESTRO_ITINERANTE">{t("UserList.roleSpecialist")}</option>
                    <option value="PADRE">{t("UserList.roleParent")}</option>
                    <option value="VOCAL">{t("UserList.roleVocal")}</option>
                  </select>
                </td>
                <td style={{ padding: 8 }}>
                  <select
                    value={(updates[user.id]?.is_active ?? user.is_active ?? true) ? "active" : "inactive"}
                    onChange={(e) =>
                      setUpdates({
                        ...updates,
                        [user.id]: {
                          role: updates[user.id]?.role || user.role,
                          is_active: e.target.value === "active",
                        },
                      })
                    }
                    style={{ padding: 4 }}
                  >
                    <option value="active">{t("UserList.statusActive")}</option>
                    <option value="inactive">{t("UserList.statusInactive")}</option>
                  </select>
                </td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => saveRow(user.id)} disabled={savingId === user.id}>
                    {savingId === user.id ? t("UserList.saving") : t("UserList.save")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </RequireRole>
  );
}
