import React, { useMemo, useState } from "react";
import Filters from "./components/Filters";
import Sidebar from "./components/Sidebar";
import AttributionPage from "./pages/AttributionPage";
import ExportsPage from "./pages/ExportsPage";
import OverviewPage from "./pages/OverviewPage";
import ShareEmbedPage from "./pages/ShareEmbedPage";
import {
  DATE_PRESETS,
  MOCK_DATA_NOTICE,
  mockEvents,
  mockExports
} from "./mockData";
import {
  brandVisibilityTrend,
  buildInsights,
  buildVisibilityOpportunities,
  filterExports,
  performanceByAttributionType,
  performanceByFormat,
  performanceByMethod,
  shareEmbedMetrics,
  summarize
} from "./analytics";

export default function App() {
  const [page, setPage] = useState("overview");
  const [format, setFormat] = useState("All");
  const [status, setStatus] = useState("All");
  const [method, setMethod] = useState("All");
  const [dateRangeId, setDateRangeId] = useState("all");

  const datePreset = DATE_PRESETS.find((preset) => preset.id === dateRangeId) ?? DATE_PRESETS[0];
  const filterState = { format, status, method, datePreset };

  // Swap `mockExports` / `mockEvents` for analytics/API responses when export tracking is live.
  const filtered = useMemo(() => filterExports(mockExports, filterState), [format, status, method, datePreset]);
  const filteredEvents = useMemo(() => filterExports(mockEvents, filterState), [format, status, method, datePreset]);

  const totals = useMemo(() => summarize(filtered), [filtered]);
  const byFormat = useMemo(() => performanceByFormat(filtered), [filtered]);
  const byMethod = useMemo(() => performanceByMethod(filtered), [filtered]);
  const byType = useMemo(() => performanceByAttributionType(filtered), [filtered]);
  const trend = useMemo(() => brandVisibilityTrend(filtered), [filtered]);
  const insights = useMemo(
    () => buildInsights({ totals, byFormat, byMethod, trend }),
    [totals, byFormat, byMethod, trend]
  );
  const opportunities = useMemo(
    () => buildVisibilityOpportunities({ totals, byFormat, byMethod }),
    [totals, byFormat, byMethod]
  );
  const shareMetrics = useMemo(() => shareEmbedMetrics(filtered), [filtered]);

  const resetFilters = () => {
    setFormat("All");
    setStatus("All");
    setMethod("All");
    setDateRangeId("all");
  };

  return (
    <div className="app-frame">
      <Sidebar currentPage={page} onNavigate={setPage} />
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
          method={method}
          dateRangeId={dateRangeId}
          onFormat={setFormat}
          onStatus={setStatus}
          onMethod={setMethod}
          onDateRange={setDateRangeId}
          onReset={resetFilters}
        />

        {page === "overview" ? (
          <OverviewPage
            totals={totals}
            byFormat={byFormat}
            byMethod={byMethod}
            trend={trend}
            insights={insights}
            opportunities={opportunities}
          />
        ) : null}
        {page === "exports" ? <ExportsPage events={filteredEvents} /> : null}
        {page === "attribution" ? <AttributionPage totals={totals} byFormat={byFormat} byType={byType} /> : null}
        {page === "share-embed" ? <ShareEmbedPage metrics={shareMetrics} /> : null}

        <footer>
          Brand Visibility Rate = Attributed Exports / Total Exports × 100. {MOCK_DATA_NOTICE}
        </footer>
      </div>
    </div>
  );
}
