import React, { useMemo, useState } from "react";
import Filters from "./components/Filters";
import Sidebar from "./components/Sidebar";
import OverviewPage from "./pages/OverviewPage";
import { DATE_PRESETS, MOCK_DATA_NOTICE, mockExports } from "./mockData";
import {
  brandVisibilityTrend,
  buildInsights,
  buildVisibilityOpportunities,
  filterExports,
  performanceByFormat,
  summarize
} from "./analytics";

export default function App() {
  const [format, setFormat] = useState("All");
  const [status, setStatus] = useState("All");
  const [dateRangeId, setDateRangeId] = useState("all");

  const datePreset = DATE_PRESETS.find((preset) => preset.id === dateRangeId) ?? DATE_PRESETS[0];

  // Swap `mockExports` for an analytics/API response when export tracking is live.
  const filtered = useMemo(
    () => filterExports(mockExports, { format, status, datePreset }),
    [format, status, datePreset]
  );

  const totals = useMemo(() => summarize(filtered), [filtered]);
  const byFormat = useMemo(() => performanceByFormat(filtered), [filtered]);
  const trend = useMemo(() => brandVisibilityTrend(filtered), [filtered]);
  const insights = useMemo(() => buildInsights({ totals, byFormat, trend }), [totals, byFormat, trend]);
  const opportunities = useMemo(
    () => buildVisibilityOpportunities({ totals, byFormat }),
    [totals, byFormat]
  );

  const resetFilters = () => {
    setFormat("All");
    setStatus("All");
    setDateRangeId("all");
  };

  return (
    <div className="app-frame">
      <Sidebar />
      <div className="app-main">
        <header className="topbar">
          <div className="brand-copy">
            <div className="brand-lockup">
              <div className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 15c2.2-4.2 5.8-4.2 8 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h1>Excalidraw Export Dashboard</h1>
            </div>
            <p className="subtitle">Measure how often exported content carries visible Excalidraw attribution.</p>
          </div>
          <div className="badge">Prototype · Mock Data</div>
        </header>

        <Filters
          format={format}
          status={status}
          dateRangeId={dateRangeId}
          onFormat={setFormat}
          onStatus={setStatus}
          onDateRange={setDateRangeId}
          onReset={resetFilters}
        />

        <OverviewPage
          totals={totals}
          byFormat={byFormat}
          trend={trend}
          insights={insights}
          opportunities={opportunities}
        />

        <footer>
          Brand Visibility Rate = Attributed Exports / Total Exports × 100. {MOCK_DATA_NOTICE}
        </footer>
      </div>
    </div>
  );
}
