/**
 * OperatorCard.jsx — Operator statistics display panel
 */

import { TEAL, TEAL_BG, TEAL_BORDER, GOLD, SKILL_LABELS } from "../constants";
import { useState, useEffect } from "react";
import s from "../styles/OperatorCard.module.css";
import { db, calc } from "../systems/loader";
import LevelDropdown from "./Dropdown";
import SkillLevelDropdown from "./SkillLevelDropdown";
import OperatorSelectModal from "./OperatorSelectModal";

const ATTR_ICONS = {
  Strength: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="5" width="14" height="10" rx="1" stroke="var(--color-text-tertiary)" strokeWidth="1.2" />
      <rect x="5" y="2" width="8"  height="4"  rx="1" stroke="var(--color-text-tertiary)" strokeWidth="1.2" />
    </svg>
  ),
  Agility: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 14L14 4M14 4H8M14 4v6" stroke="var(--color-text-tertiary)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
  Intellect: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2l2 5h5l-4 3 1.5 5L9 12l-4.5 3L6 10 2 7h5z" stroke={GOLD} strokeWidth="1.1" fill="none" />
    </svg>
  ),
  Will: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="6" stroke="var(--color-text-tertiary)" strokeWidth="1.2" />
      <path d="M9 6v4M9 12v.5" stroke="var(--color-text-tertiary)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  ),
};

const SKILL_ICONS = [
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <polygon points="9,2 16,14 2,14" stroke={TEAL} strokeWidth="1.2" fill="none" />
    <line x1="9" y1="6" x2="9" y2="10" stroke={TEAL} strokeWidth="1.2" />
  </svg>,
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="5" stroke={TEAL} strokeWidth="1.2" />
    <path d="M6 9l2 2 4-4" stroke={TEAL} strokeWidth="1.2" strokeLinecap="round" />
  </svg>,
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 3c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6 2.7-6 6-6z" stroke={TEAL} strokeWidth="1.2" />
    <path d="M7 7l4 2-4 2V7z" fill={TEAL} />
  </svg>,
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 2v4M9 12v4M2 9h4M12 9h4" stroke={TEAL} strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="9" cy="9" r="2.5" stroke={TEAL} strokeWidth="1.2" />
  </svg>,
];

// ── SkillsSection ─────────────────────────────────────────────────────────────
// Owns level state for all four skill slots. Passes each down to
// SkillLevelDropdown alongside the icon and skill name from your existing
// SKILL_LABELS lookup.
function SkillsSection({ skills }) {
  const [levels, setLevels] = useState(["Level 1", "Level 1", "Level 1", "Level 1"]);

  const setLevel = (i, val) =>
    setLevels((prev) => prev.map((v, idx) => (idx === i ? val : v)));

  return (
    <div className={s.section}>
      <p className={s.sectionHead}>Skills</p>
      <div className={s.skillGrid}>
        {SKILL_ICONS.map((icon, i) => {
          const skill = skills[SKILL_LABELS[i]];
          return (
            <SkillLevelDropdown
              key={i}
              icon={icon}
              skillName={skill?.name ?? `Skill ${i + 1}`}
              value={levels[i]}
              onChange={(val) => setLevel(i, val)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── OperatorCard ──────────────────────────────────────────────────────────────

export default function OperatorCard({ operator, changeOperator, index}) {
  const [opLevel, setOpLevel] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOp,  setSelectedOp]  = useState(null);

  
  useEffect(() => {
      setSelectedOp(operator);
      console.log(operator)
      calc.update()
    },[operator]);

  function onLevelChange(level) {
    operator.level = level;
    operator.updateAttributes();
  }

  function onOperatorSelect(op){
    changeOperator(op, index)
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column" }}>

        <div className={s.header}>
          <div
            className={s.elementIcon}
            style={{ background: TEAL_BG, border: `1px solid ${TEAL_BORDER}` }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1l1.5 4h4l-3.2 2.4 1.2 4L7 9l-3.5 2.4 1.2-4L1.5 5H5.5z" fill={TEAL} />
            </svg>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}
              onClick={() => setModalOpen(true)}>
            <p className={s.name}>{operator.name}</p>
            <div className={s.stars}>
              {Array.from({ length: operator.stars }).map((_, i) => (
                <span key={i} className={s.star}>◆</span>
              ))}
            </div>
          </div>

          <LevelDropdown
            value={opLevel}
            onChange={(v) => { setOpLevel(v); onLevelChange?.(`Level ${v}`); }}
          />
        </div>

        {/* <div className={s.tags}>
          {op.tags.map((tag) => (
            <span key={tag} className={s.tag}>{tag}</span>
          ))}
        </div> */}

        <div className={s.section}>
          <p className={s.sectionHead}>Attributes</p>
          <div className={s.attrGrid}>
            {Object.entries(operator.attributes)
              .filter(([key]) => !["HP", "Attack"].includes(key))
              .map(([key, val]) => (
                <div key={key} className={s.attrBlock}>
                  {ATTR_ICONS[key]}
                  <span className={s.attrLabel} style={{ color: key === operator.mainAttr ? GOLD : undefined }}>
                    {key}
                  </span>
                  <span className={s.attrValue} style={{ color: key === operator.mainAttr ? GOLD : undefined }}>
                    {val}
                  </span>
                </div>
              ))}
          </div>
          <div className={s.divider} />
          <div className={s.statRow}>
            <span>❤ <span className={s.statValue}>{operator.hp}</span></span>
            <span style={{ color: "var(--color-border-secondary)" }}>|</span>
            <span>⚔ <span className={s.statValue}>{operator.atk}</span></span>
            <span style={{ color: "var(--color-border-secondary)" }}>|</span>
            <span>🛡 <span className={s.statValue}>{operator.def}</span></span>
          </div>
        </div>

        {/* Skills — replaced static grid with SkillsSection + SkillLevelDropdown */}
        <SkillsSection skills={operator.skills} />

        {/* <div className={s.techniques}>
          <div className={s.techniqueRow}>
            {op.techniques.map((t) => (
              <div key={t} className={s.techniqueBtn}>{t}</div>
            ))}
          </div>
        </div> */}

      </div>
      {modalOpen && (
        <OperatorSelectModal
          opname={selectedOp.name}
          accentColor={"#0fc4c4"}
          onSelect={(item) => onOperatorSelect(item)}
          onClose={() => setModalOpen(false)}
          />
      )}
    </>
  );
}
