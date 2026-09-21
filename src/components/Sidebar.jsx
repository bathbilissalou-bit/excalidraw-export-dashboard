import React from "react";
import { NAV_ITEMS } from "../mockData";

export default function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark sidebar-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18">
            <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M8 15c2.2-4.2 5.8-4.2 8 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div className="sidebar-kicker">Marketing</div>
          <div className="sidebar-title">Export Analytics</div>
        </div>
      </div>
      <nav className="sidebar-nav" aria-label="Dashboard sections">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item${currentPage === item.id ? " active" : ""}`}
            onClick={() => onNavigate(item.id)}
            aria-current={currentPage === item.id ? "page" : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <p className="sidebar-note">Prototype · Mock Data</p>
    </aside>
  );
}
