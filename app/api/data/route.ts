import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const SAMPLE_DATA = [{"firm":"Wells Fargo Home Mortgage","total_departures_q1":284,"total_arrivals_q1":198,"net_headcount_change":-86,"avg_production_departing":4200000,"top_destination":"UWM","top_origin":"Rocket Mortgage","exodus_index":1.43,"risk_rating":"High"},{"firm":"loanDepot","total_departures_q1":412,"total_arrivals_q1":189,"net_headcount_change":-223,"avg_production_departing":3800000,"top_destination":"Fairway","top_origin":"Caliber","exodus_index":2.18,"risk_rating":"Critical"},{"firm":"Guaranteed Rate","total_departures_q1":156,"total_arrivals_q1":201,"net_headcount_change":45,"avg_production_departing":3200000,"top_destination":"CrossCountry","top_origin":"PennyMac","exodus_index":0.78,"risk_rating":"Low"}];

function getStats(data: Record<string, unknown>[]) {
  if (!data || data.length === 0) return {};
  const numericKeys = Object.keys(data[0]).filter(k => typeof data[0][k] === "number");
  const stats: Record<string, unknown> = { total_records: data.length };
  numericKeys.slice(0, 2).forEach(k => {
    const avg = data.reduce((s, r) => s + (Number(r[k]) || 0), 0) / data.length;
    stats[`avg_${k}`] = Math.round(avg * 100) / 100;
  });
  return stats;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  
  let data = SAMPLE_DATA as Record<string, unknown>[];
  if (q) {
    data = data.filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(q.toLowerCase()))
    );
  }
  
  return NextResponse.json({
    data,
    stats: getStats(data),
    refreshed: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const data = SAMPLE_DATA as Record<string, unknown>[];
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  const csv = [
    headers.join(","),
    ...data.map(r => headers.map(h => String(r[h] ?? "")).join(","))
  ].join("\n");
  
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=exodusmap-export.csv`
    }
  });
}
