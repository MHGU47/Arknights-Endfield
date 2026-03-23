/**
 * SkillLevelDropdown.jsx — Skill level selector for OperatorCard
 *
 * Wraps a single skill circle. Clicking the circle opens a dropdown menu
 * listing Level 1–9, then Mastery 1–3 in a separate section.
 *
 * The selected level is displayed as text below the skill name rather than
 * inside the circle, so font size changes in the parent CSS never cause
 * overlap or overflow issues within the circle itself.
 *
 * Levels 1–9 use teal as the accent colour.
 * Mastery 1–3 use gold (#c8a200) as the accent colour.
 *
 * The menu closes when:
 *   - The user picks an option
 *   - The user clicks anywhere outside the component
 *   - The user presses Escape
 *
 * Props:
 *   icon        {ReactNode}       The SVG icon rendered inside the circle
 *   skillName   {string}          Displayed below the circle (e.g. "Skill 2")
 *   value       {string|null}     Current selection (e.g. "Level 7", "Mastery 2", or null)
 *   onChange    {function}        Called with the new level string when user picks one
 */

import { useState, useRef, useEffect } from "react";
import s from "../styles/OperatorCard.module.css";

// The two tiers of skill levels
const LEVELS   = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const MASTERIES = [1, 2, 3];

// Colour for each tier
const TEAL = "#0fc4c4";
const GOLD = "#c8a200";

/**
 * Returns the accent colour for a given level string.
 * "Mastery X" → gold, anything else → teal.
 */
function colorForLevel(level) {
  if (!level) return TEAL;
  return level.startsWith("Mastery") ? GOLD : TEAL;
}

export default function SkillLevelDropdown({ icon, skillName, value, onChange }) {
  const [open, setOpen] = useState(false);

  // Refs for outside-click detection
  const wrapperRef = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;

    const handleMouseDown = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown",   handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown",   handleKeyDown);
    };
  }, [open]);

  // Derive circle border class from current selection
  const circleClass = [
    s.skillCircle,
    s.skillCircleClickable,
    value?.startsWith("Mastery") ? s.skillCircleMastery
      : value            ? s.skillCircleActive
      : "",
  ].join(" ");

  const accentColor = colorForLevel(value);

  return (
    // Wrapper needs position: relative so the menu can anchor to it
    <div className={s.skillColWrapper} ref={wrapperRef}>

      {/* Skill circle — clicking toggles the menu */}
      <div
        className={circleClass}
        onClick={() => setOpen((o) => !o)}
      >
        {icon}
      </div>

      {/* Skill name */}
      <span className={s.skillDash}>{skillName}</span>

      {/* Selected level — shown below the name, coloured by tier */}
      {value ? (
        <span className={s.skillLevel} style={{ color: accentColor }}>
          {value}
        </span>
      ) : (
        <span className={s.skillLevelEmpty}>—</span>
      )}

      {/* Dropdown menu — only rendered when open */}
      {open && (
        <div className={s.skillMenu}>

          {/* ── Levels 1–9 ──────────────────────────────────────────── */}
          <p className={s.menuSectionLabel}>Levels</p>

          {LEVELS.map((l) => {
            const label      = `Level ${l}`;
            const isSelected = value === label;
            return (
              <button
                key={label}
                className={[
                  s.menuOption,
                  isSelected ? s.menuOptionSelected : "",
                ].join(" ")}
                onClick={() => { onChange(label); setOpen(false); }}
              >
                <span>{label}</span>
                <span
                  className={[s.menuCheck, isSelected ? s.menuCheckVisible : ""].join(" ")}
                  style={{ color: TEAL }}
                >✓</span>
              </button>
            );
          })}

          {/* ── Mastery 1–3 ─────────────────────────────────────────── */}
          <p className={`${s.menuSectionLabel} ${s.menuSectionLabelMastery}`}>
            Mastery
          </p>

          {MASTERIES.map((m) => {
            const label      = `Mastery ${m}`;
            const isSelected = value === label;
            return (
              <button
                key={label}
                className={[
                  s.menuOption,
                  s.menuOptionMastery,
                  isSelected ? s.menuOptionMasterySelected : "",
                ].join(" ")}
                onClick={() => { onChange(label); setOpen(false); }}
              >
                <span>{label}</span>
                <span
                  className={[s.menuCheck, isSelected ? s.menuCheckVisible : ""].join(" ")}
                  style={{ color: GOLD }}
                >✓</span>
              </button>
            );
          })}

        </div>
      )}
    </div>
  );
}
