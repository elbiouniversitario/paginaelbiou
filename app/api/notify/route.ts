import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.CALLMEBOT_API_KEY;
  const phone  = process.env.WPP_ADMIN_NUMBER;

  if (!apiKey || !phone) {
    return NextResponse.json({ ok: false, reason: "not_configured" }, { status: 200 });
  }

  try {
    const { message } = await req.json() as { message?: string };
    if (!message) return NextResponse.json({ ok: false }, { status: 400 });

    await fetch(
      `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${apiKey}`
    ).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
