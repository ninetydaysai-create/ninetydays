"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useClerk } from "@clerk/nextjs";
import { Settings, Zap, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { nav } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();
  const { openUserProfile, signOut } = useClerk();

  return (
    <aside className="hidden md:flex flex-col w-[280px] h-screen sticky top-0 shrink-0 bg-[#0b0e14] text-white overflow-y-auto">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">NinetyDays</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-1">
        {nav.map(({ href, label, icon: Icon, color, bg }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-[1.15rem] font-medium transition-all duration-150 group",
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-all", active ? "bg-indigo-500/10" : "bg-white/5 group-hover:bg-white/8")}>
                <Icon className={cn("h-5 w-5", active ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-300")} />
              </div>
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — settings, notifications, account */}
      <div className="px-3 pb-5 pt-3 border-t border-white/5 space-y-1 mt-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-3 text-[1.15rem] font-medium transition-all duration-150",
            pathname === "/settings"
              ? "bg-white/10 text-white"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
          )}
        >
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", pathname === "/settings" ? "bg-slate-500/10" : "bg-white/5")}>
            <Settings className={cn("h-5 w-5", pathname === "/settings" ? "text-slate-300" : "text-slate-400")} />
          </div>
          Settings
        </Link>

        <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-[1.15rem] font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all duration-150 cursor-pointer">
          <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 relative">
            <NotificationBell />
          </div>
          <span>Notifications</span>
        </div>

        <button
          onClick={() => openUserProfile()}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left"
        >
          <UserButton />
          <span className="text-[1.15rem] text-slate-400 font-medium">Account</span>
        </button>

        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer text-left group"
        >
          <div className="h-10 w-10 rounded-lg bg-white/5 group-hover:bg-red-500/10 flex items-center justify-center shrink-0 transition-colors">
            <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-400 transition-colors" />
          </div>
          <span className="text-[1.15rem] text-slate-400 group-hover:text-red-400 font-medium transition-colors">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
