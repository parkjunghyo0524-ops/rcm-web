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

  const { data: yearlyRows, error: yearlyError } = await supabase
    .from("rcm_yearly")
    .select("year, rows");

  if (yearlyError) {
    return NextResponse.json({ error: yearlyError.message }, { status: 500 });
  }

  const completedYearData = (yearlyRows ?? []).reduce(
    (acc: Record<string, any[]>, item: any) => {
      acc[item.year] = item.rows ?? [];
      return acc;
    },
    {}
  );

  const { data: historyData, error: historyError } = await supabase
    .from("rcm_history")
    .select("rows")
    .eq("id", 1)
    .single();

  if (historyError && historyError.code !== "PGRST116") {
    return NextResponse.json({ error: historyError.message }, { status: 500 });
  }

  const historyRows = historyData?.rows ?? data?.data?.historyRows ?? [];

  return NextResponse.json({
    rowsByTab: data?.data?.rowsByTab ?? {},
    yearValue: data?.data?.yearValue ?? "",
    lockedTabs: data?.data?.lockedTabs ?? {},
    historyRows,
    completedYearData,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.mode === "yearly") {
      const year = String(body.year ?? "").trim();
      const rows = body.rows ?? [];

      if (!year) {
        return NextResponse.json({ error: "year is required" }, { status: 400 });
      }

      const { error } = await supabase.from("rcm_yearly").upsert({
        year,
        rows,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    if (body.mode === "deleteYearly") {
      const year = String(body.year ?? "").trim();

      if (!year) {
        return NextResponse.json({ error: "year is required" }, { status: 400 });
      }

      const { error } = await supabase
        .from("rcm_yearly")
        .delete()
        .eq("year", year);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

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
    };

    currentData.rowsByTab = currentData.rowsByTab ?? {
      current: [],
      previous: [],
      change: [],
    };

    delete currentData.completedYearData;
    delete currentData.historyRows;

    if (body.mode === "tab") {
      const tabName = body.tabName;
      const rows = body.rows ?? [];

      if (!tabName) {
        return NextResponse.json({ error: "tabName is required" }, { status: 400 });
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

      const nextRowsByTab = { ...currentData.rowsByTab };
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

      if ("historyRows" in body) {
        const { error: historySaveError } = await supabase
          .from("rcm_history")
          .upsert({
            id: 1,
            rows: body.historyRows ?? [],
            updated_at: new Date().toISOString(),
          });

        if (historySaveError) {
          return NextResponse.json(
            { error: historySaveError.message },
            { status: 500 }
          );
        }
      }
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
