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
 *   onSelectOperator  {function}  Called with a new index when the user picks
 *                                 a different operator in the tray
 */

import OperatorTray from "./OperatorTray";
import OperatorCard from "./OperatorCard";
import { db } from "../systems/loader";
import { useState } from "react";

export default function LeftPanel() {
  const [activeOperator, setActiveOperator] = useState(db.loadouts[0].operator);
  const [activeIndex, setActiveIndex] = useState(0)

  const changeOperator = (op, i) => {
    console.log(`Op at ${i} selected`)
    setActiveIndex(i)
    setActiveOperator(op)
    db.loadouts.map(o => console.log(o.operator.name))
  }

  const setNewOperator = (op) => {
    db.loadouts[activeIndex].operator = op
  }

  return (
    <div style={{
      width: "20%",                                           // Fixed 20% of viewport width
      background: "var(--color-background-secondary)",
      borderRight: "0.5px solid var(--color-border-tertiary)",
      display: "flex",
      flexDirection: "column",                               // Stack children vertically
      overflow: "hidden",                                    // Clip anything that overflows
      flexShrink: 0,                                         // Don't shrink when space is tight
    }}>

      {/* Operator tray — pinned to the top, collapses on click */}
      <OperatorTray
        activeOperator={activeOperator}
        onSelect={changeOperator}
      />

      {/* Operator card — takes remaining space, scrolls if content is too tall */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <OperatorCard
          operator={activeOperator}
          index={activeIndex}
          changeOperator={setNewOperator}/>
      </div>
      {/* <div onClick={() => {}}>
        Change Operator
      </div> */}

    </div>
  );
}
