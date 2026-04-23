"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#gap-engine",   label: "Gap Engine"   },
  { href: "#pricing",      label: "Pricing"      },
];

export function LandingMobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 z-[60]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-64 bg-[#0d1018] border-l border-white/10 z-[70] flex flex-col transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-end px-4 py-4 border-b border-white/8">
          <button
            onClick={() => setOpen(false)}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="px-4 pb-8 space-y-3 border-t border-white/8 pt-4">
          <Link href="/sign-in" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full text-base font-medium text-slate-300 hover:text-white">
              Sign in
            </Button>
          </Link>
          <Link href="/sign-up" onClick={() => setOpen(false)}>
            <Button className="w-full font-semibold bg-indigo-600 hover:bg-indigo-700 text-white">
              Get started free
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
