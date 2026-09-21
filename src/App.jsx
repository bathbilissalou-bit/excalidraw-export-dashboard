import React, { useMemo, useState } from "react";
import {
  ATTRIBUTION_STATUSES,
  DATE_PRESETS,
  FORMATS,
  METHODS,
  MOCK_DATA_NOTICE,
  mockExports
} from "./mockData";
import {
  brandVisibilityTrend,
  buildInsights,
  filterExports,
  formatNumber,
  formatPercent,
  formatShortDate,
  performanceByFormat,
  performanceByMethod,
  summarize
} from "./analytics";

function MetricCard({ label, value, description, emphasized = false }) {
  return (
    <article className={`card metric-card${emphasized ? " metric-card-emphasized" : ""}`}>
      <h3 className="metric-label">{label}</h3>
      <p className="metric-value">{value}</p>
      <p className="metric-helper">{description}</p>
    </article>
  );
}

function MiniLineChart({ data }) {
  const width = 680;
  const height = 240;
  const pad = { top: 28, right: 18, bottom: 36, left: 44 };

  if (!data.length) {
    return <div className="empty">No trend data for this filter.</div>;
  }

  const min = 0;
  const max = 1;
  const innerWidth = width - pad.left - pad.right;
  const innerHeight = height - pad.top - pad.bottom;
  const points = data.map((item, index) => {
    const x = pad.left + (index * innerWidth) / Math.max(data.length - 1, 1);
    const y = pad.top + innerHeight - item.rate * innerHeight;
    return { ...item, x, y };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${pad.top + innerHeight} L ${points[0].x} ${pad.top + innerHeight} Z`;
  const gridRates = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Brand visibility rate over time">
      {gridRates.map((rate) => {
        const y = pad.top + innerHeight - rate * innerHeight;
        return (
          <g key={rate}>
            <line x1={pad.left} x2={width - pad.right} y1={y} y2={y} className="grid-line" />
            <text x={pad.left - 8} y={y + 4} textAnchor="end" className="axis-text">
              {Math.round(rate * 100)}%
            </text>
          </g>
        );
      })}
      <path d={areaPath} className="trend-fill" />
      <path d={linePath} className="trend-line" fill="none" />
      {points.map((point, index) => {
        const isFirst = index === 0;
        const isLast = index === points.length - 1;
        return (
          <g key={point.date}>
            <circle cx={point.x} cy={point.y} r="4.5" className="trend-dot" />
            <text
              x={isFirst ? point.x + 8 : isLast ? point.x - 4 : point.x}
              y={Math.max(point.y - 10, 14)}
              textAnchor={isFirst ? "start" : isLast ? "end" : "middle"}
              className="point-text"
            >
              {formatPercent(point.rate)}
            </text>
            <text x={point.x} y={height - 10} textAnchor="middle" className="axis-text">
              {formatShortDate(point.date)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function AttributionSplit({ attributed, unattributed, rate, total }) {
  const attributedWidth = total ? rate * 100 : 0;
  const unattributedWidth = total ? 100 - attributedWidth : 0;

  return (
    <section className="card panel">
      <div className="panel-header">
        <div>
          <h2>Attribution status</h2>
          <p>Attributed vs. unattributed exports in the current view.</p>
        </div>
      </div>
      <div
        className="split-bar"
        role="img"
        aria-label={`${formatPercent(rate)} attributed, ${formatPercent(1 - rate)} unattributed`}
      >
        <div className="split-attributed" style={{ width: `${attributedWidth}%` }} />
        <div className="split-unattributed" style={{ width: `${unattributedWidth}%` }} />
      </div>
      <div className="split-legend">
        <div className="legend-item">
          <span className="legend-swatch attributed" />
          <div>
            <strong>Attributed</strong>
            <span>
              {formatNumber(attributed)} exports · {formatPercent(rate)}
            </span>
          </div>
        </div>
        <div className="legend-item">
          <span className="legend-swatch unattributed" />
          <div>
            <strong>Unattributed</strong>
            <span>
              {formatNumber(unattributed)} exports · {formatPercent(total ? 1 - rate : 0)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [format, setFormat] = useState("All");
  const [status, setStatus] = useState("All");
  const [method, setMethod] = useState("All");
  const [dateRangeId, setDateRangeId] = useState("all");

  const datePreset = DATE_PRESETS.find((preset) => preset.id === dateRangeId) ?? DATE_PRESETS[0];

  // Swap `mockExports` for an analytics/API response when export tracking is live.
  const filtered = useMemo(
    () => filterExports(mockExports, { format, status, method, datePreset }),
    [format, status, method, datePreset]
  );

  const totals = useMemo(() => summarize(filtered), [filtered]);
  const byFormat = useMemo(() => performanceByFormat(filtered), [filtered]);
  const byMethod = useMemo(() => performanceByMethod(filtered), [filtered]);
  const trend = useMemo(() => brandVisibilityTrend(filtered), [filtered]);
  const insights = useMemo(
    () => buildInsights({ totals, byFormat, trend }),
    [totals, byFormat, trend]
  );

  const resetFilters = () => {
    setFormat("All");
    setStatus("All");
    setMethod("All");
    setDateRangeId("all");
  };

  return (
    <div className="app-shell">
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

      <section className="filters card" aria-label="Dashboard filters">
        <div>
          <label htmlFor="format-filter">Export Format</label>
          <select id="format-filter" value={format} onChange={(event) => setFormat(event.target.value)}>
            <option>All</option>
            {FORMATS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status-filter">Attribution Status</label>
          <select id="status-filter" value={status} onChange={(event) => setStatus(event.target.value)}>
            {ATTRIBUTION_STATUSES.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="method-filter">Export Method</label>
          <select id="method-filter" value={method} onChange={(event) => setMethod(event.target.value)}>
            <option>All</option>
            {METHODS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date-filter">Date Range</label>
          <select id="date-filter" value={dateRangeId} onChange={(event) => setDateRangeId(event.target.value)}>
            {DATE_PRESETS.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>
        <button className="reset" type="button" onClick={resetFilters}>
          Reset Filters
        </button>
      </section>

      <section className="metrics-grid" aria-label="Brand visibility KPIs">
        <MetricCard
          label="Total Exports"
          value={formatNumber(totals.total)}
          description="All export events in the selected period"
        />
        <MetricCard
          label="Attributed Exports"
          value={formatNumber(totals.attributed)}
          description="Exports carrying visible Excalidraw attribution"
        />
        <MetricCard
          label="Unattributed Exports"
          value={formatNumber(totals.unattributed)}
          description="Exports with no visible attribution"
        />
        <MetricCard
          label="Brand Visibility Rate"
          value={formatPercent(totals.rate)}
          description="Share of exports carrying visible attribution"
          emphasized
        />
      </section>

      <section className="secondary-grid">
        <AttributionSplit
          attributed={totals.attributed}
          unattributed={totals.unattributed}
          rate={totals.rate}
          total={totals.total}
        />
        <article className="card panel engagement-card">
          <div className="panel-header">
            <div>
              <h2>Open / Edit in Excalidraw Clicks</h2>
              <p>Mock clicks from attributed shared or embedded content.</p>
            </div>
          </div>
          <p className="engagement-value">{formatNumber(totals.clicks)}</p>
          <p className="engagement-note">Secondary engagement metric. Brand Visibility Rate remains the primary KPI.</p>
        </article>
      </section>

      <section className="content-grid">
        <div className="card panel wide">
          <div className="panel-header">
            <div>
              <h2>Brand Visibility Rate Over Time</h2>
              <p>Percentage of exports carrying visible attribution.</p>
            </div>
          </div>
          <MiniLineChart data={trend} />
        </div>
        <div className="card panel">
          <div className="panel-header">
            <div>
              <h2>Quick insights</h2>
              <p>What the Head of Marketing can act on.</p>
            </div>
          </div>
          <div className="insight-list">
            {insights.map((insight) => (
              <div className="insight" key={insight.title}>
                <span className="insight-dot" />
                <div>
                  <strong>{insight.title}</strong>
                  <span>{insight.body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card panel">
        <div className="panel-header">
          <div>
            <h2>Performance by export format</h2>
            <p>Compare where brand visibility is strongest and where attribution is lost.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Format</th>
                <th>Total Exports</th>
                <th>Attributed</th>
                <th>Unattributed</th>
                <th>Visibility Rate</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {byFormat.map((row) => (
                <tr key={row.format}>
                  <td data-label="Format">
                    <span className="format-pill">{row.format}</span>
                  </td>
                  <td data-label="Total Exports">{formatNumber(row.total)}</td>
                  <td data-label="Attributed">{formatNumber(row.attributed)}</td>
                  <td data-label="Unattributed">{formatNumber(row.unattributed)}</td>
                  <td data-label="Visibility Rate">{row.total ? formatPercent(row.rate) : "—"}</td>
                  <td data-label="Progress">
                    <div className="progress-track" aria-hidden="true">
                      <div className="progress-fill" style={{ width: `${Math.round(row.rate * 100)}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card panel">
        <div className="panel-header">
          <div>
            <h2>Export method</h2>
            <p>Total activity and visibility rate for download, share, and embed.</p>
          </div>
        </div>
        <div className="method-grid">
          {byMethod.map((row) => (
            <article className="method-card" key={row.method}>
              <h3>{row.method}</h3>
              <p className="method-total">{formatNumber(row.total)}</p>
              <p className="method-label">Total activity</p>
              <div className="method-rate-row">
                <span>Visibility rate</span>
                <strong>{row.total ? formatPercent(row.rate) : "—"}</strong>
              </div>
              <div className="progress-track method-progress" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${Math.round(row.rate * 100)}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card context-panel">
        <h2>Why this dashboard matters</h2>
        <p>
          Marketing currently needs a way to measure whether exported and shared Excalidraw content carries visible
          attribution. This prototype demonstrates how export tracking could support the Brand Visibility Rate KPI.
        </p>
        <p className="mock-note">{MOCK_DATA_NOTICE}</p>
      </section>

      <footer>
        Brand Visibility Rate = Attributed Exports / Total Exports × 100. {MOCK_DATA_NOTICE}
      </footer>
    </div>
  );
}
