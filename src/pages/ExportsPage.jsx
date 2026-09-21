import React, { useMemo, useState } from "react";
import { formatNumber, formatTimestamp, searchEvents } from "../analytics";

const PAGE_SIZE = 12;

export default function ExportsPage({ events }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredEvents = useMemo(() => searchEvents(events, query), [events, query]);
  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filteredEvents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSearch = (value) => {
    setQuery(value);
    setPage(1);
  };

  return (
    <section className="card panel">
      <div className="panel-header table-toolbar">
        <div>
          <h2>Export activity</h2>
          <p>
            Sample event-level telemetry that would be required to calculate Brand Visibility Rate. Each row is a mock
            export after a drawing leaves the app.
          </p>
        </div>
        <label className="search-field">
          <span>Search exports</span>
          <input
            type="search"
            value={query}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search format, method, or status"
          />
        </label>
      </div>
      <p className="table-meta">
        {`Showing ${formatNumber(visible.length)} of ${formatNumber(filteredEvents.length)} mock events${
          query.trim() ? ` matching “${query.trim()}”` : ""
        }.`}
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Export Format</th>
              <th>Export Method</th>
              <th>Attribution Status</th>
              <th>Attribution Type</th>
              <th>Open/Edit Click</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.length ? (
              visible.map((event) => (
                <tr key={event.id}>
                  <td data-label="Timestamp">{formatTimestamp(event.timestamp)}</td>
                  <td data-label="Export Format">
                    <span className="format-pill">{event.format}</span>
                  </td>
                  <td data-label="Export Method">{event.method}</td>
                  <td data-label="Attribution Status">
                    <span className={`status-pill ${event.attribution ? "status-yes" : "status-no"}`}>
                      {event.attributionStatus}
                    </span>
                  </td>
                  <td data-label="Attribution Type">{event.attributionType}</td>
                  <td data-label="Open/Edit Click">{event.openEditClick ? "Yes" : "No"}</td>
                  <td data-label="Status">{event.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>No mock events match this search and filter set.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <button type="button" className="reset" disabled={currentPage <= 1} onClick={() => setPage((value) => value - 1)}>
          Previous
        </button>
        <span>
          Page {currentPage} of {pageCount}
        </span>
        <button
          type="button"
          className="reset"
          disabled={currentPage >= pageCount}
          onClick={() => setPage((value) => value + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}
