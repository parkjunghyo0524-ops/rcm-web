import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// 조회
export async function GET() {
  const { data, error } = await supabase
    .from("rcm_data")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    rowsByTab: data?.[0]?.data?.rowsByTab ?? {},
    yearValue: data?.[0]?.data?.yearValue ?? "",
    lockedTabs: data?.[0]?.data?.lockedTabs ?? {},
    historyRows: data?.[0]?.data?.historyRows ?? [],
    completedYearData: data?.[0]?.data?.completedYearData ?? {},
  });
}

// 저장
export async function POST(req: Request) {
  const body = await req.json();

  const { error } = await supabase.from("rcm_data").upsert({
    id: 1,
    data: body,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}