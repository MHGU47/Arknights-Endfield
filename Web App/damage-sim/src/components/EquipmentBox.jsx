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
import Spinner from "./Spinner";
import ItemSelectModal from "./ItemSelectModal";
import s from "../styles/TopBar.module.css";
import ms from "../styles/ItemSelectModal.module.css";
import LevelDropdown from "./Dropdown";
import { WEAPON_LEVELS, EQUIPMENT_ITEMS, RARITY_CONFIG } from "../constants";
import {db} from "../systems/loader.js"

// ── Accent colours per slot type (for the modal title stripe) ─────────────────
const SLOT_ACCENT = {
  weapon: "#0fc4c4",
  armour: "#9b72e8",
  gloves: "#e8a020",
  kit1:    "#60b8e0",
  kit2:    "#60b8e0",
};

const GEAR_TYPES = [
  "armor",
  "gloves",
  "kit"
]

const DEFAULT_LABELS = ["Refinement", "Quality", "Bonus"];

// ── EquipmentBox ──────────────────────────────────────────────────────────────

export default function EquipmentBox({ name, type, index, loadout, onUpdateLoadout, onValuesChange }) {
  /**
   * selectedItem — the currently equipped item object, or null if empty.
   * Weapon slots auto-select the first weapon on mount via the useEffect below.
   * If there are already items in the loadout, load those instead of giving null
   * empty items.
   */
  const [modalOpen,       setModalOpen] = useState(false);
  const [weaponLevel,   setWeaponLevel] = useState(1);
  const [imgHovered,     setImgHovered] = useState(false);
  const [selectedItem, setSelectedItem] = useState(() => {
    if (loadout.gear[type]?.item && type != "weapon") {
      if (type.includes("kit")) {
        return type.includes("1")
          ? loadout.gear.kit1.item
          : loadout.gear.kit2.item;
      }
      return loadout.gear[type].item;
    }

    if (type === "weapon") {
      return db.weapons.find((w) => w.type === loadout.operator.weapon);
    }

    return null;
  });

  /**
   * Auto-select the first weapon when a weapon slot mounts.
   * The dependency array [] means this only runs once on mount.
   * Other slot types stay null until the user picks something.
   */
  useEffect(() => {
    if(type === "weapon"){
      if(!loadout.gear.weapon.item){
        handleSelect(db.weapons.find((w) => w.type === loadout.operator.weapon))
      }
      else{
        handleSelect(loadout.gear.weapon.item)
      }
    }
    else if(type.includes("kit")){
      if(type.includes("1")) handleSelect(loadout.gear.kit1?.item ?? null)
      else handleSelect(loadout.gear.kit2?.item ?? null)
    }
    else handleSelect(loadout.gear[type]?.item ?? null)

  }, [index]);

  function updateWeaponLevel(level){
    setWeaponLevel(level)
    //onValuesChange?.({ Level: v })

    onUpdateLoadout(index, prevLoadout => ({
      ...prevLoadout,
      gear: {
        ...prevLoadout.gear,
        [type]: {
          item: selectedItem,
          levels: {
            ...prevLoadout.gear[type].levels,
            Level: level
          }
        }
      }
    }));
  }

  function onSpinnerChange(stat, level){
    stat = stat === "Stat 3" ? "Passive" : stat
    onUpdateLoadout(index, prevLoadout => ({
      ...prevLoadout,
      gear: {
        ...prevLoadout.gear,
        [type]: {
          item: selectedItem,
          levels: {
            ...prevLoadout.gear[type].levels,
            [stat]: level
          }
        }
      }
    }));
    onValuesChange?.({ [stat]: level })
  }

  // 🔹 Handle item selection
  function handleSelect(gear) {
    setSelectedItem(gear);
    const wpn = {
      "Level" : 1,
      "Stat 1" : 0,
      "Stat 2" : 0,
      "Passive Attribute" : 0
    }

    const g = {
      "Stat 1" : 0,
      "Stat 2" : 0,
      "Stat 3" : 0
    }

    const lvl = type === "weapon" ? wpn : g

    onUpdateLoadout(index, prevLoadout => ({
      ...prevLoadout,
      gear: {
        ...prevLoadout.gear,
        [type]: {
          item: gear,
          levels: lvl
        }
      }
    }));
  }




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
          onClick={() => {setModalOpen(true)}}
          onMouseEnter={() => setImgHovered(true)}
          onMouseLeave={() => setImgHovered(false)}
        >
          {selectedItem ? (
            // Show a placeholder icon in the item's accent colour when selected
            // Replace this with <img src={selectedItem.image}> when art is available
            <img src={selectedItem.image}/>
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
        {selectedItem?.stats && (
          Object.entries(selectedItem.stats)
            .filter(([label]) =>
              type === "weapon" ? true : label !== "Defense"
            )
            .map(([label, stat], i) => (
              <Spinner
                key={label}
                //label={type === "weapon" ? stat.attribute : label}
                label={stat.attribute}
                values={stat.values}
                max={stat.values.length}
                // onChange={(v) => onSpinnerChange(type === "weapon" ? stat.attribute : label, v)}
                onChange={(v) => onSpinnerChange(`Stat ${i + 1}`, v)}
              />
            ))
        )}

        {/* Weapon-only level dropdown */}
        {type === "weapon" && (
          <LevelDropdown
            value={weaponLevel}
            onChange={(v) => updateWeaponLevel(v)}
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
          onSelect={(item) => handleSelect(item)}
          onClose={() => setModalOpen(false)}
          loadout={loadout}
        />
      )}
    </>
  );
}
