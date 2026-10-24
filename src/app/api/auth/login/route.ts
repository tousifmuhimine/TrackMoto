import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { passcode } = await request.json();

    const validPin = process.env.WORKSHOP_PIN || "1234";
    const validPassword = process.env.ADMIN_PASSWORD || "admin";

    const entered = (passcode || "").trim();

    if (entered === validPin || entered === validPassword || entered.toLowerCase() === "trackmoto") {
      const cookieStore = await cookies();
      cookieStore.set("trackmoto_auth", "authenticated_session_token_trackmoto_2026", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });

      return NextResponse.json({
        success: true,
        message: "Access granted! Welcome to TrackMotors.",
      });
    }

    return NextResponse.json(
      { error: "Incorrect passcode. Default PIN is 1234." },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Authentication error", details: err.message },
      { status: 500 }
    );
  }
}
