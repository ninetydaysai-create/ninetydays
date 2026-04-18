import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const { userId } = await auth();
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ninetydays.ai";

  if (!code || !userId) {
    return NextResponse.redirect(`${appUrl}/portfolio?github_error=1`);
  }

  // Verify state matches the userId to prevent CSRF
  if (state !== userId) {
    return NextResponse.redirect(`${appUrl}/portfolio?github_error=1`);
  }

  // Exchange code for access token
  let accessToken: string | undefined;
  try {
    const tokenRes = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${appUrl}/api/auth/github/callback`,
        }),
      }
    );

    const tokenData = (await tokenRes.json()) as { access_token?: string };
    accessToken = tokenData.access_token;
  } catch {
    return NextResponse.redirect(`${appUrl}/portfolio?github_error=1`);
  }

  if (!accessToken) {
    return NextResponse.redirect(`${appUrl}/portfolio?github_error=1`);
  }

  // Fetch GitHub user info
  let githubLogin = "";
  try {
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "NinetyDays/1.0",
        Accept: "application/vnd.github.v3+json",
      },
    });
    const githubUser = (await userRes.json()) as { login?: string };
    githubLogin = githubUser.login ?? "";
  } catch {
    // Non-fatal — we still have the token
  }

  // Mark portfolio as GitHub linked
  await db.portfolio
    .updateMany({
      where: { userId },
      data: { githubLinked: true },
    })
    .catch(() => {});

  // Build redirect with cookies
  const response = NextResponse.redirect(
    `${appUrl}/portfolio?github_connected=1`
  );

  response.cookies.set("github_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });

  if (githubLogin) {
    response.cookies.set("github_username", githubLogin, {
      httpOnly: false, // readable by client JS for display purposes
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60,
      path: "/",
    });
  }

  return response;
}
