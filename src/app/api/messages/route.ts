import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://ceo.terminal.markets/v1/messages", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 30 },
    });

    if (!response.ok) throw new Error(`API responded with status ${response.status}`);
    const data = await response.json();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Messages API Error:", error);
    return NextResponse.json(
      { success: false, data: [], error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
