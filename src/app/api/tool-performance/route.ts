import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://ceo.terminal.markets/v1/scoreboard/total", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 30 },
    });

    if (!res.ok) throw new Error(`API responded with status ${res.status}`);
    const data = await res.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Tool Performance API Error:", error);
    return NextResponse.json(
      { success: false, data: [], error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
