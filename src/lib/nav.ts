import {
  LayoutDashboard, FileText, Target, Map, Briefcase, MessageSquare,
  ExternalLink, GitFork, Kanban, ScanSearch, Mail, FileEdit, Bot,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
}

export const nav: NavItem[] = [
  { href: "/dashboard",    label: "Dashboard",     icon: LayoutDashboard, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  { href: "/mentor",       label: "AI Mentor",     icon: Bot,             color: "text-violet-400", bg: "bg-violet-500/10" },
  { href: "/resume",       label: "Resume",        icon: FileText,        color: "text-blue-400",   bg: "bg-blue-500/10"   },
  { href: "/gaps",         label: "Gap Engine",    icon: Target,          color: "text-red-400",    bg: "bg-red-500/10"    },
  { href: "/roadmap",      label: "Roadmap",       icon: Map,             color: "text-emerald-400",bg: "bg-emerald-500/10"},
  { href: "/interview",    label: "Interview Prep",icon: MessageSquare,   color: "text-purple-400", bg: "bg-purple-500/10" },
  { href: "/job-match",    label: "Job Match",     icon: ScanSearch,      color: "text-pink-400",   bg: "bg-pink-500/10"   },
  { href: "/jobs",         label: "Job Tracker",   icon: Kanban,          color: "text-orange-400", bg: "bg-orange-500/10" },
  { href: "/outreach",     label: "Cold Outreach", icon: Mail,            color: "text-rose-400",   bg: "bg-rose-500/10"   },
  { href: "/cover-letter", label: "Cover Letter",  icon: FileEdit,        color: "text-teal-400",   bg: "bg-teal-500/10"   },
  { href: "/linkedin",     label: "LinkedIn",      icon: ExternalLink,    color: "text-sky-400",    bg: "bg-sky-500/10"    },
  { href: "/portfolio",    label: "Portfolio",     icon: Briefcase,       color: "text-amber-400",  bg: "bg-amber-500/10"  },
  { href: "/github",       label: "GitHub",        icon: GitFork,         color: "text-slate-300",  bg: "bg-slate-500/10"  },
];
