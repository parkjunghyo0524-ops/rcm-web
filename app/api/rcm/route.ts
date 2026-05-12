import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data, error } = await supabase
    .from("rcm_data")
    .select("*")
    .eq("id", 1)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    rowsByTab: data?.data?.rowsByTab ?? {},
    yearValue: data?.data?.yearValue ?? "",
    lockedTabs: data?.data?.lockedTabs ?? {},
    historyRows: data?.data?.historyRows ?? [],
    completedYearData: data?.data?.completedYearData ?? {},
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data: existingData, error: readError } = await supabase
      .from("rcm_data")
      .select("data")
      .eq("id", 1)
      .single();

    if (readError && readError.code !== "PGRST116") {
      return NextResponse.json({ error: readError.message }, { status: 500 });
    }

    const currentData = existingData?.data ?? {
      rowsByTab: { current: [], previous: [], change: [] },
      yearValue: "",
      lockedTabs: {},
      historyRows: [],
      completedYearData: {},
    };

    if (body.mode === "chunk") {
      const tabName = body.tabName;
      const startIndex = body.startIndex ?? 0;
      const rows = body.rows ?? [];

      const nextRowsByTab = {
        current: currentData.rowsByTab?.current ?? [],
        previous: currentData.rowsByTab?.previous ?? [],
        change: currentData.rowsByTab?.change ?? [],
      };

      const targetRows = [...(nextRowsByTab[tabName as "current" | "previous" | "change"] ?? [])];

      rows.forEach((row: any, idx: number) => {
        targetRows[startIndex + idx] = row;
      });

      nextRowsByTab[tabName as "current" | "previous" | "change"] = targetRows;

      currentData.rowsByTab = nextRowsByTab;
      currentData.yearValue = body.yearValue ?? currentData.yearValue ?? "";
      currentData.lockedTabs = body.lockedTabs ?? currentData.lockedTabs ?? {};
    }

    if (body.mode === "meta") {
      currentData.yearValue = body.yearValue ?? "";
      currentData.lockedTabs = body.lockedTabs ?? {};
      currentData.historyRows = body.historyRows ?? [];
      currentData.completedYearData = body.completedYearData ?? {};
    }

    const { error: saveError } = await supabase
  .from("rcm_data")
  .upsert({
    id: 1,
    data: currentData,
    updated_at: new Date().toISOString(),
  });

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
