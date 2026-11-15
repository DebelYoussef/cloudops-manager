import { Suspense } from "react";
import { Sidebar } from "@/components/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Suspense nécessaire : usePathname() suspend sur les routes dynamiques (ex. /servers/[id]) avec Cache Components */}
      <Suspense
        fallback={<div className="h-14 border-b bg-sidebar md:h-auto md:w-60 md:border-r" />}
      >
        <Sidebar />
      </Suspense>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
