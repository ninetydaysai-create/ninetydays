import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Start your transition today</h1>
          <p className="text-slate-400 mt-2">
            Free resume analysis · No credit card required
          </p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
