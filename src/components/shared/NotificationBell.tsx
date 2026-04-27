"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const active = pathname === "/notifications";

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => setUnreadCount(d.unreadCount ?? 0))
      .catch(() => {});
  }, [pathname]); // refetch when navigating away from notifications page

  return (
    <Link
      href="/notifications"
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-3 text-[1.15rem] font-medium transition-all duration-150",
        active
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      )}
    >
      <div className={cn(
        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 relative",
        active ? "bg-slate-500/10" : "bg-white/5"
      )}>
        <Bell className={cn("h-5 w-5", active ? "text-slate-300" : "text-slate-400")} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-[1rem] px-1 rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>
      <span>Notifications</span>
    </Link>
  );
}
