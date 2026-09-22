import React from "react";
import { ATTRIBUTION_STATUSES, DATE_PRESETS, FORMATS } from "../mockData";

export default function Filters({ format, status, dateRangeId, onFormat, onStatus, onDateRange, onReset }) {
  return (
    <section className="filters card" aria-label="Dashboard filters">
      <div>
        <label htmlFor="date-filter">Date Range</label>
        <select id="date-filter" value={dateRangeId} onChange={(event) => onDateRange(event.target.value)}>
          {DATE_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="format-filter">Export Format</label>
        <select id="format-filter" value={format} onChange={(event) => onFormat(event.target.value)}>
          <option>All</option>
          {FORMATS.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="status-filter">Attribution Status</label>
        <select id="status-filter" value={status} onChange={(event) => onStatus(event.target.value)}>
          {ATTRIBUTION_STATUSES.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <button className="reset" type="button" onClick={onReset}>
        Reset Filters
      </button>
    </section>
  );
}
