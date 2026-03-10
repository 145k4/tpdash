import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://ceo.terminal.markets/v1/scoreboard", {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 30 },
    });

    if (!res.ok) throw new Error(`API responded with status ${res.status}`);
    const entries = await res.json();

    const results: Record<string, {
      ceo_slug: string;
      total_pnl_usd: number;
      total_value_usd: number;
      avg_pnl_percent: number;
    }> = {};

    for (const entry of entries) {
      if (entry.ceo_slug) {
        results[entry.ceo_slug] = {
          ceo_slug: entry.ceo_slug,
          total_pnl_usd: entry.total_pnl_usd ?? 0,
          total_value_usd: entry.total_value_usd ?? 0,
          avg_pnl_percent: entry.avg_pnl_percent ?? 0,
        };
      }
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("Vaults API Error:", error);
    return NextResponse.json(
      { success: false, data: {}, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
