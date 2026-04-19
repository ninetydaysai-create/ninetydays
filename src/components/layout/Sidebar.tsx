"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  FileText,
  Target,
  Map,
  Briefcase,
  MessageSquare,
  ExternalLink,
  GitFork,
  Kanban,
  Settings,
  Zap,
  ChevronRight,
  ScanSearch,
  Mail,
  FileEdit,
  Bot,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/shared/NotificationBell";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { href: "/mentor", label: "AI Mentor", icon: Bot, color: "text-violet-400", bg: "bg-violet-500/10" },
  { href: "/resume", label: "Resume", icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
  { href: "/gaps", label: "Gap Engine", icon: Target, color: "text-red-400", bg: "bg-red-500/10" },
  { href: "/roadmap", label: "Roadmap", icon: Map, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { href: "/interview", label: "Interview Prep", icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-500/10" },
  { href: "/job-match", label: "Job Match", icon: ScanSearch, color: "text-pink-400", bg: "bg-pink-500/10" },
  { href: "/jobs", label: "Job Tracker", icon: Kanban, color: "text-orange-400", bg: "bg-orange-500/10" },
  { href: "/outreach", label: "Cold Outreach", icon: Mail, color: "text-rose-400", bg: "bg-rose-500/10" },
  { href: "/cover-letter", label: "Cover Letter", icon: FileEdit, color: "text-teal-400", bg: "bg-teal-500/10" },
  { href: "/linkedin", label: "LinkedIn", icon: ExternalLink, color: "text-sky-400", bg: "bg-sky-500/10" },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase, color: "text-amber-400", bg: "bg-amber-500/10" },
  { href: "/github", label: "GitHub", icon: GitFork, color: "text-slate-300", bg: "bg-slate-500/10" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { openUserProfile, signOut } = useClerk();

  return (
    <aside className="hidden md:flex flex-col w-[260px] h-screen sticky top-0 shrink-0 bg-[#0b0e14] text-white overflow-y-auto">
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
                "flex items-center gap-3 rounded-xl px-3 py-3 text-[0.925rem] font-medium transition-all duration-150 group",
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-all", active ? "bg-indigo-500/10" : "bg-white/5 group-hover:bg-white/8")}>
                <Icon className={cn("h-4 w-4", active ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-300")} />
              </div>
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — settings, notifications, account */}
      <div className="px-3 pb-5 pt-3 border-t border-white/5 space-y-1 mt-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-3 text-[0.925rem] font-medium transition-all duration-150",
            pathname === "/settings"
              ? "bg-white/10 text-white"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
          )}
        >
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", pathname === "/settings" ? "bg-slate-500/10" : "bg-white/5")}>
            <Settings className={cn("h-4 w-4", pathname === "/settings" ? "text-slate-300" : "text-slate-400")} />
          </div>
          Settings
        </Link>

        <div className="flex items-center gap-3 rounded-xl px-3 py-3 text-[0.925rem] font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all duration-150 cursor-pointer">
          <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 relative">
            <NotificationBell />
          </div>
          <span>Notifications</span>
        </div>

        <button
          onClick={() => openUserProfile()}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left"
        >
          <UserButton />
          <span className="text-[0.925rem] text-slate-400 font-medium">Account</span>
        </button>

        <button
          onClick={() => signOut({ redirectUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer text-left group"
        >
          <div className="h-8 w-8 rounded-lg bg-white/5 group-hover:bg-red-500/10 flex items-center justify-center shrink-0 transition-colors">
            <LogOut className="h-4 w-4 text-slate-400 group-hover:text-red-400 transition-colors" />
          </div>
          <span className="text-[0.925rem] text-slate-400 group-hover:text-red-400 font-medium transition-colors">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
