import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back to NinetyDays</h1>
          <p className="text-slate-400 mt-2">Continue your transition journey</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
