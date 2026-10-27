import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { passcode } = await request.json();

    const validPassword = process.env.ADMIN_PASSWORD || "carboneight1122@";
    const entered = (passcode || "").trim();

    if (entered === validPassword) {
      const cookieStore = await cookies();
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax" as const,
        maxAge: 60 * 60 * 24 * 365 * 10, // 10 years (permanent)
        path: "/",
      };
      cookieStore.set("trackmoto_auth", "authenticated_session_token_trackmoto_2026", cookieOptions);
      cookieStore.set("carbon8_auth", "authenticated_session_token_carbon8_2026", cookieOptions);

      return NextResponse.json({
        success: true,
        message: "Access granted! Welcome to Carbon 8.",
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
