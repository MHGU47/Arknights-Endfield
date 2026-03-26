/**
 * OperatorTray.jsx — Collapsible operator selector
 *
 * Sits at the very top of the left panel. Shows "OPERATORS" as a header row
 * that the user can click to expand/collapse a 2×2 grid of operator icons.
 * Clicking an icon selects that operator and closes the tray.
 *
 * Props:
 *   activeOperator  {number}    Index of the currently selected operator —
 *                               used to highlight the active icon in teal
 *   onSelect        {function}  Called with the operator's id when clicked
 *
 * State:
 *   open  {boolean}  Whether the tray is currently expanded
 *
 * Animation:
 *   The tray body uses CSS max-height transitioning between 0 and 140px.
 *   You can't CSS-animate `height: auto`, but you can animate `max-height`
 *   to a value you know is larger than the content — this is the standard
 *   pure-CSS collapse trick.
 */

import { useState } from "react";
import { OPERATORS, TEAL } from "../constants";
import { db } from "../systems/loader"
import s from "../styles/OperatorTray.module.css";

export default function OperatorTray({ activeOperator, onSelect }) {
  // Controls whether the tray grid is visible
  const [open, setOpen] = useState(false);

  const loadouts = db.loadouts

  //loadouts.map(o => console.log("Operator Tray: ", o.operator))

  return (
    // Outer wrapper — the bottom border separates the tray from the operator card
    <div style={{ borderBottom: "0.5px solid var(--color-border-tertiary)" }}>

      {/* ── Toggle row ──────────────────────────────────────────────────────
          Clicking anywhere on this row opens/closes the tray. */}
      <div className={s.toggle} onClick={() => setOpen((o) => !o)}>

        {/* Left side: person icon + "OPERATORS" label */}
        <div className={s.toggleLabel}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="5" r="2.5" stroke="var(--color-text-tertiary)" strokeWidth="1.1" />
            <path d="M2 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="var(--color-text-tertiary)" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
          Operators
        </div>

        {/* Right side: chevron that rotates 180° when open */}
        <span className={`${s.chevron} ${open ? s.chevronOpen : ""}`}>▼</span>
      </div>

      {/* ── Tray body ────────────────────────────────────────────────────────
          Hidden when collapsed (max-height: 0, opacity: 0).
          Revealed when open (max-height: 140px, opacity: 1).
          CSS transition handles the animation. */}
      <div className={`${s.body} ${open ? s.bodyOpen : ""}`}>
        <div className={s.grid}>

          {/* Map over all loaduts and render a clickable icon for each operator in said loadout*/}
          {loadouts.map((loadout, i) => (
            <div
              key={i}
              className={s.opCol}
              onClick={() => {
                onSelect(i);   // Tell the parent which operator was picked via index
                setOpen(false);    // Close the tray after selection
              }}
            >
              {/* Circle icon — teal border when this operator is active */}
              <div
                className={s.opCircle}
                style={{ borderColor: loadouts[i].operator === activeOperator ? TEAL : undefined }}
              >
                {/* Generic person SVG — replace with actual portrait when available */}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10" cy="7" r="3.5"
                    stroke={loadouts[i].operator === activeOperator ? TEAL : "var(--color-text-tertiary)"}
                    strokeWidth="1.2"
                  />
                  <path
                    d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7"
                    stroke={loadouts[i].operator === activeOperator ? TEAL : "var(--color-text-tertiary)"}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Operator name — teal when active */}
              <p
                className={s.opName}
                style={{ color: loadouts[i].operator === activeOperator ? TEAL : undefined }}
              >
                {loadout.operator != null ? loadout.operator.name : "No operator"}
              </p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}
