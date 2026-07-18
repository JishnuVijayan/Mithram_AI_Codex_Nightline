"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("mithram_user_id");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-stone-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/dashboard" className="text-lg font-semibold">
            Mithram AI
          </Link>
          <nav className="flex items-center gap-4 text-sm text-zinc-600">
            <Link href="/parents/new" className="hover:text-zinc-950">
              Add Parent
            </Link>
            <Link href="/subscription" className="hover:text-zinc-950">
              Subscription
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-950"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
