"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "../context/admin-auth-context";
import { AdminNav } from "./AdminNav";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { status } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || status === "unauthorized") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <main style={{ padding: 24 }}>
        <p style={{ color: "#667085", fontSize: 14 }}>Yükleniyor…</p>
      </main>
    );
  }

  return (
    <>
      <AdminNav />
      <main style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>{children}</main>
    </>
  );
}
