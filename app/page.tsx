 "use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Column = {
  key: string;
  label: string;
  group: string;
  width?: number;
  type?: "text" | "select" | "date" | "checkbox";
  options?: string[];
};

type FilterState = Record<string, string[]>;
type RowData = Record<string, string>;
type TabKey = "current" | "previous" | "change" | "history" | "yearly";

type HistoryRow = {
  checked?: string;
  no: number;
  담당자?: string;
  수정일: string;
  "Mega Process": string;
  "Control No": string;
  "Control Name": string;
  "변경 항목": string;
  "AS-IS": string;
  "TO-BE": string;
  수정사유: string;
};

export default function RcmPage() {
  const commonColumns: Column[] = [
    { key: "Mega Process Code", label: "Mega Process Code", group: "Process", width: 140 },
    { key: "Mega Process Name", label: "Mega Process Name", group: "Process", width: 170 },
    { key: "Major Process Code", label: "Major Process Code", group: "Process", width: 150 },
    { key: "Major Process Name", label: "Major Process Name", group: "Process", width: 170 },
    { key: "Sub Process Code", label: "Sub Process Code", group: "Process", width: 150 },
    { key: "Sub Process Name", label: "Sub Process Name", group: "Process", width: 160 },

    { key: "Risk of misstatement", label: "Risk of misstatement\n(재무제표 왜곡표시위험)", group: "Risk", width: 320 },
    { key: "WCGW Code", label: "WCGW Code", group: "Risk", width: 110 },
    { key: "WCGW Name", label: "WCGW Name", group: "Risk", width: 170 },
    { key: "WCGW Description", label: "WCGW Description", group: "Risk", width: 280 },

    { key: "발생가능성", label: "발생가능성", group: "위험 평가", width: 90 },
    { key: "영향", label: "영향", group: "위험 평가", width: 80 },
    { key: "위험등급", label: "위험등급", group: "위험 평가", width: 90 },

    { key: "Control No.", label: "Control No.", group: "Control", width: 130 },
    { key: "Control Name", label: "Control Name", group: "Control", width: 220 },
    { key: "Control Description", label: "Control Description", group: "Control", width: 320 },
    { key: "IT System", label: "IT System", group: "Control", width: 140 },
    { key: "Documents", label: "Documents", group: "Control", width: 180 },
    { key: "조직 + 팀", label: "조직 + 팀", group: "Control", width: 150 },
    { key: "통제수행자", label: "통제수행자", group: "Control", width: 110 },
    { key: "통제수행자 사번", label: "통제수행자 사번", group: "Control", width: 120 },
    { key: "문서 최종승인권자", label: "문서 최종승인권자", group: "Control", width: 150 },
    { key: "Control Owner", label: "Control Owner", group: "Control", width: 180 },

    { key: "Factor 1", label: "(Factor 1)\n재무제표 왜곡표시\n위험 방지 효과", group: "Key Control 결정", width: 170 },
    { key: "Factor 2", label: "(Factor 2)\n관련 계정과목,\n거래유형, 공시\n사항의 중요성", group: "Key Control 결정", width: 170 },
    { key: "Factor 3", label: "(Factor 3)\n보완적 및 중\n복적 설계 여부", group: "Key Control 결정", width: 170 },
    { key: "Factor 3.1", label: "(Factor 3.1)\n보완통제 또는\n중복통제\nControl Code", group: "Key Control 결정", width: 180 },
    { key: "Factor 4", label: "(Factor 4)\n단계적으로 설\n계된 통제활동\n의 경우 정교함\n수준", group: "Key Control 결정", width: 180 },
    { key: "Factor 5", label: "(Factor 5)\n통제실패\n위험 수준", group: "Key Control 결정", width: 150 },
    { key: "핵심통제 여부", label: "핵심통제 여부", group: "Key Control 결정", width: 110 },

    { key: "COA Code", label: "COA Code", group: "COA / 계정과목", width: 100 },
    { key: "Account", label: "Account", group: "COA / 계정과목", width: 180 },

    { key: "완전성", label: "완전성", group: "경영진 주장", width: 80 },
    { key: "실재성", label: "실재성", group: "경영진 주장", width: 80 },
    { key: "정확성", label: "정확성", group: "경영진 주장", width: 80 },
    { key: "평가", label: "평가", group: "경영진 주장", width: 80 },
    { key: "권리와 의무", label: "권리와 의무", group: "경영진 주장", width: 100 },
    { key: "표시와 공시", label: "표시와 공시", group: "경영진 주장", width: 100 },

    { key: "Residual Risk 발생가능성", label: "발생가능성", group: "Residual Risk", width: 90 },
    { key: "Residual Risk 영향", label: "영향", group: "Residual Risk", width: 80 },
    { key: "Residual Risk 위험등급", label: "위험등급", group: "Residual Risk", width: 90 },

    { key: "ELC (COSO)", label: "ELC (COSO)", group: "기타", width: 120 },
    { key: "KAM 여부", label: "KAM 여부", group: "기타", width: 90 },
    { key: "MRC", label: "MRC", group: "기타", width: 80 },
    { key: "IPE Code", label: "IPE Code", group: "기타", width: 100 },
    { key: "IPE", label: "IPE", group: "기타", width: 120 },
    { key: "EUC", label: "EUC", group: "기타", width: 80 },

    { key: "Preventive / Detective", label: "Preventive\nDetective", group: "Control Type", width: 110 },
    { key: "Manual / Automated / M with A", label: "Manual\nAutomated\nM with A", group: "Control Type", width: 140 },
    { key: "Manual Control Category", label: "Manual\nControl\nCategory", group: "Control Type", width: 140 },
    { key: "Automated Control Category", label: "Automated\nControl\nCategory", group: "Control Type", width: 140 },

    { key: "자산의 보호", label: "자산의 보호", group: "Control Objective", width: 90 },
    { key: "보고의 신뢰성", label: "보고의 신뢰성", group: "Control Objective", width: 110 },
    { key: "법규 준수", label: "법규 준수", group: "Control Objective", width: 90 },

    { key: "Control Frequency", label: "Control Frequency", group: "Test", width: 120 },
    { key: "Test Procedure", label: "Test Procedure", group: "Test", width: 240 },
    { key: "Test Documents", label: "Test Documents", group: "Test", width: 180 },
    { key: "Population", label: "Population", group: "Test", width: 100 },
    { key: "모집단 IT System", label: "모집단 IT System", group: "Test", width: 130 },
    { key: "Sample size", label: "Sample size", group: "Test", width: 90 },

    { key: "질문", label: "질문", group: "Test Category", width: 70 },
    { key: "관찰", label: "관찰", group: "Test Category", width: 70 },
    { key: "검증", label: "검증", group: "Test Category", width: 70 },
    { key: "재수행", label: "재수행", group: "Test Category", width: 70 },
  ];

  const currentOnlyColumns: Column[] = [
  { key: "적용", label: "선택", group: "수정사항", width: 80, type: "checkbox" },
  { key: "적용여부", label: "적용여부", group: "수정사항", width: 100, type: "text" },
  { key: "저장완료", label: "저장완료", group: "수정사항", width: 100, type: "text" },
  { key: "신설/삭제", label: "신설/삭제", group: "수정사항", width: 100, type: "select", options: ["", "신설", "삭제"] },
  { key: "담당자", label: "담당자", group: "수정사항", width: 120, type: "text" },
  { key: "수정일자", label: "수정일자", group: "수정사항", width: 120, type: "date" },
  { key: "수정사유", label: "수정사유", group: "수정사항", width: 300, type: "text" },
];

  const historyColumns: Column[] = [
    { key: "checked", label: "삭제", group: "변경이력", width: 50, type: "checkbox" },
    { key: "no", label: "No.", group: "변경이력", width: 60 },
    { key: "담당자", label: "담당자", group: "변경이력", width: 120 },
    { key: "수정일", label: "수정일", group: "변경이력", width: 120 },
    { key: "Mega Process", label: "Mega Process", group: "변경이력", width: 160 },
    { key: "Control No", label: "Control No", group: "변경이력", width: 130 },
    { key: "Control Name", label: "Control Name", group: "변경이력", width: 200 },
    { key: "변경 항목", label: "변경 항목", group: "변경이력", width: 170 },
    { key: "AS-IS", label: "AS-IS", group: "변경이력", width: 320 },
    { key: "TO-BE", label: "TO-BE", group: "변경이력", width: 320 },
    { key: "수정사유", label: "수정사유", group: "변경이력", width: 300 },
  ];

  const getColumnsByTab = (tab: TabKey): Column[] => {
    if (tab === "change") return [...currentOnlyColumns, ...commonColumns];
    if (tab === "history") return historyColumns;
    return commonColumns;
  };

  const normalizeKeyValue = (value: unknown) => String(value ?? "").trim();

  const getApplyKey = (row: RowData) => ({
    controlNo: normalizeKeyValue(row["Control No."]),
    majorProcessCode: normalizeKeyValue(row["Major Process Code"]),
    subProcessCode: normalizeKeyValue(row["Sub Process Code"]),
  });

  const isSameApplyTarget = (a: RowData, b: RowData) => {
    const aKey = getApplyKey(a);
    const bKey = getApplyKey(b);

    return (
      aKey.controlNo === bKey.controlNo &&
      aKey.majorProcessCode === bKey.majorProcessCode &&
      aKey.subProcessCode === bKey.subProcessCode
    );
  };

  const buildEmptyRow = (tab: TabKey): RowData => {
    const row: RowData = {};
    getColumnsByTab(tab).forEach((col) => {
      row[col.key] = "";
    });
    return row;
  };

  const [activeTab, setActiveTab] = useState<TabKey>("current");
  const [yearValue, setYearValue] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [completedYearData, setCompletedYearData] = useState<Record<string, RowData[]>>({});
  const [rowsByTab, setRowsByTab] = useState<Record<TabKey, RowData[]>>({
    current: [buildEmptyRow("current")],
    previous: [buildEmptyRow("previous")],
    change: [],
    history: [],
    yearly: [],
  });
  const [historyRows, setHistoryRows] = useState<HistoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({});
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [messagesByTab, setMessagesByTab] = useState<Record<TabKey, string>>({
  current: "",
  previous: "",
  change: "",
  history: "",
  yearly: "",
});

const setTabMessage = (tab: TabKey, msg: string) => {
  setMessagesByTab((prev) => ({
    ...prev,
    [tab]: msg,
  }));
};

const message = messagesByTab[activeTab] ?? "";
  const [changeSearch, setChangeSearch] = useState("");
  const [filterPos, setFilterPos] = useState<{ top: number; left: number } | null>(null);
  const [lockedTabs, setLockedTabs] = useState<{ current: boolean; previous: boolean }>({
    current: false,
    previous: false,
  });
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const columns = getColumnsByTab(activeTab);

  const activeRows =
    activeTab === "history"
      ? historyRows.map((row) => ({
          checked: row.checked ?? "",
          no: String(row.no),
          담당자: row["담당자"] ?? "",
          수정일: row["수정일"],
          "Mega Process": row["Mega Process"],
          "Control No": row["Control No"],
          "Control Name": row["Control Name"],
          "변경 항목": row["변경 항목"],
          "AS-IS": row["AS-IS"],
          "TO-BE": row["TO-BE"],
          수정사유: row["수정사유"],
        }))
      : activeTab === "yearly"
      ? completedYearData[selectedYear] ?? []
      : rowsByTab[activeTab] ?? [];

  const isLocked =
    (activeTab === "current" && lockedTabs.current) ||
    (activeTab === "previous" && lockedTabs.previous);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/rcm", { cache: "no-store" });
        const data = await res.json();

        if (data?.rowsByTab) {
          setRowsByTab({
            current:
              Array.isArray(data.rowsByTab.current) && data.rowsByTab.current.length > 0
                ? data.rowsByTab.current
                : [buildEmptyRow("current")],
            previous:
              Array.isArray(data.rowsByTab.previous) && data.rowsByTab.previous.length > 0
                ? data.rowsByTab.previous
                : [buildEmptyRow("previous")],
            change: Array.isArray(data.rowsByTab.change) ? data.rowsByTab.change : [],
            history: [],
            yearly: [],
          });
        }

        if (typeof data?.yearValue === "string") setYearValue(data.yearValue);
        if (data?.lockedTabs) {
          setLockedTabs({
            current: Boolean(data.lockedTabs.current),
            previous: Boolean(data.lockedTabs.previous),
          });
        }
        if (Array.isArray(data?.historyRows)) setHistoryRows(data.historyRows);
        if (data?.completedYearData) {
          setCompletedYearData(data.completedYearData);
          const years = Object.keys(data.completedYearData).sort().reverse();
          setSelectedYear(years[0] ?? "");
        }
      } catch (e) {
        console.error("데이터 불러오기 실패", e);
        setTabMessage("current", "서버 데이터를 불러오지 못했습니다.");
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveToLocalStorage = async (
    nextRowsByTab: Record<TabKey, RowData[]>,
    nextYearValue: string,
    nextLockedTabs: { current: boolean; previous: boolean },
    nextHistoryRows: HistoryRow[],
    nextCompletedYearData: Record<string, RowData[]>,
    tabsToSave: Array<"current" | "previous" | "change"> = [],
    metaToSave: { historyRows?: boolean; completedYearData?: boolean } = {}
  ) => {
    const request = async (body: Record<string, any>) => {
      const res = await fetch("/api/rcm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      return res.json();
    };

    const uniqueTabsToSave = Array.from(new Set(tabsToSave));

    if (uniqueTabsToSave.length === 1) {
      const tabName = uniqueTabsToSave[0];

      await request({
        mode: "tab",
        tabName,
        rows: nextRowsByTab[tabName],
        yearValue: nextYearValue,
        lockedTabs: nextLockedTabs,
      });
    }

    if (uniqueTabsToSave.length > 1) {
      const tabs = uniqueTabsToSave.reduce<Record<string, RowData[]>>((acc, tabName) => {
        acc[tabName] = nextRowsByTab[tabName];
        return acc;
      }, {});

      await request({
        mode: "tabs",
        tabs,
        yearValue: nextYearValue,
        lockedTabs: nextLockedTabs,
      });
    }

    if (uniqueTabsToSave.length === 0 || metaToSave.historyRows || metaToSave.completedYearData) {
      await request({
        mode: "meta",
        yearValue: nextYearValue,
        lockedTabs: nextLockedTabs,
        ...(metaToSave.historyRows ? { historyRows: nextHistoryRows } : {}),
        ...(metaToSave.completedYearData ? { completedYearData: nextCompletedYearData } : {}),
      });
    }
  };

  const updateActiveRows = (updater: (prev: RowData[]) => RowData[]) => {
    if (activeTab === "history" || activeTab === "yearly") return;
    setRowsByTab((prev) => ({
      ...prev,
      [activeTab]: updater(prev[activeTab] ?? []),
    }));
  };

  const optionsByColumn = useMemo(() => {
    const result: Record<string, string[]> = {};
    for (const col of columns) {
      const values = Array.from(
        new Set(activeRows.map((row: RowData) => String(row[col.key] ?? "")).filter(Boolean))
      );
      result[col.key] = values.sort((a, b) => a.localeCompare(b, "ko"));
    }
    return result;
  }, [activeRows, columns]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return activeRows.filter((row) => {
      const matchedSearch = !q
        ? true
        : columns.some((col) => String(row[col.key] ?? "").toLowerCase().includes(q));

      const matchedFilters = columns.every((col) => {
        const selected = filters[col.key] ?? [];
        if (selected.length === 0) return true;
        return selected.includes(String(row[col.key] ?? ""));
      });

      return matchedSearch && matchedFilters;
    });
  }, [search, filters, activeRows, columns]);

  const groupHeaders = columns.reduce<Array<{ group: string; span: number }>>((acc, col) => {
    const last = acc[acc.length - 1];
    if (last && last.group === col.group) {
      last.span += 1;
    } else {
      acc.push({ group: col.group, span: 1 });
    }
    return acc;
  }, []);

  const toggleFilterValue = (columnKey: string, value: string) => {
    setFilters((prev) => {
      const current = prev[columnKey] ?? [];
      const exists = current.includes(value);
      const nextValues = exists ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [columnKey]: nextValues };
    });
  };

  const clearColumnFilter = (columnKey: string) => {
    setFilters((prev) => ({ ...prev, [columnKey]: [] }));
  };

  const hasFilter = (columnKey: string) => (filters[columnKey] ?? []).length > 0;

  const parseClipboardHtml = (html: string): string[][] => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const trs = Array.from(doc.querySelectorAll("tr"));
    if (trs.length === 0) return [];

    return trs.map((tr) => {
      const cells = Array.from(tr.querySelectorAll("td, th"));
      return cells.map((cell) => (cell.textContent || "").replace(/\r/g, ""));
    });
  };

  const handleCellPaste = (
    event: React.ClipboardEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>,
    startRow: number,
    startCol: number
  ) => {
    if (isLocked || activeTab === "history" || activeTab === "yearly") return;

    event.preventDefault();

    const html = event.clipboardData.getData("text/html");
    const text = event.clipboardData.getData("text/plain");

    let pastedRows: string[][] = [];

    if (html) {
      pastedRows = parseClipboardHtml(html).filter((row) => row.some((cell) => cell !== ""));
    }

    if (pastedRows.length === 0 && text) {
      pastedRows = text
        .replace(/\r/g, "")
        .split("\n")
        .filter((r) => r.length > 0)
        .map((r) => r.split("\t"));
    }

    if (pastedRows.length === 0) return;

    updateActiveRows((prev) => {
      const next = [...prev];

      while (next.length < startRow + pastedRows.length) {
        next.push(buildEmptyRow(activeTab));
      }

      pastedRows.forEach((pastedRow, rIdx) => {
        const targetRow = startRow + rIdx;
        const newRow = { ...next[targetRow] };

        pastedRow.forEach((cell, cIdx) => {
          const targetCol = startCol + cIdx;
          if (targetCol < columns.length) {
            const targetColumn = columns[targetCol];
            if (targetColumn.type === "select" && targetColumn.options) {
              if (targetColumn.options.includes(cell)) {
                newRow[targetColumn.key] = cell;
              }
            } else if (targetColumn.type === "checkbox") {
              newRow[targetColumn.key] =
                cell === "Y" || cell === "TRUE" || cell === "true" ? "Y" : "";
            } else {
              newRow[targetColumn.key] = cell.replace(/\s+/g, " ").trim();
            }
          }
        });

        next[targetRow] = newRow;
      });

      return next;
    });

    setTabMessage(activeTab, `${pastedRows.length}행의 데이터를 셀 기준으로 반영했습니다.`);
  };

  const buildHistoryRowsFromChange = (changeRow: RowData): HistoryRow[] => {
    const controlNo = String(changeRow["Control No."] ?? "").trim();
    if (!controlNo) return [];

    const previousRow =
      (rowsByTab.previous ?? []).find((row) => isSameApplyTarget(row, changeRow)) ?? null;

    const megaProcessName = String(
      changeRow["Mega Process Name"] ?? previousRow?.["Mega Process Name"] ?? ""
    ).trim();

    const controlName = String(
      changeRow["Control Name"] ?? previousRow?.["Control Name"] ?? ""
    ).trim();

    const manager = String(changeRow["담당자"] ?? "").trim();
    const reason = String(changeRow["수정사유"] ?? "").trim();
    const modifyDate = String(changeRow["수정일자"] ?? "").trim();
    const action = String(changeRow["신설/삭제"] ?? "").trim();

    const historyItems: HistoryRow[] = [];

    if (action === "신설" || action === "삭제") {
      historyItems.push({
        no: 0,
        담당자: manager,
        수정일: modifyDate,
        "Mega Process": megaProcessName,
        "Control No": controlNo,
        "Control Name": controlName,
        "변경 항목": action,
        "AS-IS": action,
        "TO-BE": action,
        수정사유: reason,
      });
      return historyItems;
    }

    commonColumns.forEach((col) => {
      const asIs = String(previousRow?.[col.key] ?? "");
      const toBe = String(changeRow[col.key] ?? "");

      if (asIs !== toBe) {
        historyItems.push({
          no: 0,
          담당자: manager,
          수정일: modifyDate,
          "Mega Process": megaProcessName,
          "Control No": controlNo,
          "Control Name": controlName,
          "변경 항목": col.key,
          "AS-IS": asIs,
          "TO-BE": toBe,
          수정사유: reason,
        });
      }
    });

    return historyItems;
  };

  const handleSingleCellChange = (rowIndex: number, colKey: string, value: string) => {
    if (isLocked || activeTab === "history" || activeTab === "yearly") return;

    updateActiveRows((prev) => {
      const next = [...prev];
      const updatedRow = { ...next[rowIndex], [colKey]: value };

      if (colKey === "신설/삭제" && value) {
        updatedRow["수정일자"] = new Date().toISOString().slice(0, 10);
      }

      next[rowIndex] = updatedRow;
      return next;
    });
  };

  const handleSave = async () => {
    try {
      const nextRowsByTab: Record<TabKey, RowData[]> = {
        ...rowsByTab,
        history: [],
        yearly: [],
        [activeTab]: activeTab === "history" || activeTab === "yearly" ? [] : rowsByTab[activeTab],
      };

      const nextLockedTabs = {
        ...lockedTabs,
        ...(activeTab === "current" ? { current: true } : {}),
        ...(activeTab === "previous" ? { previous: true } : {}),
      };

      const nextYearValue = yearValue;

      await saveToLocalStorage(
  nextRowsByTab,
  nextYearValue,
  nextLockedTabs,
  historyRows,
  completedYearData,
  [activeTab as "current" | "previous" | "change"]
);

      if (activeTab === "current" || activeTab === "previous") {
        setLockedTabs(nextLockedTabs);
        setTabMessage(activeTab, `${activeTab === "current" ? "당기 RCM" : "전기 RCM"} 탭이 저장되었습니다.`);
      }
    } catch (e: any) {
  setTabMessage(activeTab, `저장 실패: ${e.message}`);
}
  };

  const handleSearchCurrentRows = () => {
    const keyword = changeSearch.trim().toLowerCase();

    if (!keyword) {
      setRowsByTab((prev) => ({
        ...prev,
        change: [],
      }));
      setTabMessage("change", "Control No.를 입력해주세요.");
      return;
    }

    const currentRows = rowsByTab.current ?? [];

    const results = currentRows.filter(
      (row) => String(row["Control No."] ?? "").trim().toLowerCase() === keyword
    );

    const mappedResults = results.map((row) => ({
      ...buildEmptyRow("change"),
      ...row,
    }));

    setRowsByTab((prev) => ({
      ...prev,
      change: mappedResults,
    }));

    setTabMessage("change", `${results.length}건의 Control No. 데이터를 조회했습니다.`);
  };

  const handleApplyChanges = async () => {
    const confirmed = window.confirm("적용하시겠습니까?");

    if (!confirmed) {
      setTabMessage("change", "적용이 취소되었습니다.");
      return;
    }

    const targetRows = rowsByTab.change ?? [];

    if (targetRows.length === 0) {
      setTabMessage("change", "적용할 수정사항이 없습니다.");
      return;
    }

    const alreadyApplied = targetRows.some(
      (row) => row["적용"] === "Y" && row["적용여부"] === "적용완료"
    );

    if (alreadyApplied) {
      window.alert("이미 적용이 완료된 항목입니다");
      return;
    }

    const checkedRows = targetRows.filter((row) => row["적용"] === "Y");

    if (checkedRows.length === 0) {
      setTabMessage("change", "적용여부가 체크된 수정사항이 없습니다.");
      return;
    }
const hasUnsavedRows = checkedRows.some((row) => row["저장완료"] !== "저장완료");

if (hasUnsavedRows) {
  window.alert("저장 후 적용이 가능합니다");
  return;
}
    const hasMissingRequired = checkedRows.some(
      (row) =>
        !String(row["Control No."] ?? "").trim() ||
        !String(row["Major Process Code"] ?? "").trim() ||
        !String(row["Sub Process Code"] ?? "").trim() ||
        !String(row["수정일자"] ?? "").trim() ||
        !String(row["수정사유"] ?? "").trim()
    );

    if (hasMissingRequired) {
      window.alert("Control No., Major Process Code, Sub Process Code, 수정일자, 수정사유는 필수값이오니 입력바랍니다.");
      return;
    }

    let latestRowsByTab: Record<TabKey, RowData[]> = rowsByTab;
    let latestHistoryRows: HistoryRow[] = historyRows;

    try {
      const latestRes = await fetch("/api/rcm", { cache: "no-store" });

      if (!latestRes.ok) {
        const errorText = await latestRes.text();
        throw new Error(errorText);
      }

      const latestData = await latestRes.json();

      latestRowsByTab = {
        ...rowsByTab,
        ...(latestData?.rowsByTab ?? {}),
        history: [],
        yearly: [],
      };

      latestHistoryRows = Array.isArray(latestData?.historyRows)
        ? latestData.historyRows
        : historyRows;
    } catch (e: any) {
      setTabMessage("change", `최신 데이터 조회 실패: ${e.message}`);
      return;
    }

    const latestPreviousRows = latestRowsByTab.previous ?? [];
    let nextCurrent = [...(latestRowsByTab.current ?? [])];
    let nextHistoryRows = [...latestHistoryRows];

    const buildHistoryRowsFromChangeWithLatest = (changeRow: RowData): HistoryRow[] => {
      const controlNo = String(changeRow["Control No."] ?? "").trim();
      if (!controlNo) return [];

      const previousRow =
        latestPreviousRows.find((row) => isSameApplyTarget(row, changeRow)) ?? null;

      const megaProcessName = String(
        changeRow["Mega Process Name"] ?? previousRow?.["Mega Process Name"] ?? ""
      ).trim();

      const controlName = String(
        changeRow["Control Name"] ?? previousRow?.["Control Name"] ?? ""
      ).trim();

      const manager = String(changeRow["담당자"] ?? "").trim();
      const reason = String(changeRow["수정사유"] ?? "").trim();
      const modifyDate = String(changeRow["수정일자"] ?? "").trim();
      const action = String(changeRow["신설/삭제"] ?? "").trim();

      const historyItems: HistoryRow[] = [];

      if (action === "신설" || action === "삭제") {
        historyItems.push({
          no: 0,
          담당자: manager,
          수정일: modifyDate,
          "Mega Process": megaProcessName,
          "Control No": controlNo,
          "Control Name": controlName,
          "변경 항목": action,
          "AS-IS": action,
          "TO-BE": action,
          수정사유: reason,
        });
        return historyItems;
      }

      commonColumns.forEach((col) => {
        const asIs = String(previousRow?.[col.key] ?? "");
        const toBe = String(changeRow[col.key] ?? "");

        if (asIs !== toBe) {
          historyItems.push({
            no: 0,
            담당자: manager,
            수정일: modifyDate,
            "Mega Process": megaProcessName,
            "Control No": controlNo,
            "Control Name": controlName,
            "변경 항목": col.key,
            "AS-IS": asIs,
            "TO-BE": toBe,
            수정사유: reason,
          });
        }
      });

      return historyItems;
    };

    checkedRows.forEach((row) => {
      const controlNo = String(row["Control No."] ?? "").trim();
      const action = String(row["신설/삭제"] ?? "").trim();

      if (!controlNo) return;

      const historyForRow = buildHistoryRowsFromChangeWithLatest(row);
      nextHistoryRows = [...nextHistoryRows, ...historyForRow];

      if (action === "삭제") {
        nextCurrent = nextCurrent.filter((currentRow) => !isSameApplyTarget(currentRow, row));
        return;
      }

      if (action === "신설") {
        const newRow = buildEmptyRow("current");
        commonColumns.forEach((col) => {
          newRow[col.key] = row[col.key] ?? "";
        });

        nextCurrent = nextCurrent.filter((currentRow) => !isSameApplyTarget(currentRow, row));
        nextCurrent.push(newRow);
        return;
      }

      nextCurrent = nextCurrent.map((currentRow) => {
        if (!isSameApplyTarget(currentRow, row)) {
          return currentRow;
        }

        const updatedRow = { ...currentRow };
        commonColumns.forEach((col) => {
          updatedRow[col.key] = row[col.key] ?? "";
        });
        return updatedRow;
      });
    });

    nextCurrent.sort((a, b) => {
      const aNo = String(a["Control No."] ?? "").trim();
      const bNo = String(b["Control No."] ?? "").trim();
      return aNo.localeCompare(bNo, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });

    const normalizedHistoryRows = [...nextHistoryRows]
      .sort((a, b) => {
        const aDate = a["수정일"] || "";
        const bDate = b["수정일"] || "";
        if (aDate !== bDate) return aDate.localeCompare(bDate);
        return 0;
      })
      .map((row, idx) => ({
        ...row,
        담당자: row["담당자"] ?? "",
        no: idx + 1,
      }));

    const isAppliedTarget = (candidate: RowData) =>
      checkedRows.some(
        (checkedRow) =>
          isSameApplyTarget(candidate, checkedRow) &&
          String(candidate["수정일자"] ?? "").trim() === String(checkedRow["수정일자"] ?? "").trim() &&
          String(candidate["수정사유"] ?? "").trim() === String(checkedRow["수정사유"] ?? "").trim()
      );

    const nextChangeBase = latestRowsByTab.change ?? rowsByTab.change ?? [];
    const reflectedKeys = new Set<string>();

    const makeChangeKey = (row: RowData) =>
      [
        String(row["Control No."] ?? "").trim(),
        String(row["Major Process Code"] ?? "").trim(),
        String(row["Sub Process Code"] ?? "").trim(),
        String(row["수정일자"] ?? "").trim(),
        String(row["수정사유"] ?? "").trim(),
      ].join("||");

    const nextChange = nextChangeBase.map((row) => {
      const matchedCheckedRow = checkedRows.find(
        (checkedRow) =>
          isSameApplyTarget(row, checkedRow) &&
          String(row["수정일자"] ?? "").trim() === String(checkedRow["수정일자"] ?? "").trim() &&
          String(row["수정사유"] ?? "").trim() === String(checkedRow["수정사유"] ?? "").trim()
      );

      if (matchedCheckedRow) {
        reflectedKeys.add(makeChangeKey(matchedCheckedRow));
        return {
          ...row,
          ...matchedCheckedRow,
          적용: "",
          적용여부: "적용완료",
        };
      }

      return row;
    });

    checkedRows.forEach((checkedRow) => {
      const key = makeChangeKey(checkedRow);
      if (!reflectedKeys.has(key)) {
        nextChange.push({
          ...checkedRow,
          적용: "",
          적용여부: "적용완료",
        });
      }
    });

    const nextRowsByTab: Record<TabKey, RowData[]> = {
      ...rowsByTab,
      current: nextCurrent,
      change: nextChange,
      history: [],
      yearly: [],
    };

    try {
      await saveToLocalStorage(
        nextRowsByTab,
        yearValue,
        lockedTabs,
        normalizedHistoryRows,
        completedYearData,
        ["current", "change"],
        { historyRows: true }
      );
      setRowsByTab(nextRowsByTab);
      setHistoryRows(normalizedHistoryRows);
      setTabMessage("change", `${checkedRows.length}건의 수정사항이 적용되었고, 변경이력이 누적되었습니다.`);
    } catch (e: any) {
  setTabMessage("change", `적용사항 저장 실패: ${e.message}`);
}
  };
const handleSaveSelectedChangeRows = async () => {
  if (activeTab !== "change") return;

  const confirmed = window.confirm("저장하시겠습니까?");
  if (!confirmed) {
    setTabMessage("change", "저장이 취소되었습니다.");
    return;
  }

  const changeRows = rowsByTab.change ?? [];
  const checkedRows = changeRows.filter((row) => row["적용"] === "Y");

  const nextChangeRows = changeRows.map((row) =>
    row["적용"] === "Y"
      ? {
          ...row,
          적용: "",
          저장완료: "저장완료",
        }
      : row
  );

  const nextRowsByTab: Record<TabKey, RowData[]> = {
    ...rowsByTab,
    change: nextChangeRows,
  };

  try {
    await saveToLocalStorage(
      nextRowsByTab,
      yearValue,
      lockedTabs,
      historyRows,
      completedYearData,
      ["change"]
    );

    setRowsByTab(nextRowsByTab);
    setTabMessage("change", `${checkedRows.length}건의 수정사항을 저장했습니다.`);
  } catch (e: any) {
    setTabMessage("change", `수정사항 저장 실패: ${e.message}`);
  }
};

const handleDeleteSelectedChangeRows = async () => {
  if (activeTab !== "change") return;

  const changeRows = rowsByTab.change ?? [];
  const checkedRows = changeRows.filter((row) => row["적용"] === "Y");

  if (checkedRows.length === 0) {
    window.alert("삭제할 항목을 선택해주세요.");
    return;
  }

  const confirmed = window.confirm("삭제하시겠습니까?");
if (!confirmed) {
  setTabMessage("change", "삭제가 취소되었습니다.");
  return;
}

  const nextRowsByTab: Record<TabKey, RowData[]> = {
    ...rowsByTab,
    change: changeRows.filter((row) => row["적용"] !== "Y"),
  };

  try {
    await saveToLocalStorage(
      nextRowsByTab,
      yearValue,
      lockedTabs,
      historyRows,
      completedYearData,
      ["change"]
    );

    setRowsByTab(nextRowsByTab);
    setTabMessage("change", `${checkedRows.length}건의 수정사항을 삭제했습니다.`);
  } catch (e: any) {
    setTabMessage("change", `수정사항 삭제 저장 실패: ${e.message}`);
  }
};
  const handleFinalizeCurrentYear = async () => {
    const year = yearValue.trim();

    if (!year) {
      window.alert("당기 RCM의 년도를 입력해주세요.");
      return;
    }

    const confirmed = window.confirm("최종완료된 RCM은 수정할 수 없습니다. 최종완료하시겠습니까");

    if (!confirmed) {
      setTabMessage("current", "최종완료가 취소되었습니다.");
      return;
    }

    const finalizedRows = (rowsByTab.current ?? []).map((row) => ({ ...row }));

    const nextCompletedYearData = {
      ...completedYearData,
      [year]: finalizedRows,
    };

    const nextLockedTabs = {
      ...lockedTabs,
      current: true,
    };

    try {
      await saveToLocalStorage(
  rowsByTab,
  yearValue,
  nextLockedTabs,
  historyRows,
  {},
  ["current"]
);

await fetch("/api/rcm", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    mode: "yearly",
    year,
    rows: finalizedRows,
  }),
});
      setCompletedYearData(nextCompletedYearData);
      setSelectedYear(year);
      setLockedTabs(nextLockedTabs);
      setTabMessage("current", `${year}년 RCM이 최종완료되어 년도별 RCM 탭에 반영되었습니다.`);
    } catch {
      setTabMessage("current", "최종완료 저장에 실패했습니다.");
    }
  };

  const handleDeleteSelectedYear = async () => {
    if (!selectedYear) {
      window.alert("삭제할 년도를 선택해주세요.");
      return;
    }

    const confirmed = window.confirm(`${selectedYear}년 RCM을 삭제하시겠습니까?`);

    if (!confirmed) return;

    const nextCompletedYearData = { ...completedYearData };
    delete nextCompletedYearData[selectedYear];

    const remainingYears = Object.keys(nextCompletedYearData).sort().reverse();
    const nextSelectedYear = remainingYears[0] ?? "";

    try {
      const res = await fetch("/api/rcm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "deleteYearly",
          year: selectedYear,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }

      setCompletedYearData(nextCompletedYearData);
      setSelectedYear(nextSelectedYear);
      setTabMessage("yearly", `${selectedYear}년 RCM이 년도별 RCM에서 삭제되었습니다.`);
    } catch {
      setTabMessage("yearly", "년도별 RCM 삭제 저장에 실패했습니다.");
    }
  };

  const handleReset = async () => {
    if (activeTab === "current") {
      const nextRowsByTab: Record<TabKey, RowData[]> = {
        ...rowsByTab,
        current: [buildEmptyRow("current")],
        history: [],
        yearly: [],
      };
      const nextLockedTabs = {
        ...lockedTabs,
        current: false,
      };
      try {
        await saveToLocalStorage(
  nextRowsByTab,
  yearValue,
  nextLockedTabs,
  historyRows,
  completedYearData,
  ["current"]
);
        setRowsByTab(nextRowsByTab);
        setLockedTabs(nextLockedTabs);
        setTabMessage("current", "당기 RCM 탭을 초기화했습니다.");
      } catch {
        setTabMessage(activeTab, "초기화 저장에 실패했습니다.");
      }
      return;
    }

    if (activeTab === "previous") {
      const nextRowsByTab: Record<TabKey, RowData[]> = {
        ...rowsByTab,
        previous: [buildEmptyRow("previous")],
        history: [],
        yearly: [],
      };
      const nextLockedTabs = {
        ...lockedTabs,
        previous: false,
      };
      try {
        await saveToLocalStorage(
  nextRowsByTab,
  yearValue,
  nextLockedTabs,
  historyRows,
  completedYearData,
  ["previous"]
);
        setRowsByTab(nextRowsByTab);
        setLockedTabs(nextLockedTabs);
        setTabMessage("previous", "전기 RCM 탭을 초기화했습니다.");
      } catch {
        setTabMessage(activeTab, "초기화 저장에 실패했습니다.");
      }
      return;
    }

    if (activeTab === "change") {
      const nextRowsByTab: Record<TabKey, RowData[]> = {
        ...rowsByTab,
        change: [],
        history: [],
        yearly: [],
      };
      try {
        await saveToLocalStorage(
  nextRowsByTab,
  yearValue,
  lockedTabs,
  historyRows,
  completedYearData,
  ["change"]
);
        setRowsByTab(nextRowsByTab);
        setChangeSearch("");
        setTabMessage("change", "수정사항 탭을 초기화했습니다.");
      } catch {
        setTabMessage(activeTab, "초기화 저장에 실패했습니다.");
      }
      return;
    }

    if (activeTab === "history") {
      try {
        await saveToLocalStorage(
          rowsByTab,
          yearValue,
          lockedTabs,
          [],
          completedYearData,
          [],
          { historyRows: true }
        );
        setHistoryRows([]);
        setTabMessage("history", "변경이력 탭을 초기화했습니다.");
      } catch {
        setTabMessage("history", "변경이력 초기화 저장에 실패했습니다.");
      }
    }
  };
  const handleDeleteHistoryRows = async () => {
    if (activeTab !== "history") return;

    const checkedRows = historyRows.filter((row) => row.checked === "Y");

    if (checkedRows.length === 0) {
      window.alert("삭제할 항목을 체크해주세요.");
      return;
    }

    const confirmed = window.confirm(`${checkedRows.length}건을 삭제하시겠습니까?`);

    if (!confirmed) return;

    const nextHistoryRows = historyRows
      .filter((row) => row.checked !== "Y")
      .map((row, idx) => ({
        ...row,
        checked: "",
        no: idx + 1,
      }));

    try {
      await saveToLocalStorage(
        rowsByTab,
        yearValue,
        lockedTabs,
        nextHistoryRows,
        completedYearData,
        [],
        { historyRows: true }
      );
      setHistoryRows(nextHistoryRows);
      setTabMessage("history", `${checkedRows.length}건의 변경이력을 삭제했습니다.`);
    } catch {
      setTabMessage("history", "변경이력 삭제 저장에 실패했습니다.");
    }
  };
  const handleClearHistoryChecks = () => {
    if (activeTab !== "history") return;

    const hasCheckedRows = historyRows.some((row) => row.checked === "Y");

    if (!hasCheckedRows) {
      setTabMessage("history", "해제할 체크 항목이 없습니다.");
      return;
    }

    setHistoryRows((prev) =>
      prev.map((row) => ({
        ...row,
        checked: "",
      }))
    );
    setTabMessage("history", "변경이력 삭제 체크박스를 전체 해제했습니다.");
  };
  const handleAddChangeRow = () => {
    setRowsByTab((prev) => ({
      ...prev,
      change: [...(prev.change ?? []), buildEmptyRow("change")],
    }));
    setTabMessage("change", "수정사항 탭에 빈 행을 추가했습니다.");
  };

  const handleDownloadExcel = () => {
    const tabNameMap: Record<TabKey, string> = {
      current: "당기_RCM",
      previous: "전기_RCM",
      change: "수정사항",
      history: "변경이력",
      yearly: selectedYear ? `${selectedYear}_년도별_RCM` : "년도별_RCM",
    };

    const downloadColumns = getColumnsByTab(activeTab);
    const downloadRows =
      activeTab === "history"
        ? historyRows.map((row) => ({
            no: String(row.no),
            담당자: row["담당자"] ?? "",
            수정일: row["수정일"],
            "Mega Process": row["Mega Process"],
            "Control No": row["Control No"],
            "Control Name": row["Control Name"],
            "변경 항목": row["변경 항목"],
            "AS-IS": row["AS-IS"],
            "TO-BE": row["TO-BE"],
            수정사유: row["수정사유"],
          }))
        : activeTab === "yearly"
        ? completedYearData[selectedYear] ?? []
        : rowsByTab[activeTab] ?? [];

    const groupHeaderHtml = downloadColumns
      .reduce<Array<{ group: string; span: number }>>((acc, col) => {
        const last = acc[acc.length - 1];
        if (last && last.group === col.group) {
          last.span += 1;
        } else {
          acc.push({ group: col.group, span: 1 });
        }
        return acc;
      }, [])
      .map((g) => `<th colspan="${g.span}">${g.group}</th>`)
      .join("");

    const columnHeaderHtml = downloadColumns
      .map((col) => `<th>${col.label.replace(/\n/g, " ")}</th>`)
      .join("");

    const bodyHtml = downloadRows
      .map((row) => {
        const cells = downloadColumns
  .map((col: Column) => {
    const value = String((row as RowData)[col.key] ?? "")
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/\n/g, " ");

            return `<td>${value}</td>`;
          })
          .join("");

        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            table { border-collapse: collapse; }
            th, td {
              border: 1px solid #999;
              padding: 6px;
              font-size: 11pt;
              mso-number-format:"\\@";
              white-space: normal;
            }
            th {
              background-color: #d9e2f3;
              font-weight: bold;
              text-align: center;
            }
          </style>
        </head>
        <body>
<div style="padding: 0 30px;">
  <table>
    <thead>
      <tr>${groupHeaderHtml}</tr>
      <tr>${columnHeaderHtml}</tr>
    </thead>
    <tbody>${bodyHtml}</tbody>
  </table>
</div>
        </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", html], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.download = `${tabNameMap[activeTab]}_${today}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTabMessage(activeTab, `${tabNameMap[activeTab]} 탭을 엑셀로 다운로드했습니다.`);
  };


  const tabButtonStyle = (tab: TabKey): React.CSSProperties => ({
    background: activeTab === tab ? "#334155" : "#e2e8f0",
    color: activeTab === tab ? "white" : "#0f172a",
    border: activeTab === tab ? "1px solid #334155" : "1px solid #cbd5e1",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 600,
  });

  const renderCellInput = (col: Column, row: RowData, rowIndex: number, colIndex: number) => {
    const commonStyle: React.CSSProperties = {
      width: "100%",
      minHeight: "42px",
      border: "none",
      outline: "none",
      padding: "8px",
      fontSize: "12px",
      fontFamily: "Arial, sans-serif",
      lineHeight: 1.35,
      boxSizing: "border-box",
      background: "transparent",
    };

     if (col.type === "checkbox") {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "42px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
      }}
    >
      <input
        type="checkbox"
        checked={row[col.key] === "Y"}
        disabled={isLocked}
        onChange={(e) => {
          const checked = e.target.checked;
          const nextValue = checked ? "Y" : "";

          if ((activeTab as TabKey) === "history") {
            setHistoryRows((prev) =>
              prev.map((r, idx) =>
                idx === rowIndex ? { ...r, checked: nextValue } : r
              )
            );
            return;
          }

          handleSingleCellChange(rowIndex, col.key, nextValue);
        }}
        onFocus={() => setActiveCell({ row: rowIndex, col: colIndex })}
        style={{
          width: "16px",
          height: "16px",
          cursor: isLocked ? "default" : "pointer",
        }}
      />
    </div>
  );
}
if (activeTab === "history" || activeTab === "yearly") {
      return (
        <div
          style={{
            ...commonStyle,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {row[col.key] ?? ""}
        </div>
      );
    }

    if (col.type === "select") {
      return (
        <select
          value={row[col.key] ?? ""}
          disabled={isLocked}
          onChange={(e) => handleSingleCellChange(rowIndex, col.key, e.target.value)}
          onFocus={() => setActiveCell({ row: rowIndex, col: colIndex })}
          onPaste={(e) => handleCellPaste(e, rowIndex, colIndex)}
          style={{ ...commonStyle, minHeight: "42px" }}
        >
          {(col.options ?? [""]).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }


    if ((col.type as Column["type"]) === "select") {
  return (
    <select
      value={row[col.key] ?? ""}
      disabled={isLocked}
      onChange={(e) => handleSingleCellChange(rowIndex, col.key, e.target.value)}
      onFocus={() => setActiveCell({ row: rowIndex, col: colIndex })}
      onPaste={(e) => handleCellPaste(e, rowIndex, colIndex)}
      style={{ ...commonStyle, minHeight: "42px" }}
    >
      {(col.options ?? [""]).map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

    if (col.type === "date") {
      return (
        <input
  type="text"
  placeholder="YYYY-MM-DD"
  value={row[col.key] ?? ""}
  disabled={isLocked}
  readOnly={isLocked}
  onChange={(e) => handleSingleCellChange(rowIndex, col.key, e.target.value)}
  onFocus={() => setActiveCell({ row: rowIndex, col: colIndex })}
  onPaste={(e) => handleCellPaste(e, rowIndex, colIndex)}
  style={{ ...commonStyle, minHeight: "42px" }}
/>
      );
    }

    return (
      <textarea
        value={row[col.key] ?? ""}
        readOnly={isLocked}
        onChange={(e) => handleSingleCellChange(rowIndex, col.key, e.target.value)}
        onFocus={() => setActiveCell({ row: rowIndex, col: colIndex })}
        onPaste={(e) => handleCellPaste(e, rowIndex, colIndex)}
        style={{ ...commonStyle, resize: "vertical" }}
      />
    );
  };

  return ( <div style={{ padding: "18px", fontFamily: "Arial, sans-serif", backgroundColor: "white", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
        <img src="/logo.png" alt="logo" style={{ height: "48px", background: "white" }} />
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>RCM</h1>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
        <button onClick={() => setActiveTab("current")} style={tabButtonStyle("current")}>당기 RCM</button>
        <button onClick={() => setActiveTab("previous")} style={tabButtonStyle("previous")}>전기 RCM</button>
        <button onClick={() => setActiveTab("change")} style={tabButtonStyle("change")}>수정사항</button>
        <button onClick={() => setActiveTab("history")} style={tabButtonStyle("history")}>변경이력</button>
        <button onClick={() => setActiveTab("yearly")} style={tabButtonStyle("yearly")}>년도별 RCM</button>
      </div>

      {activeTab === "current" && (
        <div style={{ marginBottom: "14px", background: "white", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "14px" }}>
          <div style={{ fontSize: "13px", color: "#475569", marginBottom: "8px" }}>년도 입력</div>
          <input
            value={yearValue}
            onChange={(e) => setYearValue(e.target.value)}
            placeholder="예: 2026"
            disabled={isLocked}
            style={{ padding: "10px 12px", width: "180px", border: "1px solid #b8c4d6", borderRadius: "6px", background: "white" }}
          />
        </div>
      )}

      {activeTab === "change" && (
        <div style={{ marginBottom: "14px", background: "white", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "14px" }}>
          <div style={{ fontSize: "13px", color: "#475569", marginBottom: "8px", fontWeight: 600 }}>당기 Control No.</div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
            <input
              value={changeSearch}
              onChange={(e) => setChangeSearch(e.target.value)}
              placeholder="Control No. 입력"
              style={{ padding: "10px 12px", width: "320px", border: "1px solid #b8c4d6", borderRadius: "6px", background: "white" }}
            />
            <button onClick={handleSearchCurrentRows} style={{ background: "#334155", color: "white", border: "none", borderRadius: "6px", padding: "10px 14px", cursor: "pointer" }}>
              조회
            </button>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "12px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
        {activeTab !== "change" && activeTab !== "history" && activeTab !== "yearly" && (
          <button onClick={handleSave} style={{ background: "#334155", color: "white", border: "none", borderRadius: "6px", padding: "10px 14px", cursor: "pointer" }}>
            저장
          </button>
        )}

        {activeTab !== "yearly" && (
          <button onClick={handleReset} style={{ background: "#e2e8f0", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px 14px", cursor: "pointer" }}>
            초기화
          </button>
        )}
        {activeTab === "history" && (
          <>
            <button onClick={handleDeleteHistoryRows} style={{ background: "#dc2626", color: "white", border: "none", borderRadius: "6px", padding: "10px 14px", cursor: "pointer" }}>
              삭제
            </button>
            <button onClick={handleClearHistoryChecks} style={{ background: "#e2e8f0", color: "#0f172a", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "10px 14px", cursor: "pointer" }}>
              전체 해제
            </button>
          </>
        )}
        {activeTab === "current" && (
          <button onClick={handleFinalizeCurrentYear} style={{ background: "#7c3aed", color: "white", border: "none", borderRadius: "6px", padding: "10px 14px", cursor: "pointer" }}>
            최종완료
          </button>
        )}

        {activeTab === "yearly" && (
          <>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ padding: "10px 12px", border: "1px solid #b8c4d6", borderRadius: "6px", background: "white" }}
            >
              <option value="">년도 선택</option>
              {Object.keys(completedYearData)
                .sort()
                .reverse()
                .map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
            </select>
            <button onClick={handleDeleteSelectedYear} style={{ background: "#dc2626", color: "white", border: "none", borderRadius: "6px", padding: "10px 14px", cursor: "pointer" }}>
              선택년도 삭제
            </button>
          </>
        )}

        <button onClick={handleDownloadExcel} style={{ background: "#16a34a", color: "white", border: "none", borderRadius: "6px", padding: "10px 14px", cursor: "pointer" }}>
          엑셀 다운로드
        </button>

        {activeTab === "change" && (
          <>
            <button onClick={handleAddChangeRow} title="행 추가" style={{ width: "36px", height: "36px", borderRadius: "9999px", border: "1px solid #334155", background: "white", color: "#334155", fontSize: "22px", lineHeight: 1, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: 700, padding: 0 }}>
              +
            </button>
            <button onClick={handleApplyChanges} style={{ background: "#2563eb", color: "white", border: "none", borderRadius: "6px", padding: "10px 14px", cursor: "pointer" }}>
  적용
</button>
<button onClick={handleSaveSelectedChangeRows} style={{ background: "#16a34a", color: "white", border: "none", borderRadius: "6px", padding: "10px 14px", cursor: "pointer" }}>
  저장
</button>
<button onClick={handleDeleteSelectedChangeRows} style={{ background: "#dc2626", color: "white", border: "none", borderRadius: "6px", padding: "10px 14px", cursor: "pointer" }}>
  삭제
</button>
          </>
        )}

        {activeTab !== "yearly" && (
          <input
            placeholder="전체 컬럼 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "10px 12px", width: "300px", border: "1px solid #b8c4d6", borderRadius: "6px", background: "white" }}
          />
        )}

        <span style={{ fontSize: "13px", color: "#475569" }}>조회 건수: {filtered.length}</span>
        {message && <span style={{ fontSize: "12px", color: "#334155" }}>{message}</span>}
        {activeTab !== "change" && activeTab !== "history" && activeTab !== "yearly" && isLocked && (
          <span style={{ fontSize: "12px", color: "#b91c1c", fontWeight: 600 }}>
            저장 완료되어 직접 수정이 잠겨 있습니다.
          </span>
        )}
      </div>

<div style={{ border: "1px solid #8fa1b7", borderRadius: "8px", overflow: "auto", flex: 1, backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", margin: "0 1px" }}>
  <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: activeTab === "history" ? "1640px" : "7600px", fontSize: "12px" }}>
    <thead>
      <tr>
        {groupHeaders.map((g) => (
          <th key={g.group} colSpan={g.span} style={{ border: "1px solid #8a98ac", padding: "6px 8px", color: "white", backgroundColor: "#4e5b6b", textAlign: "center", fontWeight: "bold", position: "sticky", top: 0, zIndex: 3, whiteSpace: "nowrap" }}>
            {g.group}
          </th>
        ))}
      </tr>
      <tr>
        {columns.map((col) => (
          <th key={col.key} style={{ border: "1px solid #8fa1b7", padding: "0", backgroundColor: hasFilter(col.key) ? "#8ea4c5" : "#a9b7ca", color: "white", position: "sticky", top: 33, zIndex: 2, width: col.width, minWidth: col.width, maxWidth: col.width, verticalAlign: "top" }}>
            <div style={{ padding: "8px 8px 4px 8px", whiteSpace: "pre-line", textAlign: "center", minHeight: "54px", fontWeight: "bold", lineHeight: 1.2 }}>
              {col.label}
            </div>

{!(activeTab === "history" && col.key === "checked") && (
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 6px 6px 6px", position: "relative" }} ref={openFilter === col.key ? filterRef : null}>
              <button onClick={(e) => {const rect = e.currentTarget.getBoundingClientRect();const popupWidth = 110;setFilterPos({top: rect.bottom + 4,left: rect.right - popupWidth});setOpenFilter((prev) => (prev === col.key ? null : col.key));}} style={{ width: "18px", height: "18px", background: hasFilter(col.key) ? "#dbeafe" : "#edf2f7", border: "1px solid #95a3b8", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><span style={{ fontSize: "10px", color: hasFilter(col.key) ? "#1d4ed8" : "#4b5563" }}>▼</span></button>
      

              {openFilter === col.key && (
                <div style={{position: "fixed",top: filterPos?.top ?? 0,left: filterPos?.left ?? 0,width: "150px",maxHeight: "260px",overflowY: "auto",background: "white",border: "1px solid #94a3b8",boxShadow: "0 8px 24px rgba(0,0,0,0.18)",zIndex: 99999,color: "#111827",borderRadius: "6px",textAlign: "left",}}>
                  <div style={{ padding: "8px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "bold", fontSize: "12px" }}>{col.label.split("\n")[0]}</span>
                    <button onClick={() => clearColumnFilter(col.key)} style={{ border: "none", background: "transparent", color: "#2563eb", cursor: "pointer", fontSize: "12px" }}>
                      초기화
                    </button>
                  </div>
                  <div style={{ padding: "8px" }}>
                    {optionsByColumn[col.key].length === 0 ? (
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>값 없음</div>
                    ) : (
                      optionsByColumn[col.key].map((option) => (
                        <label key={option} style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12px", padding: "4px 0", cursor: "pointer" }}>
                          <input type="checkbox" checked={(filters[col.key] ?? []).includes(option)} onChange={() => toggleFilterValue(col.key, option)} />
                          <span style={{ wordBreak: "break-word", lineHeight: 1.3 }}>{option}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            )}
          </th>
        ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row: RowData, rowIndex: number) => (
              <tr key={rowIndex} style={{ backgroundColor: row["신설/삭제"] === "삭제" ? "#e5e7eb" : rowIndex % 2 === 0 ? "#ffffff" : "#f8fbff" }}>
                {columns.map((col: Column, colIndex: number) => (
                  <td key={col.key} style={{ border: activeTab !== "history" && activeTab !== "yearly" && activeCell?.row === rowIndex && activeCell?.col === colIndex ? "2px solid #2563eb" : "1px solid #c2cfdf", padding: "0", verticalAlign: "top", width: col.width, minWidth: col.width, maxWidth: col.width, backgroundColor: activeTab !== "history" && activeTab !== "yearly" && activeCell?.row === rowIndex && activeCell?.col === colIndex ? "#eff6ff" : undefined }}>
                    {renderCellInput(col, row, rowIndex, colIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
