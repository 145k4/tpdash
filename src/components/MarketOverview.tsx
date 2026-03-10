"use client";

import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TokenMarketData {
  priceUsd: string;
  holderCount: number;
  priceEth: string;
  "15m": TimeframeData;
  "1h": TimeframeData;
  "4h": TimeframeData;
  "1d": TimeframeData;
  all: TimeframeData;
}

interface TimeframeData {
  priceChangePercent: number;
  volumeEth: string;
  volumeUsd: string;
  buyCount: number;
  sellCount: number;
  sparkline: string[];
}

interface Token {
  tokenAddress: string;
  symbol: string;
  name: string;
  type: string;
  marketData: TokenMarketData;
  image: string;
  description: string;
  funFacts: string[];
  reaped: boolean;
}

interface MarketData {
  cycle_id: number;
  captured_at: string;
  overview: {
    eth_price: {
      priceUsd: number;
    };
    tracked_token_count: number;
    top_tokens_by_price_usd: Token[];
    launch_schedule: unknown[];
    reap_schedule: unknown[];
  };
}

const TOKEN_COLORS: string[] = [
  "#f39c12", "#e74c3c", "#2ecc71", "#3498db",
  "#9b59b6", "#1abc9c", "#e67e22", "#ec407a",
  "#26c6da", "#ff7043",
];

if (typeof window !== "undefined") {
  const preloaded = new Set<string>();
  function preloadImg(src: string) {
    if (preloaded.has(src)) return;
    preloaded.add(src);
    const img = new Image();
    img.src = src;
  }
  (window as unknown as Record<string, unknown>).__preloadTokenImg = preloadImg;
}

