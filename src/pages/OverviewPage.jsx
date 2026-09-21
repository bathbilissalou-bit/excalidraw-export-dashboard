import React from "react";
import AttributionSplit from "../components/AttributionSplit";
import MetricCard from "../components/MetricCard";
import MiniLineChart from "../components/MiniLineChart";
import { MOCK_DATA_NOTICE } from "../mockData";
import { formatNumber, formatPercent, rankFormats } from "../analytics";

export default function OverviewPage({ totals, byFormat, byMethod, trend, insights, opportunities }) {
  const { best, worst } = rankFormats(byFormat);

  return (
    <>
      <p className="section-kicker">Measure visibility</p>
      <section className="metrics-grid" aria-label="Brand visibility KPIs">
        <MetricCard
          kicker="Primary Marketing KPI"
          label="Brand Visibility Rate"
          value={formatPercent(totals.rate)}
          description="Attributed exports / total exports"
          emphasized
        />
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
      </section>

      <section className="secondary-grid">
        <article className="card panel">
          <div className="panel-header">
            <div>
              <h2>Attribution status</h2>
              <p>Attributed vs. unattributed exports in the current view.</p>
            </div>
          </div>
          <AttributionSplit
            attributed={totals.attributed}
            unattributed={totals.unattributed}
            rate={totals.rate}
            total={totals.total}
          />
        </article>
        <article className="card panel engagement-card">
          <p className="metric-kicker">Secondary engagement metric</p>
          <div className="panel-header">
            <div>
              <h2>Open/Edit in Excalidraw Clicks</h2>
              <p>Clicks from attributed share pages and embeds, not a substitute for Brand Visibility Rate.</p>
            </div>
          </div>
          <p className="engagement-value">{formatNumber(totals.clicks)}</p>
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
              <p>Calculated from the current filtered mock data.</p>
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
            <h2>Visibility by export format</h2>
            <p>Compare where brand visibility is strongest and where it drops after export.</p>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Format</th>
                <th>Total Exports</th>
                <th>Attributed Exports</th>
                <th>Brand Visibility Rate</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {byFormat.map((row) => {
                const isBest = best && row.format === best.format && row.total > 0;
                const isWorst = worst && row.format === worst.format && row.total > 0;
                return (
                  <tr key={row.format} className={isBest ? "row-best" : isWorst ? "row-worst" : ""}>
                    <td data-label="Format">
                      <span className="format-pill">{row.format}</span>
                      {isBest ? <span className="rank-badge rank-high">Highest</span> : null}
                      {isWorst ? <span className="rank-badge rank-low">Lowest</span> : null}
                    </td>
                    <td data-label="Total Exports">{formatNumber(row.total)}</td>
                    <td data-label="Attributed Exports">{formatNumber(row.attributed)}</td>
                    <td data-label="Brand Visibility Rate">{row.total ? formatPercent(row.rate) : "—"}</td>
                    <td data-label="Progress">
                      <div className="progress-track" aria-hidden="true">
                        <div className="progress-fill" style={{ width: `${Math.round(row.rate * 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card panel">
        <div className="panel-header">
          <div>
            <h2>Performance by export method</h2>
            <p>Download, share, and embed after a drawing leaves the app.</p>
          </div>
        </div>
        <div className="method-grid">
          {byMethod.map((row) => (
            <article className="method-card" key={row.method}>
              <h3>{row.method}</h3>
              <p className="method-total">{formatNumber(row.total)}</p>
              <p className="method-label">Total exports</p>
              <div className="method-rate-row">
                <span>Attributed exports</span>
                <strong>{formatNumber(row.attributed)}</strong>
              </div>
              <div className="method-rate-row">
                <span>Brand Visibility Rate</span>
                <strong>{row.total ? formatPercent(row.rate) : "—"}</strong>
              </div>
              <div className="progress-track method-progress" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${Math.round(row.rate * 100)}%` }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card panel opportunities-panel" aria-label="Visibility opportunities">
        <p className="metric-kicker">Maximize visibility</p>
        <div className="panel-header">
          <div>
            <h2>Visibility Opportunities</h2>
            <p>
              Observational cues from the current view, pointing to where optional attribution around the artifact may
              add the most visibility after export.
            </p>
          </div>
        </div>
        <div className="opportunity-grid">
          {opportunities.map((opportunity) => (
            <article className="opportunity-card" key={opportunity.id}>
              <div className="opportunity-top">
                <h3>{opportunity.title}</h3>
                {opportunity.metric ? <span className="opportunity-metric">{opportunity.metric}</span> : null}
              </div>
              <p>{opportunity.body}</p>
            </article>
          ))}
        </div>
        <p className="opportunity-note">
          Opportunities are generated from the currently filtered mock data and are intended to help Marketing identify
          where additional visibility experiments may be most valuable.
        </p>
      </section>

      <section className="card context-panel">
        <h2>Why this dashboard matters</h2>
        <p>
          Many people discover Excalidraw through diagrams shared in PRs, blog posts, slide decks, documentation, and
          websites. This dashboard helps Marketing measure how often those exported artifacts retain visible Excalidraw
          attribution and identify opportunities to improve organic brand visibility.
        </p>
        <p className="mock-note">{MOCK_DATA_NOTICE}</p>
      </section>
    </>
  );
}
