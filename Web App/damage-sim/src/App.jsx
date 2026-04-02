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

import { useEffect, useState } from "react"
import LeftPanel from "./components/LeftPanel";
import TopBar from "./components/TopBar";
import MainContent from "./components/MainContent/MainContent";
import Operator from "./systems/operator.js"
import opData from "./Data/Stats/warfarin_operators.json"
import wpnData from "./Data/Stats/weapons.json"

import { db } from "./systems/loader.js"

export default function App() {

  const [loadouts, setLoadouts] = useState(db.loadouts);
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeLoadout, setActiveLoadout] = useState(loadouts[activeIndex])
  const [activeOperator, setActiveOperator] = useState(activeLoadout.operator)

  // useEffect(() => {
  //   //console.log(activeOperator);
  // },[activeLoadout]);

  // useEffect(() => {
  //   console.log("FULL LOADOUTS:", loadouts);
  //   console.log("ACTIVE INDEX:", activeIndex);
  //   console.log("ACTIVE LOADOUT:", loadouts[activeIndex]);
  // },[loadouts]);

  // ✅ Generic updater for a specific loadout
  // Create function and assign it to a variable so it can be passed as a prompt
  const updateLoadout = (index, updater) => {

    // Call 'setLoadouts' (in this component)...
    setLoadouts(prev =>

      // and iterate over each loadout
      prev.map((loadout, i) => {

        // If the loadout matches the current index, use the updater function passed in
        // to update the loadout. If not, just return the loadout
        if (i === index) {
          return updater(loadout);
        }
        return loadout;
      })
    );
  };

  const setNewOperator = (op) => {
    setLoadouts(prev => {
      const updated = prev.map((item, i) =>{
        if(i === activeIndex){
          setActiveOperator(op)
          return { ...item, operator: op }
        }
        else 
          return item
        }
      );

      db.loadouts = updated;
      return updated;
    });
  };

  const changeOperator = (i) => {
    setActiveIndex(i);
    setActiveLoadout(loadouts[i])
    setActiveOperator(loadouts[i].operator)

    setLoadouts(prev =>
      prev.map(loadout => ({
        ...loadout,
        selected: loadout.index === i
      }))
    );
  };

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
          Receives the active operator object and a setter to change it.
          flexShrink: 0 prevents it from squishing when the window is narrow. */}
      <LeftPanel
        loadouts={activeLoadout}
        activeIndex={activeIndex}
        changeOperator={changeOperator}
        activeOperator={activeOperator}
        setNewOperator={setNewOperator}
        // onSelectOperator={setActiveOperator}
      />

      {/* ── Right side (remaining 80% via flex: 1) ────────────────────────
          flex: 1 means "take up all remaining space".
          flexDirection: column stacks TopBar above MainContent. */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Equipment slots + set effect bar */}
        <TopBar
          activeLoadout={activeLoadout}
          updateLoadout={updateLoadout}
        />

        {/* Tabbed content area: DPS / Overview / Rotations */}
        <MainContent />

      </div>
    </div>
  );
}