function formatPrice(n: number): string {
  if (n === 0) return "$0";
  if (n < 0.000001) return `$${n.toExponential(2)}`;
  if (n < 0.01) return `$${n.toFixed(6)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

function CustomTooltip({ active, payload, label }: Record<string, unknown>) {
  if (!active || !payload) return null;
  const entries = payload as Array<{ name: string; value: number; color: string }>;
  return (
    <div className="bg-[#1a1a1a]/95 backdrop-blur-sm border border-[#333] rounded-xl p-3 shadow-xl">
      <p className="text-[#888] text-xs mb-2 font-bold">{label as string}</p>
      {entries
        .filter((e) => e.value !== undefined && e.value !== null)
        .sort((a, b) => b.value - a.value)
        .map((entry) => (
          <div key={entry.name} className="flex items-center justify-between gap-4 text-xs py-0.5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-[#aaa] font-bold">{entry.name}</span>
            </div>
            <span className="font-black text-white">{formatPrice(entry.value)}</span>
          </div>
        ))}
    </div>
  );
}

export default function MarketOverview() {
  const [market, setMarket] = useState<MarketData | null>(null);

  useEffect(() => {
    async function fetchMarket() {
      try {
        const res = await fetch("/api/market");
        const json = await res.json();
        if (json.success && json.data) setMarket(json.data);
      } catch (e) {
        console.error("Failed to fetch market:", e);
      }
    }
    fetchMarket();
    const interval = setInterval(fetchMarket, 30000);
    return () => clearInterval(interval);
  }, []);

  const tokens = useMemo(() => {
    if (!market) return [];
    return market.overview.top_tokens_by_price_usd.filter(
      (t) => !t.reaped && parseFloat(t.marketData.priceUsd) > 0
    );
  }, [market]);

  useEffect(() => {
    const preload = (window as unknown as Record<string, (src: string) => void>).__preloadTokenImg;
    if (preload) tokens.forEach((t) => preload(t.image));
  }, [tokens]);

  const chartData = useMemo(() => {
    if (tokens.length === 0) return [];

    const maxLen = Math.max(...tokens.map((t) => t.marketData["1d"].sparkline.length));
    if (maxLen < 2) return [];

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const points: Array<Record<string, unknown>> = [];

    for (let i = 0; i < maxLen; i++) {
      const time = now - dayMs + (i / (maxLen - 1)) * dayMs;
      const hours = new Date(time).getHours();
      const mins = new Date(time).getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const h = hours % 12 || 12;
      const label = `${h}:${mins.toString().padStart(2, "0")} ${ampm}`;

      const point: Record<string, unknown> = { time: label };
      for (const token of tokens) {
        const spark = token.marketData["1d"].sparkline;
        const idx = Math.floor((i / (maxLen - 1)) * (spark.length - 1));
        const val = parseFloat(spark[idx]);
        if (!isNaN(val) && val > 0) {
          point[token.symbol] = val;
        }
      }
      points.push(point);
    }

    return points;
  }, [tokens]);

  if (!market || chartData.length === 0) return null;

  const { overview } = market;

  const tickCount = 5;
  const tickIndices = Array.from({ length: tickCount }, (_, i) =>
    Math.floor((i / (tickCount - 1)) * (chartData.length - 1))
  );
  const ticks = tickIndices.map((i) => chartData[i].time as string);

  return (
    <div data-panel="market" className="panel-ethereal panel-ethereal-delay-2 rounded-[20px] border border-[#2a2a2a] overflow-hidden flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#111] relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">Market</span>
          <span className="text-[10px] text-[#555]">{overview.tracked_token_count} tokens</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[8px] font-mono text-[#2a3a4a] eva-ticker-dot" style={{ animationDelay: "-1.2s" }}>FEED:LIVE</span>
            <div className="w-6 h-[3px] bg-[#1a1a1a] rounded overflow-hidden">
              <div className="eva-meter-bar bg-[#9b59b6]/40" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#555]">ETH</span>
            <span className="text-[10px] text-white font-bold">
              ${overview.eth_price.priceUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[350px] px-2 py-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 15, right: 55, left: 10, bottom: 15 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={6}
              fontWeight={700}
              ticks={ticks}
              label={{ value: "Time (24h)", position: "bottom", offset: -2, fill: "rgba(255,255,255,0.25)", fontSize: 9 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => formatPrice(v)}
              dx={-3}
              fontWeight={700}
              scale="log"
              domain={["auto", "auto"]}
              allowDataOverflow
              width={70}
              label={{ value: "Price (USD)", angle: -90, position: "left", offset: -5, fill: "rgba(255,255,255,0.25)", fontSize: 9 }}
            />
            <Tooltip content={<CustomTooltip />} />
            {tokens.map((token, i) => (
              <Line
                key={token.symbol}
                type="monotone"
                dataKey={token.symbol}
                name={token.symbol}
                stroke={TOKEN_COLORS[i % TOKEN_COLORS.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, strokeWidth: 1 }}
                label={(props: Record<string, unknown>) => {
                  const { x, y, index } = props as { x: number; y: number; index: number };
                  if (index !== chartData.length - 1) return <g key={`e-${token.symbol}-${index}`} />;
                  const size = 28;
                  const color = TOKEN_COLORS[i % TOKEN_COLORS.length];
                  return (
                    <g key={`icon-${token.symbol}`}>
                      <circle cx={x} cy={y} r={size / 2 + 2} fill={color} style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
                      <image
                        href={token.image}
                        x={x - size / 2}
                        y={y - size / 2}
                        width={size}
                        height={size}
                        style={{ imageRendering: "auto", clipPath: "circle(50%)" }}
                      />
                    </g>
                  );
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom bar */}
      <div className="px-4 py-1.5 bg-[#111] border-t border-[#1a1a1a] flex items-center gap-2 relative z-10">
        <div className="flex -space-x-1">
          {tokens.slice(0, 6).map((t, i) => (
            <img key={t.symbol} src={t.image} alt="" className="w-4 h-4 rounded-full border border-[#0a0a0a]" style={{ zIndex: 6 - i }} />
          ))}
        </div>
        <span className="text-[10px] text-[#333]">{tokens.length} active</span>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-[7px] font-mono text-[#333]">VOL</span>
            <div className="w-6 h-[3px] bg-[#1a1a1a] rounded overflow-hidden">
              <div className="eva-meter-bar bg-[#9b59b6]/40" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[7px] font-mono text-[#333]">MKT</span>
            <div className="w-6 h-[3px] bg-[#1a1a1a] rounded overflow-hidden">
              <div className="eva-meter-bar-2 bg-[#3498db]/40" />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="led-2 w-1.5 h-1.5 rounded-full bg-[#2ecc71]" style={{ boxShadow: "0 0 4px #2ecc71" }} />
            <span className="led-3 w-1.5 h-1.5 rounded-full bg-[#3498db]" style={{ boxShadow: "0 0 4px #3498db" }} />
            <span className="led-1 w-1.5 h-1.5 rounded-full bg-[#9b59b6]" style={{ boxShadow: "0 0 4px #9b59b6" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
