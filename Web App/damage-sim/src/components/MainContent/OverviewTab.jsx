/**
 * OverviewTab.jsx — Overview tab (placeholder)
 *
 * Currently renders a placeholder message.
 *
 * Planned content:
 *   - Team DPS summary comparing all operators
 *   - Stat breakdowns per operator
 *   - Visual comparison charts
 *
 * See docs/EXTENDING_DPS.md for guidance on building this out.
 */

import s from "../../styles/MainContent.module.css";

export default function OverviewTab() {
  return (
    <div className={s.placeholder}>
      <p>Team overview & stats summary</p>
    </div>
  );
}
