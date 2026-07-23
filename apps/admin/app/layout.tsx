import type { Metadata } from "next";
import { AdminAuthProvider } from "../src/context/admin-auth-context";

export const metadata: Metadata = {
  title: "HukukAI Admin",
  description: "HukukAI yönetim paneli",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <AdminAuthProvider>{children}</AdminAuthProvider>
      </body>
    </html>
  );
}
