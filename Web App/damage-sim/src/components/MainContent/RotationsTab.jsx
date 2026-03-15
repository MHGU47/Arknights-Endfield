/**
 * RotationsTab.jsx — Rotations tab (placeholder)
 *
 * Currently renders a placeholder message.
 *
 * Planned content:
 *   - Visual skill rotation timeline
 *   - Drag-and-drop skill ordering
 *   - Cycle time and damage-per-cycle calculations
 *
 * See docs/EXTENDING_DPS.md for guidance on building this out.
 */

import s from "../../styles/MainContent.module.css";

export default function RotationsTab() {
  return (
    <div className={s.placeholder}>
      <p>Skill rotation planner</p>
    </div>
  );
}
