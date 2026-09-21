import React from "react";

export default function MetricCard({ kicker, label, value, description, emphasized = false, secondary = false }) {
  const className = [
    "card metric-card",
    emphasized ? "metric-card-emphasized" : "",
    secondary ? "metric-card-secondary" : ""
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={className}>
      {kicker ? <p className="metric-kicker">{kicker}</p> : null}
      <h3 className="metric-label">{label}</h3>
      <p className="metric-value">{value}</p>
      <p className="metric-helper">{description}</p>
    </article>
  );
}
