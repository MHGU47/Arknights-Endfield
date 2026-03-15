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
 *
 * Note: There is a SECOND Spinner component defined inside DPSTab.jsx.
 * That one is more flexible (supports custom step sizes and format functions).
 * This one is simpler and is only used for equipment box inputs.
 */

import { useState } from "react";
import s from "../styles/components.module.css";

export default function Spinner({ label, min = 0, max = 999, defaultValue = 0, onChange }) {
  // `value` is the current number shown in the spinner
  const [value, setValue] = useState(defaultValue);

  /**
   * Adjusts the value by `delta` (+1 or -1), clamping to [min, max].
   * Math.min and Math.max together act as a clamp:
   *   Math.max(min, x) ensures x is never below min
   *   Math.min(max, x) ensures x is never above max
   */
  const adjust = (delta) => {
    const next = Math.min(max, Math.max(min, value + delta));
    setValue(next);
    onChange?.(next);  // The ?. means "only call if onChange was provided"
  };

  return (
    // Outer row: label on left, controls on right
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, minHeight: 22 }}>

      {/* Label text */}
      <span style={{ fontSize: 10, color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}>
        {label}
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
