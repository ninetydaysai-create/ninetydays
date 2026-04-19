import { Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { ReferralTracker } from "@/components/shared/ReferralTracker";
import { OnboardingTour } from "@/components/shared/OnboardingTour";
import { PosthogProvider } from "@/components/providers/PosthogProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <PosthogProvider>
      <div className="flex min-h-screen bg-[#0b0e14]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-8 overflow-auto max-w-[1100px] mx-auto w-full">{children}</main>
        </div>
        <Suspense>
          <ReferralTracker />
        </Suspense>
        <OnboardingTour />
      </div>
    </PosthogProvider>
  );
}
