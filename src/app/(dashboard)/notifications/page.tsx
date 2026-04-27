"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Zap, CreditCard, AlertTriangle, Gift, Clock, TrendingUp, Trophy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

const TYPE_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  sprint_activated:   { icon: Zap,           color: "text-indigo-400",  bg: "bg-indigo-500/10"  },
  beta_activated:     { icon: Zap,           color: "text-violet-400",  bg: "bg-violet-500/10"  },
  payment_failed:     { icon: CreditCard,    color: "text-red-400",     bg: "bg-red-500/10"     },
  payment_past_due:   { icon: AlertTriangle, color: "text-amber-400",   bg: "bg-amber-500/10"   },
  refund_processed:   { icon: CreditCard,    color: "text-slate-400",   bg: "bg-slate-500/10"   },
  referral_converted: { icon: Gift,          color: "text-emerald-400", bg: "bg-emerald-500/10" },
  sprint_expired:     { icon: Clock,         color: "text-orange-400",  bg: "bg-orange-500/10"  },
  falling_behind:     { icon: TrendingUp,    color: "text-rose-400",    bg: "bg-rose-500/10"    },
  milestone:          { icon: Trophy,        color: "text-yellow-400",  bg: "bg-yellow-500/10"  },
};

function getTypeMeta(type: string) {
  return TYPE_META[type] ?? { icon: Bell, color: "text-slate-400", bg: "bg-slate-500/10" };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function markAllRead() {
    setMarkingRead(true);
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setMarkingRead(false);
    }
  }

  useEffect(() => { fetchNotifications(); }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
          <p className="text-slate-400 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            disabled={markingRead}
            className="gap-2 border-white/10 text-slate-300 hover:text-white hover:bg-white/5"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-slate-500">
          <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center">
            <Bell className="h-7 w-7 opacity-40" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-slate-400">No notifications yet</p>
            <p className="text-sm text-slate-600 mt-1">We&apos;ll notify you about billing, milestones, and when you&apos;re falling behind.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const { icon: Icon, color, bg } = getTypeMeta(n.type);
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${
                  !n.read
                    ? "bg-white/[0.04] border-white/10 border-l-2 border-l-indigo-500"
                    : "bg-white/[0.02] border-white/5"
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-semibold leading-snug ${!n.read ? "text-white" : "text-slate-300"}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="h-2 w-2 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-xs text-slate-600 mt-1.5">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
