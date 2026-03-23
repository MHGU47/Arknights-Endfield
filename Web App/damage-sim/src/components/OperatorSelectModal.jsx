/**
 * OperatorSelectModal.jsx — Operator selection popup
 *
 * A full-screen backdrop + centred modal that lets the user browse and select
 * an operator. Operates in the same fashion as 'ItemSelectModal'
 *
 *
 * Props:
 *   opName      {string}    Display name of the slot (e.g. "Weapon")
 *   accentColor   {string}    Hex colour for the title accent stripe
 *   onSelect      {function}  Called with the full operator object when user picks one
 *   onClose       {function}  Called when the user clicks the backdrop or ×
 */

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { EQUIPMENT_ITEMS, RARITY_CONFIG } from "../constants";
import s from "../styles/ItemSelectModal.module.css";
import {db} from "../systems/loader.js"

// ── Placeholder icon ──────────────────────────────────────────────────────────
/**
 * Generates a simple SVG icon for items that don't have real art yet.
 * Uses the item's accent colour so each item looks visually distinct.
 */
function PlaceholderIcon({ color }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="2" y="2" width="24" height="24" rx="4" stroke={color} strokeWidth="1.4" />
      <path d="M8 20L20 8M20 8H13M20 8v7" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// ── Star row ──────────────────────────────────────────────────────────────────
/**
 * Renders a row of ★ symbols for a given rarity.
 * Filled stars are gold, empty stars are grey.
 * MAX_STARS is 6 — the highest rarity in Endfield.
 */
const MAX_STARS = 6;
function Stars({ rarity }) {
  return (
    <div className={s.stars}>
      {Array.from({ length: MAX_STARS }).map((_, i) => (
        <span key={i} className={i < rarity ? s.starFilled : s.starEmpty}>★</span>
      ))}
    </div>
  );
}

// ── Main modal component ──────────────────────────────────────────────────────
export default function OperatorSelectModal({ opName, accentColor, onSelect, onClose }) {
  

  const ops = db.operators ?? [];

  // Group items by rarity — highest rarity first
  const rarities = Object.keys(RARITY_CONFIG)
    .map(Number)
    .sort((a, b) => b - a);  // Descending: 6, 5, 4...

  /**
   * Close on Escape key.
   * useEffect with [onClose] dependency attaches the listener when the modal
   * mounts and cleans it up when it unmounts — preventing memory leaks.
   */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return createPortal(
    // Backdrop — clicking outside the modal closes it
    <div
      className={s.backdrop}
      onMouseDown={(e) => {
        // Only close if the click was on the backdrop itself, not the modal card
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal card — stops click propagation so backdrop handler doesn't fire */}
      <div className={s.modal} onMouseDown={(e) => e.stopPropagation()}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className={s.header}>
          <p className={s.title}>
            <span className={s.titleAccent} style={{ background: accentColor }} />
            Select Operator
          </p>
          <button className={s.closeBtn} onClick={onClose}>×</button>
        </div>

        {/* ── Scrollable item grid ─────────────────────────────────────── */}
        <div className={s.body}>
          {rarities.map((rarity) => {
            // Filter items to only this rarity tier
            const tierItems = ops
            if (tierItems.length === 0) return null;  // Skip empty tiers

            return (
              <div key={rarity}>
                {/* Rarity label (e.g. ★★★★★★) */}
                <p className={s.rarityLabel}>{RARITY_CONFIG[rarity].label}</p>

                <div className={s.grid}>
                  {tierItems.map((item) => {
                    const isSelected = item.name === opName;
                    // Border colour: rarity colour when selected, default when not
                    const borderColor = isSelected
                      ? RARITY_CONFIG[item.rarity].color
                      : undefined;

                    return (
                      <div
                        key={item.name}
                        className={`${s.itemCard} ${isSelected ? s.itemCardSelected : ""}`}
                        style={{ borderColor }}
                        onClick={() => {
                          onSelect(item);  // Pass the full item object up
                          onClose();       // Close modal after selection
                        }}
                      >
                        {/* Icon area — coloured background with placeholder SVG */}
                        <div
                          className={s.itemIcon}
                          style={{ background: item.color + "18" }}  // "18" = ~9% opacity
                        >
                          {item.image
                            ? <img src={item.image} alt={item.name} />
                            : <PlaceholderIcon color={item.color} />
                          }
                        </div>

                        {/* Item name */}
                        <span className={s.itemName}>{item.name}</span>

                        {/* Rarity stars */}
                        <Stars rarity={item.rarity} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>,
    document.body
  );
}
