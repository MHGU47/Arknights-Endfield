import { useState, useRef, useEffect } from "react";
import s from "../styles/TopBar.module.css";
import { createPortal } from "react-dom";
import { WEAPON_LEVELS, OPERATOR_LEVELS } from "../constants";

// ── WeaponLevelDropdown ───────────────────────────────────────────────────────
// (unchanged from previous version — see EquipmentBox comments in ARCHITECTURE.md)
function LevelDropdown({ value, onChange, op }) {
  const [open, setOpen]       = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });
  const toggleRef = useRef(null);
  const menuRef   = useRef(null);

  const handleToggle = () => {
    if (!open) {
      const rect = toggleRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setOpen(o => !o);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (!toggleRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <div ref={toggleRef} className={s.weaponDropdownToggle} onClick={handleToggle}>
        <span className={s.weaponDropdownLabel}>Level</span>
        <span className={s.weaponDropdownValue}>{value}</span>
        <span className={`${s.weaponDropdownChevron} ${open ? s.weaponDropdownChevronOpen : ""}`}>▼</span>
      </div>
      {open && createPortal(
        <div
          ref={menuRef}
          className={s.weaponDropdownPortal}
          style={{ top: menuPos.top, left: menuPos.left, width: menuPos.width }}
        >
          <div className={s.weaponLevelGrid}>
            {
              op ? 
              OPERATOR_LEVELS.map(lvl => (
                <div
                  key={lvl}
                  className={`${s.weaponLevelOption} ${lvl === value ? s.weaponLevelOptionActive : ""}`}
                  onClick={() => { onChange(lvl); setOpen(false); }}
                >
                  {lvl}
                </div>
              )) :
              WEAPON_LEVELS.map(lvl => (
              <div
                key={lvl}
                className={`${s.weaponLevelOption} ${lvl === value ? s.weaponLevelOptionActive : ""}`}
                onClick={() => { onChange(lvl); setOpen(false); }}
              >
                {lvl}
              </div>
            ))
            }
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default LevelDropdown