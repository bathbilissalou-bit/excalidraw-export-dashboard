import React from "react";
import { formatNumber, formatPercent } from "../analytics";

export default function AttributionSplit({ attributed, unattributed, rate, total }) {
  const attributedWidth = total ? rate * 100 : 0;
  const unattributedWidth = total ? 100 - attributedWidth : 0;

  return (
    <div>
      <div
        className="split-bar"
        role="img"
        aria-label={`${formatPercent(rate)} attributed, ${formatPercent(total ? 1 - rate : 0)} unattributed`}
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
    </div>
  );
}
