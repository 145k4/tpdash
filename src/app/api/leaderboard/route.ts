import { NextResponse } from "next/server";

export interface LeaderboardEntry {
  rank: number;
  vaultAddress: string;
  ownerAddress: string;
  nftId: string;
  nftName: string;
  realizedPnlUsd: number;
  unrealizedPnlUsd: number;
  totalPnlUsd: number;
  totalPnlPercent: number;
  paused: boolean;
}

export interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
  timestamp: number;
  error?: string;
}

export async function GET() {
  try {
    // Fetch top 200, then take the bottom 5 (ranks 196-200)
    const response = await fetch(
      "https://api.terminal.markets/api/v1/leaderboard?limit=200&sortBy=total_pnl_usd",
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const json = await response.json();

    const allItems: LeaderboardEntry[] = json.items.map((item: {
      rank: number;
      vaultAddress: string;
      ownerAddress: string;
      nftId: string;
      nftName: string;
      realizedPnlUsd: number;
      unrealizedPnlUsd: number;
      totalPnlUsd: number;
      totalPnlPercent: number;
      paused: boolean;
    }) => ({
      rank: item.rank,
      vaultAddress: item.vaultAddress,
      ownerAddress: item.ownerAddress,
      nftId: item.nftId,
      nftName: item.nftName,
      realizedPnlUsd: item.realizedPnlUsd,
      unrealizedPnlUsd: item.unrealizedPnlUsd,
      totalPnlUsd: item.totalPnlUsd,
      totalPnlPercent: item.totalPnlPercent,
      paused: item.paused,
    }));

    // Filter out paused traders, take the top 5
    const active = allItems.filter((item: LeaderboardEntry) => !item.paused);
    const data = active
      .slice(0, 5)
      .map((item: LeaderboardEntry, index: number) => ({
        ...item,
        rank: index + 1,
      }));

    return NextResponse.json({
      success: true,
      data,
      timestamp: Date.now(),
    } as LeaderboardResponse);
  } catch (error) {
    console.error("Leaderboard API Error:", error);
    return NextResponse.json(
      {
        success: false,
        data: [],
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : "Unknown error",
      } as LeaderboardResponse,
      { status: 500 }
    );
  }
}
