import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { passcode } = await request.json();

    const validPassword = process.env.ADMIN_PASSWORD || "carboneight1122@";
    const entered = (passcode || "").trim();

    if (entered === validPassword) {
      const cookieStore = await cookies();
      cookieStore.set("trackmoto_auth", "authenticated_session_token_trackmoto_2026", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365 * 10, // 10 years (permanent)
        path: "/",
      });

      return NextResponse.json({
        success: true,
        message: "Access granted! Welcome to TrackMotors.",
      });
    }

    return NextResponse.json(
      { error: "Incorrect password. Please try again." },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Authentication error", details: err.message },
      { status: 500 }
    );
  }
}
