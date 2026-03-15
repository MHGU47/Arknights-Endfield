/**
 * MainContent.jsx — Tabbed content area
 *
 * Renders the tab bar (DPS / Overview / Rotations) and the content area
 * below it. Switching tabs swaps which component fills the content area.
 *
 * The TABS array at the top of this file is the single place to add, remove,
 * or reorder tabs — no other changes needed.
 *
 * State:
 *   activeTab  {string}  ID of the currently visible tab ("dps" by default)
 */

import { useState } from "react";
import DPSTab       from "./DPSTab";
import OverviewTab  from "./OverviewTab";
import RotationsTab from "./RotationsTab";
import s from "../../styles/MainContent.module.css";

/**
 * Tab definitions.
 * Each entry has:
 *   id        — unique string used for state and key
 *   label     — text shown on the tab button
 *   Component — the React component to render when this tab is active
 *
 * To add a new tab:
 *   1. Create the component file (e.g. NewTab.jsx)
 *   2. Import it here
 *   3. Add an entry to this array
 */
const TABS = [
  { id: "dps",       label: "DPS",       Component: DPSTab       },
  { id: "overview",  label: "Overview",  Component: OverviewTab  },
  { id: "rotations", label: "Rotations", Component: RotationsTab },
];

export default function MainContent() {
  // Tracks which tab is currently showing — starts on the DPS tab
  const [activeTab, setActiveTab] = useState("dps");

  /**
   * Look up the component for the active tab.
   * The `?? DPSTab` fallback handles any case where activeTab doesn't
   * match any entry (e.g. after removing a tab).
   */
  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.Component ?? DPSTab;

  return (
    <div className={s.mainContent}>

      {/* ── Tab bar ──────────────────────────────────────────────────────
          Renders one button per tab. The active button gets the
          `tabBtnActive` class which adds a coloured bottom border. */}
      <div className={s.tabBar}>
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            // Combine base class with active modifier when this tab is selected
            className={`${s.tabBtn} ${activeTab === id ? s.tabBtnActive : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab content area ─────────────────────────────────────────────
          Renders only the active tab's component.
          All tabs share this same container — layout is handled by each tab. */}
      <div className={s.tabContent}>
        <ActiveComponent />
      </div>

    </div>
  );
}
