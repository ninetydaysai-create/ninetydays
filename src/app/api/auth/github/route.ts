import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/sign-in`
    );
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "GitHub OAuth not configured. Set GITHUB_CLIENT_ID in .env.local",
      },
      { status: 503 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    scope: "public_repo read:user",
    state: userId, // use userId as state for CSRF verification
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`,
  });

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`
  );
}
