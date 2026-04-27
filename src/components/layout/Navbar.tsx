"use client";

import { useState } from "react";
import { UserButton, useClerk } from "@clerk/nextjs";
import { Zap, LogOut, Menu, X, Settings, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { nav } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="md:hidden border-b bg-background px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <span className="text-sm font-bold">NinetyDays</span>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell compact />
          <UserButton />
          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-[60]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className={cn(
          "md:hidden fixed inset-y-0 left-0 w-72 bg-[#0b0e14] z-[70] flex flex-col transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Drawer header */}
        <div className="px-5 pt-6 pb-4 flex items-center justify-between border-b border-white/8 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">NinetyDays</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {nav.map(({ href, label, icon: Icon, color }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-[0.925rem] font-medium transition-all duration-150",
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                  active ? "bg-indigo-500/10" : "bg-white/5"
                )}>
                  <Icon className={cn("h-4 w-4", active ? color : "text-slate-400")} />
                </div>
                <span className="flex-1">{label}</span>
                {active && <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom — settings + sign out */}
        <div className="px-3 pb-6 pt-3 border-t border-white/8 space-y-1 shrink-0">
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3 text-[0.925rem] font-medium transition-all duration-150",
              pathname === "/settings"
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )}
          >
            <div className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
              pathname === "/settings" ? "bg-slate-500/10" : "bg-white/5"
            )}>
              <Settings className="h-4 w-4 text-slate-400" />
            </div>
            Settings
          </Link>

          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 transition-colors text-left group"
          >
            <div className="h-8 w-8 rounded-lg bg-white/5 group-hover:bg-red-500/10 flex items-center justify-center shrink-0 transition-colors">
              <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-400 transition-colors" />
            </div>
            <span className="text-[0.925rem] text-slate-400 group-hover:text-red-400 font-medium transition-colors">
              Sign out
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
