import { NextResponse } from "next/server";

interface CycleEntry {
  cycle_id: number;
  cycle_timestamp: string;
  ceo_slug: string;
  avg_pnl_percent: number;
  total_pnl_usd: number;
  total_value_usd: number;
}

interface Cycle {
  id: number;
  started_at: string;
}

export async function GET() {
  try {
    const cyclesRes = await fetch("https://ceo.terminal.markets/v1/cycles", {
      headers: { "Content-Type": "application/json" },
    });
    if (!cyclesRes.ok) throw new Error(`Cycles API: ${cyclesRes.status}`);
    const cycles: Cycle[] = await cyclesRes.json();

    const scoreboards = await Promise.all(
      cycles.map(async (cycle) => {
        const res = await fetch(
          `https://ceo.terminal.markets/v1/scoreboard?cycle_id=${cycle.id}`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (!res.ok) return [];
        return (await res.json()) as CycleEntry[];
      })
    );

    const snapshots: Array<{ timestamp: number; data: Record<string, number> }> = [];

    for (let i = 0; i < cycles.length; i++) {
      const entries = scoreboards[i];
      if (!entries || entries.length === 0) continue;

      const ts = new Date(entries[0].cycle_timestamp).getTime();
      if (isNaN(ts)) continue;

      const data: Record<string, number> = {};
      for (const entry of entries) {
        data[entry.ceo_slug] = entry.total_value_usd;
      }
      snapshots.push({ timestamp: ts, data });
    }

    snapshots.sort((a, b) => a.timestamp - b.timestamp);

    return NextResponse.json({ success: true, data: snapshots });
  } catch (error) {
    console.error("PnL History API Error:", error);
    return NextResponse.json(
      { success: false, data: [], error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
