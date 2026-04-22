import { Zap } from "lucide-react";
import Link from "next/link";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col">
      {/* Top nav */}
      <header className="h-16 border-b bg-white flex items-center px-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">NinetyDays</span>
        </Link>
      </header>
      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        {children}
      </div>
    </div>
  );
}
