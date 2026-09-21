import React from "react";
import AttributionSplit from "../components/AttributionSplit";
import MetricCard from "../components/MetricCard";
import { formatNumber, formatPercent, rankFormats } from "../analytics";

export default function AttributionPage({ totals, byFormat, byType }) {
  const { best, worst } = rankFormats(byFormat);

  return (
    <>
      <section className="metrics-grid attribution-hero" aria-label="Attribution performance">
        <MetricCard
          kicker="Primary Marketing KPI"
          label="Brand Visibility Rate"
          value={formatPercent(totals.rate)}
          description="Share of exports carrying visible Excalidraw attribution"
          emphasized
        />
        <MetricCard
          label="Attributed Exports"
          value={formatNumber(totals.attributed)}
          description="Viewers can identify Excalidraw as the source"
        />
        <MetricCard
          label="Unattributed Exports"
          value={formatNumber(totals.unattributed)}
          description="No visible source cue after the drawing leaves the app"
        />
        <MetricCard
          label="Total Exports"
          value={formatNumber(totals.total)}
          description="Denominator for Brand Visibility Rate"
        />
      </section>

      <section className="card panel">
        <div className="panel-header">
          <div>
            <h2>Attributed vs. unattributed</h2>
            <p>Percentage split of visible attribution in the current view.</p>
          </div>
        </div>
        <AttributionSplit
          attributed={totals.attributed}
          unattributed={totals.unattributed}
          rate={totals.rate}
          total={totals.total}
        />
      </section>

      <section className="card panel">
        <div className="panel-header">
          <div>
            <h2>Attribution type breakdown</h2>
            <p>
              Attribution is modeled as opt-in or contextual: optional file credit, a branded share page, or an Open/Edit
              link around the artifact. It is not treated as a forced watermark.
            </p>
          </div>
        </div>
        <div className="type-grid">
          {byType.map((row) => (
            <article className="method-card" key={row.type}>
              <h3>{row.type}</h3>
              <p className="method-total">{formatNumber(row.total)}</p>
              <p className="method-label">{row.type === "None" ? "Unattributed exports" : "Attributed exports"}</p>
              <div className="method-rate-row">
                <span>Share of current view</span>
                <strong>{totals.total ? formatPercent(row.total / totals.total) : "—"}</strong>
              </div>
              <div className="progress-track method-progress" aria-hidden="true">
                <div
                  className={`progress-fill${row.type === "None" ? " progress-muted" : ""}`}
                  style={{ width: `${totals.total ? Math.round((row.total / totals.total) * 100) : 0}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card panel">
        <div className="panel-header">
          <div>
            <h2>Attribution performance by export format</h2>
            <p>Identify which formats keep Excalidraw visible after export.</p>
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
                <th>Brand Visibility Rate</th>
              </tr>
            </thead>
            <tbody>
              {byFormat.map((row) => {
                const isBest = best && row.format === best.format && row.total > 0;
                const isWorst = worst && row.format === worst.format && row.total > 0;
                return (
                  <tr key={row.format}>
                    <td data-label="Format">
                      <span className="format-pill">{row.format}</span>
                      {isBest ? <span className="rank-badge rank-high">Highest</span> : null}
                      {isWorst ? <span className="rank-badge rank-low">Lowest</span> : null}
                    </td>
                    <td data-label="Total Exports">{formatNumber(row.total)}</td>
                    <td data-label="Attributed">{formatNumber(row.attributed)}</td>
                    <td data-label="Unattributed">{formatNumber(row.unattributed)}</td>
                    <td data-label="Brand Visibility Rate">{row.total ? formatPercent(row.rate) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card context-panel">
        <h2>Visible attribution</h2>
        <p>
          Visible attribution means a viewer outside Excalidraw can identify Excalidraw as the source of the exported or
          shared artifact.
        </p>
        <p>
          This prototype treats that visibility as optional and contextual: a credit a user can include, a branded share
          experience, or an Open/Edit path around the drawing. It does not assume watermarking should be forced onto the
          artifact.
        </p>
      </section>
    </>
  );
}
