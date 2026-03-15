/**
 * App.jsx — Root component
 *
 * This is the top of the React component tree. It defines the overall page
 * layout and owns the `activeOperator` state — the index of whichever operator
 * is currently selected in the left panel.
 *
 * WHY DOES STATE LIVE HERE?
 * Both OperatorTray (the selector) and OperatorCard (the display) need to know
 * which operator is active. They live in separate branches of the component
 * tree, so their shared state must live in their closest common ancestor —
 * which is this component. This pattern is called "lifting state up".
 *
 * LAYOUT:
 *   ┌────────────────────────────────────────────────────┐
 *   │  LeftPanel (20%)  │  Right side (80%)              │
 *   │                   │  TopBar (equipment row)        │
 *   │                   │  MainContent (tabbed area)     │
 *   └────────────────────────────────────────────────────┘
 */

import { useState } from "react";
import LeftPanel from "./components/LeftPanel";
import TopBar from "./components/TopBar";
import MainContent from "./components/MainContent/MainContent";
import Operator from "./systems/operator.js"
import opData from "./Data/Stats/warfarin_operators.json"

export default function App() {
  /**
   * activeOperator — index into the OPERATORS array in constants.js
   * Starts at 0 (the first operator, Yvonne).
   * Passed down to LeftPanel which distributes it further.
   */
  const [activeOperator, setActiveOperator] = useState(0);
  const op = new Operator(opData)

  return (
    /**
     * Outer container — fills the entire viewport.
     * display: flex creates a horizontal row (left panel | right side).
     * overflow: hidden prevents any content from causing scrollbars on the
     * page itself; individual sections scroll internally where needed.
     */
    <div style={{
      display: "flex",
      height: "100vh",
      width: "100vw",
      fontFamily: "var(--font-sans, sans-serif)",
      background: "var(--color-background-tertiary)",
      overflow: "hidden",
    }}>

      {/* ── Left panel (20% width) ─────────────────────────────────────────
          Receives the active operator index and a setter to change it.
          flexShrink: 0 prevents it from squishing when the window is narrow. */}
      <LeftPanel
        activeOperator={activeOperator}
        onSelectOperator={setActiveOperator}
      />

      {/* ── Right side (remaining 80% via flex: 1) ────────────────────────
          flex: 1 means "take up all remaining space".
          flexDirection: column stacks TopBar above MainContent. */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Equipment slots + set effect bar */}
        <TopBar />

        {/* Tabbed content area: DPS / Overview / Rotations */}
        <MainContent />

      </div>
    </div>
  );
}
