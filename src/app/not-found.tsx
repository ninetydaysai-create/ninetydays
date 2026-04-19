import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-6">
          <Zap className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-6xl font-black text-white mb-3">404</h1>
        <p className="text-xl font-semibold text-white mb-2">Page not found</p>
        <p className="text-slate-400 mb-8">
          This page doesn&apos;t exist or was moved. Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white">
              <ArrowLeft className="h-4 w-4" />
              Go to dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
