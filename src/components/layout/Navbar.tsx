"use client";

import { UserButton, useClerk } from "@clerk/nextjs";
import { Zap, LogOut } from "lucide-react";
import Link from "next/link";
import { NotificationBell } from "@/components/shared/NotificationBell";

export function Navbar() {
  const { signOut } = useClerk();

  return (
    <header className="md:hidden border-b bg-background px-4 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-primary" />
        <span className="text-sm font-bold">NinetyDays</span>
      </Link>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <UserButton />
        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
