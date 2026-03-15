/**
 * OperatorCard.jsx — Operator statistics display panel
 *
 * Renders the full stats panel for the currently selected operator:
 *   - Element icon, name, and star rating
 *   - Role tags (Damage Dealer, Solidify, etc.)
 *   - Four attribute stats with icons (Strength, Agility, Intellect, Will)
 *   - Secondary stats: HP / ATK / DEF
 *   - Four skill circles with optional rank badges
 *   - Two technique buttons at the bottom
 *
 * This is a pure display component — it has no state of its own.
 * It reads operator data from the OPERATORS array in constants.js.
 *
 * Props:
 *   operatorId  {number}  Index into the OPERATORS array (0–3)
 */

import { TEAL, TEAL_BG, TEAL_BORDER, GOLD, OPERATORS } from "../constants";
import s from "../styles/OperatorCard.module.css";

// ── Attribute icons ────────────────────────────────────────────────────────────
/**
 * A plain object mapping each attribute name to an SVG icon element.
 * Using an object lets us look up the right icon by name:
 *   ATTR_ICONS["Intellect"] → the star SVG
 * This avoids a long if/else chain and keeps icon definitions co-located.
 */
const ATTR_ICONS = {
  Strength: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      {/* Briefcase/fist shape representing physical strength */}
      <rect x="2" y="5" width="14" height="10" rx="1" stroke="var(--color-text-tertiary)" strokeWidth="1.2" />
      <rect x="5" y="2" width="8"  height="4"  rx="1" stroke="var(--color-text-tertiary)" strokeWidth="1.2" />
    </svg>
  ),
  Agility: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      {/* Arrow pointing up-right representing speed/agility */}
      <path d="M4 14L14 4M14 4H8M14 4v6" stroke="var(--color-text-tertiary)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Intellect: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      {/* Star shape — rendered in GOLD to highlight it as the main DPS stat */}
      <path d="M9 2l2 5h5l-4 3 1.5 5L9 12l-4.5 3L6 10 2 7h5z" stroke={GOLD} strokeWidth="1.1" fill="none" />
    </svg>
  ),
  Will: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      {/* Circle with exclamation — represents mental/will stat */}
      <circle cx="9" cy="9" r="6" stroke="var(--color-text-tertiary)" strokeWidth="1.2" />
      <path d="M9 6v4M9 12v.5" stroke="var(--color-text-tertiary)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
};

// ── Skill icons ────────────────────────────────────────────────────────────────
/**
 * Array of four SVG icons, one per skill slot.
 * Index 0 = skill 1, index 1 = skill 2, etc.
 * These are placeholder icons — replace with actual skill art when available.
 */
const SKILL_ICONS = [
  // Skill 1 — triangle/warning shape
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <polygon points="9,2 16,14 2,14" stroke={TEAL} strokeWidth="1.2" fill="none" />
    <line x1="9" y1="6" x2="9" y2="10" stroke={TEAL} strokeWidth="1.2" />
  </svg>,
  // Skill 2 — circle with checkmark
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="5" stroke={TEAL} strokeWidth="1.2" />
    <path d="M6 9l2 2 4-4" stroke={TEAL} strokeWidth="1.2" strokeLinecap="round" />
  </svg>,
  // Skill 3 — circle with play button
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 3c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6z" stroke={TEAL} strokeWidth="1.2" />
    <path d="M7 7l4 2-4 2V7z" fill={TEAL} />
  </svg>,
  // Skill 4 — crosshair/targeting shape
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 2v4M9 12v4M2 9h4M12 9h4" stroke={TEAL} strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="9" cy="9" r="2.5" stroke={TEAL} strokeWidth="1.2" />
  </svg>,
];

export default function OperatorCard({ operatorId }) {
  /**
   * Look up the operator by index. The `?? OPERATORS[0]` fallback ensures
   * we never crash if an invalid operatorId is passed — we just fall back
   * to the first operator.
   */
  const op = OPERATORS[operatorId] ?? OPERATORS[0];

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>

      {/* ── Header: element icon + name + stars ──────────────────────────── */}
      <div className={s.header}>

        {/* Element icon — circular badge with teal background */}
        <div
          className={s.elementIcon}
          style={{ background: TEAL_BG, border: `1px solid ${TEAL_BORDER}` }}
        >
          {/* Placeholder star shape — replace with actual element icon per element type */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1l1.5 4h4l-3.2 2.4 1.2 4L7 9l-3.5 2.4 1.2-4L1.5 5H5.5z" fill={TEAL} />
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Operator name */}
          <p className={s.name}>{op.name}</p>

          {/* Star rating — renders N ◆ symbols based on op.stars */}
          <div className={s.stars}>
            {Array.from({ length: op.stars }).map((_, i) => (
              <span key={i} className={s.star}>◆</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Role tags ────────────────────────────────────────────────────── */}
      <div className={s.tags}>
        {op.tags.map((tag) => (
          <span key={tag} className={s.tag}>{tag}</span>
        ))}
      </div>

      {/* ── Attributes section ───────────────────────────────────────────── */}
      <div className={s.section}>
        <p className={s.sectionHead}>Attributes</p>

        {/* Four attribute blocks in a row */}
        <div className={s.attrGrid}>
          {Object.entries(op.attributes).map(([key, val]) => (
            <div key={key} className={s.attrBlock}>
              {/* Icon looked up by attribute name */}
              {ATTR_ICONS[key]}
              {/* Label — gold for Intellect, normal colour for others */}
              <span
                className={s.attrLabel}
                style={{ color: key === "Intellect" ? GOLD : undefined }}
              >
                {key}
              </span>
              {/* Value — gold for Intellect */}
              <span
                className={s.attrValue}
                style={{ color: key === "Intellect" ? GOLD : undefined }}
              >
                {val}
              </span>
            </div>
          ))}
        </div>

        {/* Thin horizontal divider */}
        <div className={s.divider} />

        {/* Secondary stats: HP / ATK / DEF in a single row */}
        <div className={s.statRow}>
          <span>❤ <span className={s.statValue}>{op.hp}</span></span>
          <span style={{ color: "var(--color-border-secondary)" }}>|</span>
          <span>⚔ <span className={s.statValue}>{op.atk}</span></span>
          <span style={{ color: "var(--color-border-secondary)" }}>|</span>
          <span>🛡 <span className={s.statValue}>{op.def}</span></span>
        </div>
      </div>

      {/* ── Skills section ───────────────────────────────────────────────── */}
      <div className={s.section}>
        <p className={s.sectionHead}>Skills</p>

        <div className={s.skillGrid}>
          {SKILL_ICONS.map((icon, i) => {
            // Look up whether this skill has a rank value
            const skill   = op.skills[i];
            const hasRank = skill?.rank != null;  // ?. handles missing skills safely

            return (
              <div key={i} className={s.skillCol}>
                {/* Skill circle — teal border if ranked, default border if not */}
                <div
                  className={s.skillCircle}
                  style={{ borderColor: hasRank ? TEAL : undefined }}
                >
                  {icon}
                  {/* Rank badge — only rendered when rank is not null */}
                  {hasRank && (
                    <span className={s.skillRank} style={{ color: TEAL }}>
                      RANK {skill.rank}
                    </span>
                  )}
                </div>
                {/* Placeholder dash below icon — replace with skill name later */}
                <span className={s.skillDash}>—</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Techniques section ───────────────────────────────────────────── */}
      <div className={s.techniques}>
        <div className={s.techniqueRow}>
          {op.techniques.map((t) => (
            <div key={t} className={s.techniqueBtn}>{t}</div>
          ))}
        </div>
      </div>

    </div>
  );
}
