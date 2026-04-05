/**
 * Spinner.jsx — Reusable +/− number input
 *
 * Used in EquipmentBox to let the user adjust numeric values (refinement,
 * quality, bonus). Displays a label on the left and −/value/+ controls
 * on the right.
 *
 * Props:
 *   label         {string}    Text shown to the left of the spinner
 *   min           {number}    Minimum allowed value (default: 0)
 *   max           {number}    Maximum allowed value (default: 999)
 *   defaultValue  {number}    Starting value (default: 0)
 *   onChange      {function}  Called with the new number whenever it changes
 *   values        {array}     Values that are to be displayed as part of the label (default: null)
 *
 * Note: There is a SECOND Spinner component defined inside DPSTab.jsx.
 * That one is more flexible (supports custom step sizes and format functions).
 * This one is simpler and is only used for equipment box inputs.
 */

import { useState, useEffect } from "react";
import s from "../styles/components.module.css";

export default function Spinner({ label, min = 0, max = 999, onChange, values = null}) {
  // `value` is the current number shown in the spinner

  max = max === 4 ? 3 : max
  const [value, setValue] = useState(max === 3 ? 0 : 1);
  const [statLabel, setStatLabel] = useState(`${label} +${Math.round((values[0] + Number.EPSILON) * 100) / 100}`)
  const weapon = max === 9
  min = weapon ? 1 : 0

  /**
   * This useEffect is here solely to fix an issue where the labels for weapons didn't rerender properly.
   * The labels for gear rerender and update normally however, and the reason for this is unknown.
   */
  useEffect(() => {
    setStatLabel(`${label} +${Math.round((values[0] + Number.EPSILON) * 100) / 100}`)
  }, [label]);

  /**
   * Adjusts the value by `delta` (+1 or -1), clamping to [min, max].
   * Math.min and Math.max together act as a clamp:
   *   Math.max(min, x) ensures x is never below min
   *   Math.min(max, x) ensures x is never above max
   * 
   * For weapons specifically, the 'weapon' bool is used to slightly alter the minimum displayed
   * value. This is so the values shown match what is shwon in-game but also properly corresponds
   * to proper value placements in the array
   */
  const adjust = (delta) => {
    const next = Math.min(max, Math.max(min, value + delta));
    setStatLabel(`${label} +${Math.round((values[weapon ? next - 1 : next] + Number.EPSILON) * 100) / 100}`)
    setValue(next);
    onChange?.(weapon ? next - 1 : next);  // The ?. means "only call if onChange was provided"
  };

  return (
    // Outer row: label on left, controls on right
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, minHeight: 22 }}>

      {/* Label text */}
      <span style={{ fontSize: 20, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
        {statLabel}
      </span>

      {/* −/value/+ control group */}
      <div className={s.spinnerWrap}>
        {/* Decrement button */}
        <button className={s.spinnerBtn} onClick={() => adjust(-1)}>−</button>

        {/* Current value display */}
        <span className={s.spinnerVal}>{value}</span>

        {/* Increment button — spinnerBtnRight adds a left border */}
        <button className={`${s.spinnerBtn} ${s.spinnerBtnRight}`} onClick={() => adjust(1)}>+</button>
      </div>
    </div>
  );
}
