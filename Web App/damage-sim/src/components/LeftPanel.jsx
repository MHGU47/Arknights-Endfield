/**
 * LeftPanel.jsx — Left sidebar shell
 *
 * A simple layout wrapper for the left 20% of the screen. It stacks two
 * components vertically:
 *   1. OperatorTray — the collapsible operator selector at the top
 *   2. OperatorCard — the scrollable stats display below
 *
 * This component contains no logic of its own. Its only job is layout and
 * passing props down to its children.
 *
 * Props:
 *   activeOperator    {number}    Index of the currently selected operator
 *   onSelectOperator  {function}  Called with a new operator object when the user picks
 *                                 a different operator in the tray
 */

import { useState, useEffect } from "react";
import OperatorTray from "./OperatorTray";
import OperatorCard from "./OperatorCard";
import { db } from "../systems/loader";

export default function LeftPanel() {
  // Keep loadouts in React state
  const [loadouts, setLoadouts] = useState(db.loadouts);

  const [activeIndex, setActiveIndex] = useState(0);

  // Derive active operator from state (no separate state needed)
  const activeOperator = loadouts[activeIndex].operator;

  useEffect(() => {
    console.log(`Active Operator ${activeOperator.name}`);
    loadouts[activeIndex].selected = true
  }, []);

  // When user selects a different slot/operator
  const changeOperator = (i) => {
    setActiveIndex(i);
    loadouts.forEach((loadout) => {
      loadout.selected = loadout.index === i
    })
  };

  // Update operator for current index (IMMUTABLE)
  const setNewOperator = (op) => {
    setLoadouts((prev) => {
      const updated = prev.map((item, i) =>
        i === activeIndex
          ? { ...item, operator: op }
          : item
      );

      // Sync db AFTER creating new state
      db.loadouts = updated;

      return updated;
    });
  };

  return (
    <div
      style={{
        width: "20%",
        background: "var(--color-background-secondary)",
        borderRight: "0.5px solid var(--color-border-tertiary)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <OperatorTray
        activeOperator={activeOperator} // Pass in the currently selected operator to display stats
        onSelect={changeOperator} // Pass in function for handling operator switching
      />

      <div style={{ flex: 1, overflowY: "auto" }}>
        <OperatorCard
          operator={activeOperator} // Pass in the currently selected operator to display stats
          index={activeIndex} // Pass in the currently selected loadout index
          changeOperator={setNewOperator} // Pass in function for handling operator changing
        />
      </div>
    </div>
  );
}
