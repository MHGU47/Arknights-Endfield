/**
 * EquipmentBox.jsx — Individual equipment slot
 *
 * Renders a single card in the equipment row. Each card contains:
 *   - A title (slot name)
 *   - A clickable image slot (opens ItemSelectModal on click)
 *   - The selected item name (shown below image after selection)
 *   - Three spinner rows (Refinement, Quality, Bonus)
 *   - For weapon slots only: a weapon level dropdown
 *
 * SELECTION BEHAVIOUR:
 *   - Weapon slot:       auto-selects the first weapon when component mounts
 *   - All other slots:   start empty, user must pick manually
 *   - Once selected:     item cannot be deselected (only swapped)
 *
 * Props:
 *   name            {string}      Slot name shown as the card title
 *   type            {string}      Slot type — controls which items appear in the modal
 *                                 and whether the weapon level dropdown renders
 *   image           {string|null} External image URL (optional override)
 *   labels          {string[]}    Labels for the three spinners
 *   onValuesChange  {function}    Called with { labelName: newValue } on any change
 */

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Spinner from "./Spinner";
import ItemSelectModal from "./ItemSelectModal";
import s from "../styles/TopBar.module.css";
import ms from "../styles/ItemSelectModal.module.css";
import { WEAPON_LEVELS, EQUIPMENT_ITEMS, RARITY_CONFIG } from "../constants";

// ── Accent colours per slot type (for the modal title stripe) ─────────────────
const SLOT_ACCENT = {
  weapon: "#0fc4c4",
  armour: "#9b72e8",
  gloves: "#e8a020",
  kit:    "#60b8e0",
};

const DEFAULT_LABELS = ["Refinement", "Quality", "Bonus"];

// ── WeaponLevelDropdown ───────────────────────────────────────────────────────
// (unchanged from previous version — see EquipmentBox comments in ARCHITECTURE.md)
function WeaponLevelDropdown({ value, onChange }) {
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
            {WEAPON_LEVELS.map(lvl => (
              <div
                key={lvl}
                className={`${s.weaponLevelOption} ${lvl === value ? s.weaponLevelOptionActive : ""}`}
                onClick={() => { onChange(lvl); setOpen(false); }}
              >
                {lvl}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ── EquipmentBox ──────────────────────────────────────────────────────────────

export default function EquipmentBox({ name, type, image = null, labels = DEFAULT_LABELS, onValuesChange }) {
  /**
   * selectedItem — the currently equipped item object, or null if empty.
   * Weapon slots auto-select the first weapon on mount via the useEffect below.
   */
  const [selectedItem,  setSelectedItem]  = useState(null);
  const [modalOpen,     setModalOpen]     = useState(false);
  const [weaponLevel,   setWeaponLevel]   = useState(1);
  const [imgHovered,    setImgHovered]    = useState(false);

  /**
   * Auto-select the first weapon when a weapon slot mounts.
   * The empty dependency array [] means this only runs once on mount.
   * Other slot types stay null until the user picks something.
   */
  useEffect(() => {
    if (type === "weapon") {
      const firstWeapon = EQUIPMENT_ITEMS.weapon?.[0];
      if (firstWeapon) setSelectedItem(firstWeapon);
    }
  }, [type]);

  // Derive the border colour from the selected item's rarity
  const selectedBorderColor = selectedItem
    ? RARITY_CONFIG[selectedItem.rarity]?.color
    : undefined;

  return (
    <>
      <div
        className={s.equipmentBox}
        // Tint the card border to the item's rarity colour when selected
        style={{ borderColor: selectedBorderColor ? selectedBorderColor + "66" : undefined }}
      >
        {/* Slot title */}
        <p className={s.equipmentTitle}>{name}</p>

        {/* ── Image slot ────────────────────────────────────────────────
            Clicking opens the item select modal.
            Hover state shows a teal border + "Select item" hint text. */}
        <div
          className={`${ms.imgSlot} ${selectedItem ? ms.imgSlotFilled : ""}`}
          style={{
            // When selected, tint border to rarity colour
            borderColor: selectedItem
              ? selectedBorderColor + "88"
              : imgHovered
              ? "#0fc4c4"
              : undefined,
            background: selectedItem
              ? selectedItem.color + "0d"   // "0d" = ~5% opacity tint
              : imgHovered
              ? "#0fc4c408"
              : undefined,
          }}
          onClick={() => setModalOpen(true)}
          onMouseEnter={() => setImgHovered(true)}
          onMouseLeave={() => setImgHovered(false)}
        >
          {selectedItem ? (
            // Show a placeholder icon in the item's accent colour when selected
            // Replace this with <img src={selectedItem.image}> when art is available
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="2" width="24" height="24" rx="4" stroke={selectedItem.color} strokeWidth="1.4" />
              <path d="M8 20L20 8M20 8H13M20 8v7" stroke={selectedItem.color} strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          ) : imgHovered ? (
            // Hovered empty state — teal icon + hint text
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <rect x="1" y="1" width="18" height="18" rx="2" stroke="#0fc4c4" strokeWidth="1.2" />
                <path d="M1 13l5-5 4 4 3-3 5 5" stroke="#0fc4c4" strokeWidth="1.2" strokeLinejoin="round" />
                <circle cx="6.5" cy="6.5" r="1.5" fill="#0fc4c4" />
              </svg>
              <span className={ms.imgHint}>Select item</span>
            </>
          ) : (
            // Default empty state — grey placeholder icon
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="1" y="1" width="18" height="18" rx="2" stroke="var(--color-text-secondary)" strokeWidth="1.2" />
              <path d="M1 13l5-5 4 4 3-3 5 5" stroke="var(--color-text-secondary)" strokeWidth="1.2" strokeLinejoin="round" />
              <circle cx="6.5" cy="6.5" r="1.5" fill="var(--color-text-secondary)" />
            </svg>
          )}
        </div>

        {/* Selected item name — shown below image after selection */}
        {selectedItem && (
          <p className={ms.selectedItemName} style={{ color: selectedItem.color }}>
            {selectedItem.name}
          </p>
        )}

        {/* Three standard spinners */}
        {labels.map((label) => (
          <Spinner
            key={label}
            label={label}
            onChange={(v) => onValuesChange?.({ [label]: v })}
          />
        ))}

        {/* Weapon-only level dropdown */}
        {type === "weapon" && (
          <WeaponLevelDropdown
            value={weaponLevel}
            onChange={(v) => { setWeaponLevel(v); onValuesChange?.({ Level: v }); }}
          />
        )}
      </div>

      {/* ── Item select modal ────────────────────────────────────────────
          Rendered via portal when modalOpen is true.
          Passes the current selection so the modal can highlight it. */}
      {modalOpen && (
        <ItemSelectModal
          slotName={name}
          slotType={type}
          accentColor={SLOT_ACCENT[type] ?? "#0fc4c4"}
          selectedId={selectedItem?.id ?? null}
          onSelect={(item) => setSelectedItem(item)}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
