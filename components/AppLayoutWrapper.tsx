"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { ReadyGate } from "@/components/ReadyGate";

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/dang-nhap";

  if (isLoginPage) {
    return <main className="min-h-screen w-full">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <ReadyGate>{children}</ReadyGate>
      </main>
    </>
  );
}

