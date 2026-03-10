"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Customized,
} from "recharts";
import { format } from "date-fns";

const GrassBackground = dynamic(() => import("./GrassBackground"), {
  ssr: false,
});

export interface CeoEntry {
  ceo_slug: string;
  ceo_name: string;
  provider: string;
  model: string;
  total_value_usd: number;
  total_pnl_usd: number;
  avg_pnl_percent: number;
  managed_vault_count: number;
}

export interface PnlSnapshot {
  timestamp: number;
  data: Record<string, number>;
}

interface LeaderboardChartProps {
  currentData: CeoEntry[];
  historicalData: PnlSnapshot[];
}

const CEO_AVATARS: Record<string, string> = {
  chatgpt: "/openai.png",
  claude: "/claude.png",
  gemini: "/gemini.png",
  grok: "/grok.png",
};

const CEO_COLORS: Record<string, string> = {
  chatgpt: "#2ecc71",
  claude: "#e74c3c",
  gemini: "#3498db",
  grok: "#f39c12",
};

const CEO_LOGOS: Record<string, { viewBox: string; path: string }> = {
  chatgpt: {
    viewBox: "0 0 16 16",
    path: "M14.949 6.547a3.94 3.94 0 0 0-.348-3.273 4.11 4.11 0 0 0-4.4-1.934A4.1 4.1 0 0 0 8.423.2 4.15 4.15 0 0 0 6.305.086a4.1 4.1 0 0 0-1.891.948 4.04 4.04 0 0 0-1.158 1.753 4.1 4.1 0 0 0-1.563.679A4 4 0 0 0 .554 4.72a3.99 3.99 0 0 0 .502 4.731 3.94 3.94 0 0 0 .346 3.274 4.11 4.11 0 0 0 4.402 1.933c.382.425.852.764 1.377.995.526.231 1.095.35 1.67.346 1.78.002 3.358-1.132 3.901-2.804a4.1 4.1 0 0 0 1.563-.68 4 4 0 0 0 1.14-1.253 3.99 3.99 0 0 0-.506-4.716m-6.097 8.406a3.05 3.05 0 0 1-1.945-.694l.096-.054 3.23-1.838a.53.53 0 0 0 .265-.455v-4.49l1.366.778q.02.011.025.035v3.722c-.003 1.653-1.361 2.992-3.037 2.996m-6.53-2.75a2.95 2.95 0 0 1-.36-2.01l.095.057L5.29 12.09a.53.53 0 0 0 .527 0l3.949-2.246v1.555a.05.05 0 0 1-.022.041L6.473 13.3c-1.454.826-3.311.335-4.15-1.098m-.85-6.94A3.02 3.02 0 0 1 3.07 3.949v3.785a.51.51 0 0 0 .262.451l3.93 2.237-1.366.779a.05.05 0 0 1-.048 0L2.585 9.342a2.98 2.98 0 0 1-1.113-4.094zm11.216 2.571L8.747 5.576l1.362-.776a.05.05 0 0 1 .048 0l3.265 1.86a3 3 0 0 1 1.173 1.207 2.96 2.96 0 0 1-.27 3.2 3.05 3.05 0 0 1-1.36.997V8.279a.52.52 0 0 0-.276-.445m1.36-2.015-.097-.057-3.226-1.855a.53.53 0 0 0-.53 0L6.249 6.153V4.598a.04.04 0 0 1 .019-.04L9.533 2.7a3.07 3.07 0 0 1 3.257.139c.474.325.843.778 1.066 1.303.223.526.289 1.103.191 1.664zM5.503 8.575 4.139 7.8a.05.05 0 0 1-.026-.037V4.049c0-.57.166-1.127.476-1.607s.752-.864 1.275-1.105a3.08 3.08 0 0 1 3.234.41l-.096.054-3.23 1.838a.53.53 0 0 0-.265.455zm.742-1.577 1.758-1 1.762 1v2l-1.755 1-1.762-1z",
  },
  claude: {
    viewBox: "0 0 1200 1200",
    path: "M233.96 800.21 468.64 668.54l3.95-11.44-3.95-6.36h-11.44l-39.22-2.42-134.09-3.62-116.3-4.83-112.67-6.04-28.35-5.96L0 592.75l2.74-17.48 23.84-16.03 34.15 2.98 75.46 5.15 113.24 7.81 82.15 4.83 121.69 12.64h19.33l2.74-7.81-6.6-4.83-5.15-4.83L302.39 495.79 175.54 411.87l-66.44-48.32-35.92-24.48-18.12-22.95-7.81-50.09 32.62-35.92 43.81 2.98 11.19 2.98 44.38 34.15 94.79 73.5 123.79 91.17 18.12 15.06 7.25-5.15 1.21-3.63-8.89-13.53-67.11-121.69-71.92-123.79-31.98-51.3-8.45-30.76c-2.98-12.64-5.15-23.27-5.15-36.24l37.13-50.42 20.07-6.6 49.53 6.6 20.86 18.12 30.76 70.39 49.85 110.82 77.32 150.68 22.63 44.7 12.08 41.4 4.83 12.64h7.81v-7.25l6.36-84.88 11.76-104.21 11.44-134.09 3.95-37.77 18.68-45.26 37.13-24.48 28.99 13.85 23.84 34.15-3.39 22.07-14.57 92.13-27.78 144.32-18.12 96.84h10.64l12.08-11.96 48.89-64.66 82.15-102.68 36.24-40.75 42.28-45.02 27.14-21.42h51.3l37.77 56.13-16.91 58-52.83 67.42-43.81 56.78-62.82 84.56-39.22 67.65 3.63 5.39 9.36-.9 142.38-30.2 76.67-13.85 91.62-15.56 41.4 19.33 4.53 19.65-16.27 40.19-97.85 24.16-114.77 22.95-170.9 40.43-2.09 1.53 2.42 2.98 76.96 7.25 32.94 1.77 80.62 0 150.12 11.19 39.22 25.93 23.52 31.73-3.95 24.16-60.4 30.76-81.5-19.33-190.24-45.26-65.46-16.27-9.02 0v5.4l54.36 53.15 99.62 89.96 124.75 115.97 6.36 28.67-16.03 22.63-16.91-2.42-109.57-82.27-42.28-37.13-95.76-80.62-6.36 0v8.45l22.07 32.3 116.54 175.17 5.99 53.72-8.38 17.48-30.2 10.55-33.18-5.96-68.22-95.76-70.39-107.85-56.78-98.57-6.96 3.95-33.53 360.88-15.73 18.43-36.24 13.85-30.2-22.95-16.03-37.13 16.03-73.37 19.33-95.76 15.71-76.14 14.17-94.55 8.38-31.48-.6-2.09-6.89.9-71.25 97.85-108.44 146.5-85.77 91.84-20.5 8.16-35.71-18.43 3.37-32.94 19.93-29.21 118.64-151.28 71.61-93.56 46.23-54.04-.3-7.87h-2.69l-315.34 204.72-56.13 7.19-24.27-22.63 2.99-37.13 11.53-12.15 94.88-65.22z",
  },
  gemini: {
    viewBox: "0 0 24 24",
    path: "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81",
  },
  grok: {
    viewBox: "0 0 24 24",
    path: "M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815",
  },
};

