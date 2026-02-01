"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="redirect-shell">
      <p>Redirigiendo...</p>
      <style jsx>{`
        .redirect-shell {
          min-height: 100vh;
          display: grid;
          place-items: center;
          color: #cbd5f5;
        }
      `}</style>
    </main>
  );
}
