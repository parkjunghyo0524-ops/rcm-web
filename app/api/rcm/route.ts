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

    currentData.rowsByTab = currentData.rowsByTab ?? {
      current: [],
      previous: [],
      change: [],
    };

    if (body.mode === "tab") {
      const tabName = body.tabName;
      const rows = body.rows ?? [];

      if (!tabName) {
        return NextResponse.json(
          { error: "tabName is required" },
          { status: 400 }
        );
      }

      currentData.rowsByTab = {
        ...currentData.rowsByTab,
        [tabName]: rows,
      };

      currentData.yearValue = body.yearValue ?? currentData.yearValue ?? "";
      currentData.lockedTabs = body.lockedTabs ?? currentData.lockedTabs ?? {};
    }

    if (body.mode === "tabs") {
      const tabs = body.tabs ?? {};

      currentData.rowsByTab = {
        ...currentData.rowsByTab,
        ...tabs,
      };

      currentData.yearValue = body.yearValue ?? currentData.yearValue ?? "";
      currentData.lockedTabs = body.lockedTabs ?? currentData.lockedTabs ?? {};
    }

    if (body.mode === "chunk") {
      const tabName = body.tabName;
      const startIndex = body.startIndex ?? 0;
      const rows = body.rows ?? [];

      const nextRowsByTab = {
        ...currentData.rowsByTab,
      };

      const targetRows = [...(nextRowsByTab[tabName] ?? [])];

      rows.forEach((row: any, idx: number) => {
        targetRows[startIndex + idx] = row;
      });

      nextRowsByTab[tabName] = targetRows;

      currentData.rowsByTab = nextRowsByTab;
      currentData.yearValue = body.yearValue ?? currentData.yearValue ?? "";
      currentData.lockedTabs = body.lockedTabs ?? currentData.lockedTabs ?? {};
    }

    if (body.mode === "meta") {
      currentData.yearValue = body.yearValue ?? currentData.yearValue ?? "";
      currentData.lockedTabs = body.lockedTabs ?? currentData.lockedTabs ?? {};
      currentData.historyRows = body.historyRows ?? currentData.historyRows ?? [];
      currentData.completedYearData =
        body.completedYearData ?? currentData.completedYearData ?? {};
    }

    const { error: saveError } = await supabase
      .from("rcm_data")
      .update({
        data: currentData,
      })
      .eq("id", 1);

    if (saveError) {
      return NextResponse.json({ error: saveError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
