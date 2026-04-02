/**
 * TopBar.jsx — Equipment row + set effect bar
 *
 * Renders the top section of the right side:
 *   Row 1 (tall):   Five equipment boxes side by side (Weapon, Armour, Gloves, Kit 1, Kit 2)
 *   Row 2 (short):  Set effect status bar
 *
 * This component has no props and no state — it reads slot definitions from
 * constants.js and renders them. The set effect text is a placeholder for now.
 *
 * The heights are fixed in CSS (240px for equipment row, 40px for set effect)
 * rather than percentage-based, because percentage heights only work reliably
 * when the parent has a concrete pixel height — which a flex child doesn't.
 */

import EquipmentBox from "./EquipmentBox";
import { EQUIPMENT_SLOTS } from "../constants";
import s from "../styles/TopBar.module.css";
import { useEffect, useState } from "react";
import { db } from "../systems/loader";

export default function TopBar({activeLoadout, loadouts, activeIndex, updateLoadout}) {

  useEffect(() => {
    console.log(loadouts)

  }, [loadouts])

  return (
    <div className={s.topbar}>

      {/* ── Equipment boxes row ──────────────────────────────────────────
          Maps over EQUIPMENT_SLOTS and renders one EquipmentBox per slot.
          Each slot object has { name, type } — both are passed as props.
          `key` must be unique — using `name` here since slot names don't repeat. */}
      <div className={s.equipmentRow}>
        {EQUIPMENT_SLOTS.map(({ name, type }) => (
          <EquipmentBox
          key={name}
          index={activeLoadout.index}
          name={name}
          type={type}
          loadout={activeLoadout}
          onUpdateLoadout={updateLoadout}/>
        ))}
      </div>

      {/* ── Set effect bar ───────────────────────────────────────────────
          Shows whether the equipped items activate a set bonus.
          Currently a placeholder — wire up to equipment state when ready. */}
      <div className={s.setEffectRow}>
        <div className={s.setEffectCard}>
          <p className={s.setEffectLabel}>Set effect</p>
          {/* Thin vertical divider between label and text */}
          <div className={s.setEffectDivider} />
          <p className={s.setEffectText}>No set detected</p>
        </div>
      </div>

    </div>
  );
}
