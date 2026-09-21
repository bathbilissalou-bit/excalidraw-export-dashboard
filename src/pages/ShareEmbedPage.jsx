import React from "react";
import MetricCard from "../components/MetricCard";
import { formatNumber, formatPercent } from "../analytics";

export default function ShareEmbedPage({ metrics }) {
  const { overall, share, embed, shareLinksCreated, embedsCreated, brandedShareViews, clicks } = metrics;

  return (
    <>
      <section className="card panel context-panel share-intro">
        <h2>Visibility after drawings leave the app</h2>
        <p>
          Share links and embeds are the moments Marketing cares about most: a diagram in a PR, post, or website. These
          metrics stay secondary to overall Brand Visibility Rate.
        </p>
      </section>

      <section className="metrics-grid" aria-label="Overall brand visibility context">
        <MetricCard
          kicker="Primary Marketing KPI"
          label="Overall Brand Visibility Rate"
          value={formatPercent(overall.rate)}
          description="All export methods in the current view"
          emphasized
        />
        <MetricCard
          kicker="Secondary to overall rate"
          label="Share Brand Visibility Rate"
          value={share.total ? formatPercent(share.rate) : "—"}
          description={`${formatNumber(share.attributed)} of ${formatNumber(share.total)} share exports`}
        />
        <MetricCard
          kicker="Secondary to overall rate"
          label="Embed Brand Visibility Rate"
          value={embed.total ? formatPercent(embed.rate) : "—"}
          description={`${formatNumber(embed.attributed)} of ${formatNumber(embed.total)} embed exports`}
        />
        <MetricCard
          kicker="Secondary engagement metric"
          label="Open/Edit in Excalidraw Clicks"
          value={formatNumber(clicks)}
          description="Clicks from attributed share or embed experiences"
          secondary
        />
      </section>

      <section className="method-grid share-metric-grid">
        <article className="card method-card">
          <h3>Share links created</h3>
          <p className="method-total">{formatNumber(shareLinksCreated)}</p>
          <p className="method-label">Mock share export events</p>
        </article>
        <article className="card method-card">
          <h3>Embeds created</h3>
          <p className="method-total">{formatNumber(embedsCreated)}</p>
          <p className="method-label">Mock embed export events</p>
        </article>
        <article className="card method-card">
          <h3>Branded share views</h3>
          <p className="method-total">{formatNumber(brandedShareViews)}</p>
          <p className="method-label">Views on opt-in branded share pages</p>
        </article>
      </section>

      <section className="card panel">
        <div className="panel-header">
          <div>
            <h2>Share vs. embed attribution</h2>
            <p>How often share and embed paths carry visible Excalidraw context around the artifact.</p>
          </div>
        </div>
        <div className="method-grid two-col">
          {[
            { label: "Share", row: share },
            { label: "Embed", row: embed }
          ].map(({ label, row }) => (
            <article className="method-card" key={label}>
              <h3>{label}</h3>
              <div className="method-rate-row">
                <span>Total exports</span>
                <strong>{formatNumber(row.total)}</strong>
              </div>
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
    </>
  );
}
