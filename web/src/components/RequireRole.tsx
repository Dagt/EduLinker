"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { getMe } from "@/lib/api";
import { normalizeRole, setUserRole } from "@/lib/roles";
import { useTranslation } from "react-i18next";
import "@/i18n";

type RequireRoleProps = {
  allowed: string[];
  children: ReactNode;
};

export default function RequireRole({ allowed, children }: RequireRoleProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [status, setStatus] = useState<"loading" | "allowed" | "unauthorized">("loading");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadRole() {
      try {
        const me = await getMe(token);
        if (me?.role) {
          setUserRole(me.role);
          const normalized = normalizeRole(me.role);
          const allowedNormalized = allowed.map(normalizeRole);
          if (allowedNormalized.includes(normalized)) {
            setStatus("allowed");
            return;
          }
        }
        setStatus("unauthorized");
      } catch {
        setStatus("unauthorized");
      }
    }

    loadRole();
  }, [allowed, router]);

  if (status === "loading") return <p>{t("Auth.loading")}</p>;
  if (status === "unauthorized") return <p>{t("Auth.unauthorized")}</p>;

  return <>{children}</>;
}
