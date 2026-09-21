import React from "react";
import { formatPercent, formatShortDate } from "../analytics";

export default function MiniLineChart({ data }) {
  const width = 680;
  const height = 240;
  const pad = { top: 28, right: 18, bottom: 36, left: 44 };

  if (!data.length) {
    return <div className="empty">No trend data for this filter.</div>;
  }

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