function formatUsd(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

export default function LeaderboardChart({
  currentData,
  historicalData,
}: LeaderboardChartProps) {
  const chartData = useMemo(() => {
    if (historicalData.length === 0) return [];

    const MINUTE = 60_000;
    const now = Date.now();
    const nowBucket = Math.floor(now / MINUTE) * MINUTE;

    const sorted = [...historicalData].sort((a, b) => a.timestamp - b.timestamp);
    const startBucket = Math.floor(sorted[0].timestamp / MINUTE) * MINUTE;

    const rawBuckets: Record<number, PnlSnapshot> = {};
    historicalData.forEach((snapshot) => {
      const bucketTime = Math.round(snapshot.timestamp / MINUTE) * MINUTE;
      rawBuckets[bucketTime] = snapshot;
    });

    const totalMinutes = Math.floor((nowBucket - startBucket) / MINUTE);
    const slugs = currentData.map((c) => c.ceo_slug);
    const points: Array<Record<string, unknown>> = [];
    const lastKnown: Record<string, number | undefined> = {};

    for (const snap of sorted) {
      if (snap.timestamp <= startBucket) {
        slugs.forEach((s) => { if (snap.data[s] !== undefined) lastKnown[s] = snap.data[s]; });
      }
    }

    for (let i = 0; i <= totalMinutes; i++) {
      const bucketTime = startBucket + i * MINUTE;
      const real = rawBuckets[bucketTime];

      if (real) {
        slugs.forEach((s) => { if (real.data[s] !== undefined) lastKnown[s] = real.data[s]; });
      }

      // Only emit points once we have at least one known value
      if (Object.values(lastKnown).some((v) => v !== undefined)) {
        points.push({
          timestamp: bucketTime,
          date: format(new Date(bucketTime), "MMM d h:mm a"),
          ...Object.fromEntries(slugs.map((s) => [s, lastKnown[s]])),
        });
      }
    }

    return points;
  }, [historicalData, currentData]);

  const { yDomain, yTicks } = useMemo(() => {
    if (chartData.length === 0) return { yDomain: [900, 1300] as [number, number], yTicks: [900, 1000, 1100, 1200, 1300] };
    const slugs = currentData.map((c) => c.ceo_slug);
    let min = Infinity;
    let max = -Infinity;
    chartData.forEach((point) => {
      slugs.forEach((slug) => {
        const val = point[slug] as number | undefined;
        if (val !== undefined) {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      });
    });
    if (!isFinite(min) || !isFinite(max)) return { yDomain: [900, 1300] as [number, number], yTicks: [900, 1000, 1100, 1200, 1300] };

    const domainMin = Math.floor(min / 100) * 100 - 100;
    const domainMax = Math.ceil(max / 100) * 100 + 100;
    const ticks: number[] = [];
    for (let v = domainMin; v <= domainMax; v += 100) ticks.push(v);
    return { yDomain: [domainMin, domainMax] as [number, number], yTicks: ticks };
  }, [chartData, currentData]);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ color: string; name: string; value: number; dataKey: string }>;
    label?: string;
  }) => {
    if (!active || !payload || payload.length === 0) return null;
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-4 shadow-lg border border-[#2a2a2a]">
        <p className="text-[#666] text-xs mb-3 font-bold">{label}</p>
        <div className="space-y-2">
          {sortedPayload.map((entry) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CEO_COLORS[entry.dataKey] || "#888" }}
                />
                <span className="text-sm font-bold text-[#ccc]">{entry.name}</span>
              </div>
              <span
                className="text-sm font-extrabold"
                style={{ color: "#fff" }}
              >
                {formatUsd(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div data-panel="chart" className="rounded-[20px] border border-white/10 relative overflow-hidden" style={{ boxShadow: "0 0 15px rgba(255,255,255,0.15), 0 0 45px rgba(255,255,255,0.1), 0 0 100px rgba(255,255,255,0.05)" }}>
      <GrassBackground />

      {(
        <div className="relative z-10 h-[600px] p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 160, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.15)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={8}
                fontWeight={700}
                label={{ value: "Time", position: "insideBottom", offset: -5, fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
                ticks={chartData.length >= 2 ? [
                  chartData[0].date,
                  chartData[Math.floor(chartData.length / 5)].date,
                  chartData[Math.floor(2 * chartData.length / 5)].date,
                  chartData[Math.floor(3 * chartData.length / 5)].date,
                  chartData[Math.floor(4 * chartData.length / 5)].date,
                  chartData[chartData.length - 1].date,
                ] : undefined}
              />
              <YAxis
                type="number"
                stroke="rgba(255,255,255,0.6)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatUsd(value)}
                dx={-5}
                fontWeight={700}
                domain={yDomain}
                ticks={yTicks}
                allowDataOverflow
                label={{ value: "Value USD", angle: -90, position: "insideLeft", offset: 15, fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              {currentData.map((ceo) => {
                const color = CEO_COLORS[ceo.ceo_slug] || "#888";
                return (
                  <Line
                    key={ceo.ceo_slug}
                    type="monotone"
                    dataKey={ceo.ceo_slug}
                    name={ceo.ceo_name}
                    stroke={color}
                    strokeWidth={5}
                    dot={false}
                    activeDot={{
                      r: 6,
                      fill: color,
                      stroke: "#000",
                      strokeWidth: 2,
                    }}
                    style={{
                      filter: `drop-shadow(0 0 6px ${color}80)`,
                    }}
                  />
                );
              })}
              <Customized
                component={({ xAxisMap, yAxisMap }: Record<string, Record<string, { scale: (v: unknown) => number }>>) => {
                  const xAxis = xAxisMap && Object.values(xAxisMap)[0];
                  const yAxis = yAxisMap && Object.values(yAxisMap)[0];
                  if (!xAxis?.scale || !yAxis?.scale || chartData.length === 0) return null;
                  const lastPoint = chartData[chartData.length - 1];
                  const xVal = xAxis.scale(lastPoint.date);
                  const r = 18;
                  return (
                    <g>
                      {currentData.map((ceo) => {
                        const val = lastPoint[ceo.ceo_slug];
                        if (val === undefined || val === null) return null;
                        const yVal = yAxis.scale(val);
                        if (isNaN(yVal) || isNaN(xVal)) return null;
                        const color = CEO_COLORS[ceo.ceo_slug] || "#888";
                        const logo = CEO_LOGOS[ceo.ceo_slug];
                        const labelText = `$${(val as number).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                        const labelWidth = labelText.length * 7 + 8;
                        const labelHeight = 20;
                        const labelX = xVal + r + 4;
                        const labelY = yVal - labelHeight / 2;
                        return (
                          <g key={`endpoint-${ceo.ceo_slug}`} style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}>
                            <circle cx={xVal} cy={yVal} r={r} fill={color} />
                            {logo && (
                              <svg
                                x={xVal - r * 0.6}
                                y={yVal - r * 0.6}
                                width={r * 1.2}
                                height={r * 1.2}
                                viewBox={logo.viewBox}
                              >
                                <path d={logo.path} fill="white" />
                              </svg>
                            )}
                            <rect
                              x={labelX}
                              y={labelY}
                              width={labelWidth}
                              height={labelHeight}
                              fill={color}
                            />
                            <text
                              x={labelX + labelWidth / 2}
                              y={labelY + labelHeight / 2}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="white"
                              fontSize={12}
                              fontWeight={700}
                            >
                              {labelText}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
