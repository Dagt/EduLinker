"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

const publicPrefixes = ["/reset-password"];
const publicRoutes = new Set(["/login"]);

function isPublicRoute(pathname: string) {
  if (publicRoutes.has(pathname)) return true;
  return publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}

export default function ClientGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname) return;
    const token = getToken();
    const publicRoute = isPublicRoute(pathname);

    if (!token && !publicRoute) {
      router.replace("/login");
      return;
    }

    if (token && pathname === "/login") {
      router.replace("/dashboard");
    }
  }, [pathname, router]);

  return <>{children}</>;
}
