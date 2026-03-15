/**
 * DPSTab.jsx — DPS simulation tab
 *
 * The main working area of the simulator. Divided into two horizontal rows:
 *
 *   TOP ROW — Three collapsible buff/debuff columns:
 *     1. Attacker Buffs  (ATK%, DMG bonus, Crit, Link)
 *     2. Enemy & Debuffs (DEF, shred, susceptibility, Weaken)
 *     3. Status Effects  (Physical status, Arts reactions)
 *
 *   BOTTOM ROW — Four always-visible skill segments:
 *     1. Basic Attack  (AA1–4/5, Dive, Finisher)
 *     2. Battle Skill  (multiplier, hits, custom modifiers)
 *     3. Combo Skill   (combo cost, multiplier, hits, custom modifiers)
 *     4. Ultimate      (energy cost, multiplier, hits, custom modifiers)
 *
 * ─── Internal component map ──────────────────────────────────────────────────
 *
 * PRIMITIVE COMPONENTS (small reusable building blocks used inside this file):
 *   SectionHead    — Small uppercase section label
 *   Divider        — Thin horizontal rule
 *   Row            — Space-between flex row
 *   Lbl            — Row label text (normal or muted)
 *   Checkbox       — Tick box with dynamic accent colour
 *   Spinner        — +/− value control with configurable step/format
 *   MultSpinner    — Spinner pre-set for multiplier values (1.0×)
 *   PctSpinner     — Spinner pre-set for percentage values (0%)
 *   Badge          — Toggleable pill for status effects
 *   Card           — White card container with optional accent border
 *
 * STRUCTURAL COMPONENTS:
 *   ColSection     — Collapsible column wrapper with header bar
 *   SkillCard      — Card wrapper for a skill segment
 *   ModRow         — One custom modifier row (label input + spinner + remove)
 *   AddModBtn      — The dashed "+ Add modifier" button
 *
 * CONTENT COMPONENTS (the actual sections):
 *   AttackerBuffs  — Contents of the Attacker Buffs column
 *   EnemyDebuffs   — Contents of the Enemy & Debuffs column
 *   StatusEffects  — Contents of the Status Effects column
 *   BasicAttack    — Basic attack skill segment
 *   BattleSkill    — Battle skill segment
 *   ComboSkill     — Combo skill segment
 *   Ultimate       — Ultimate skill segment
 *
 * CUSTOM HOOK:
 *   useModifiers() — Manages the list of custom modifier rows
 */

import { useState, useCallback } from "react";
import s from "../../styles/DPSTab.module.css";
import c from "../../styles/components.module.css";

// ── Colour constants ──────────────────────────────────────────────────────────
// Used as dynamic values passed to style= props (can't live in CSS files).
const TEAL   = "#0fc4c4";  // Attacker buffs, electrification, link
const AMBER  = "#e8a020";  // Basic attack, physical status, combustion
const RED    = "#e05050";  // Enemy/debuffs, weaken, shatter, ultimate
const PURPLE = "#9b72e8";  // Combo skill, arts reactions
const GREEN  = "#4caf7d";  // Corrosion
const BLUE   = "#60b8e0";  // Solidification

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE COMPONENTS
// These are tiny, single-purpose components that act as styled HTML wrappers.
// Defining them as components (rather than inline JSX) reduces repetition and
// makes the larger components easier to read.
// ─────────────────────────────────────────────────────────────────────────────

/** Small uppercase heading for a card section */
function SectionHead({ children }) {
  return <p className={s.sectionHead}>{children}</p>;
}

/** Thin horizontal rule between sections */
function Divider() {
  return <div className={s.divider} />;
}

/**
 * Flexbox row with space-between alignment.
 * Used for label + control pairs throughout the buff/skill panels.
 * The optional `style` prop allows overrides (e.g. opacity for locked rows).
 */
function Row({ children, style }) {
  return <div className={s.row} style={style}>{children}</div>;
}

/**
 * Text label for a row.
 * `muted` prop renders it in a lighter colour — used for sub-options
 * that are secondary to the main control above them.
 */
function Lbl({ children, muted }) {
  return <span className={`${s.lbl} ${muted ? s.lblMuted : ""}`}>{children}</span>;
}

/**
 * A tick/untick checkbox.
 *
 * Uses inline styles for the border and background because they are driven
 * by the `color` prop — a different colour per context (teal, red, purple etc).
 * These can't be pre-defined in CSS without knowing the colour at build time.
 *
 * Props:
 *   checked   {boolean}    Whether the box is ticked
 *   onChange  {function}   Called with the new boolean when clicked
 *   color     {string}     Accent colour for the border and tick
 */
function Checkbox({ checked, onChange, color = TEAL }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={c.checkbox}
      style={{
        // Border and background change dynamically based on checked state and colour
        border:     `1px solid ${checked ? color : "var(--color-border-secondary)"}`,
        background: checked ? color + "33" : "transparent",  // "33" = ~20% opacity
      }}
    >
      {/* Only render the tick SVG when checked */}
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 5l2.5 2.5L8 3"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

/**
 * A +/− number spinner for the DPS tab.
 *
 * More flexible than the EquipmentBox Spinner — supports:
 *   step    — increment/decrement amount (default 1, use 0.1 for multipliers)
 *   format  — function to format the displayed value (e.g. add "%" or "×" suffix)
 *
 * Props:
 *   value   {number}    Current value (controlled — parent owns the state)
 *   onChange {function} Called with the new number on +/−
 *   step    {number}    Amount to change per click (default: 1)
 *   min     {number}    Minimum value (default: 0)
 *   max     {number}    Maximum value (default: 9999)
 *   format  {function}  Formats the displayed value (default: identity)
 */
function Spinner({ value, onChange, step = 1, min = 0, max = 9999, format = (v) => v }) {
  return (
    <div className={c.spinnerWrap}>
      <button className={c.spinnerBtn}       onClick={() => onChange(Math.max(min, value - step))}>−</button>
      <span   className={c.spinnerVal}>{format(value)}</span>
      <button className={`${c.spinnerBtn} ${c.spinnerBtnRight}`} onClick={() => onChange(Math.min(max, value + step))}>+</button>
    </div>
  );
}

// Pre-configured spinner variants to avoid repeating format/step on every use
/** Multiplier spinner: steps by 0.1, displays as "1.0×" */
const multFmt = (v) => v.toFixed(1) + "×";
function MultSpinner({ value, onChange }) {
  return <Spinner value={value} onChange={onChange} step={0.1} min={0} max={99} format={multFmt} />;
}

/** Percentage spinner: steps by 1, displays as "30%" */
const pctFmt = (v) => v + "%";
function PctSpinner({ value, onChange }) {
  return <Spinner value={value} onChange={onChange} step={1} min={0} max={500} format={pctFmt} />;
}

/**
 * A toggleable pill badge for status effects.
 *
 * Border, background, and text colour all change dynamically when active,
 * so they're inline styles driven by the `color` and `active` props.
 *
 * Props:
 *   label     {string}    Text shown on the badge
 *   color     {string}    Highlight colour when active
 *   active    {boolean}   Whether the badge is toggled on
 *   onToggle  {function}  Called (no arguments) when clicked
 */
function Badge({ label, color, active, onToggle }) {
  return (
    <div
      onClick={onToggle}
      className={c.badge}
      style={{
        border:     `0.5px solid ${active ? color : "var(--color-border-tertiary)"}`,
        background: active ? color + "22" : "transparent",   // "22" = ~13% opacity
        color:      active ? color : "var(--color-text-tertiary)",
      }}
    >
      {label}
    </div>
  );
}

/**
 * White card container with an optional accent border colour.
 * Used to visually group related controls within a column.
 *
 * Props:
 *   accent  {string|undefined}  Hex colour — if provided, tints the border
 *   children                    Card contents
 */
function Card({ children, accent }) {
  return (
    <div
      className={s.card}
      // "44" hex suffix = ~27% opacity — subtle accent without being heavy
      style={{ borderColor: accent ? accent + "44" : undefined }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STRUCTURAL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ColSection — Collapsible column wrapper
 *
 * Renders a clickable header bar above collapsible content.
 * The header shows a coloured accent stripe, the column label, and a chevron.
 * Clicking the header toggles the content open/closed.
 *
 * The open/closed animation is CSS-only: max-height transitions from 0 to
 * 600px (a value safely larger than the content). Opacity fades in tandem.
 *
 * Props:
 *   label     {string}    Text shown in the header
 *   accent    {string}    Hex colour for the left accent stripe and open border
 *   open      {boolean}   Whether the content is currently visible
 *   onToggle  {function}  Called when the header is clicked
 *   children              The column's card content
 */
function ColSection({ label, accent, open, onToggle, children }) {
  return (
    <div className={s.colWrap}>

      {/* Header bar — always visible */}
      <div
        className={s.colHeader}
        // Border tints to the accent colour when open
        style={{ borderColor: open ? accent + "66" : undefined }}
        onClick={onToggle}
      >
        <span className={s.colHeaderLabel}>
          {/* Coloured left stripe */}
          <span className={s.colAccent} style={{ background: accent }} />
          {label}
        </span>
        {/* Chevron — CSS rotation applied via class when open */}
        <span className={`${s.colChevron} ${open ? s.colChevronOpen : ""}`}>▼</span>
      </div>

      {/* Collapsible body — max-height/opacity animated via CSS */}
      <div className={`${s.colBody} ${open ? s.colBodyOpen : ""}`}>
        {children}
      </div>

    </div>
  );
}

/**
 * SkillCard — Card wrapper for a skill segment
 *
 * Renders a card with a coloured left accent stripe and a label at the top.
 * All four skill segments (Basic Attack, Battle Skill, Combo, Ultimate) use
 * this as their outer container.
 *
 * Props:
 *   label   {string}  Skill name shown at the top
 *   accent  {string}  Hex colour for the accent stripe and border tint
 */
function SkillCard({ label, accent, children }) {
  return (
    <div className={s.skillCard} style={{ borderColor: accent + "44" }}>
      <div className={s.skillHeader}>
        <span className={s.skillAccent} style={{ background: accent }} />
        {label}
      </div>
      {children}
    </div>
  );
}

/**
 * ModRow — A single custom modifier row
 *
 * Renders a text input (for the modifier label) + a multiplier spinner +
 * a remove button. Used in Battle Skill, Combo Skill, and Ultimate cards.
 *
 * Props:
 *   id            {number}    Unique ID for this modifier (from Date.now())
 *   label         {string}    Current label text
 *   value         {number}    Current multiplier value
 *   onLabelChange {function}  Called with (id, newLabel)
 *   onValueChange {function}  Called with (id, newValue)
 *   onRemove      {function}  Called with (id) when × is clicked
 */
function ModRow({ id, label, value, onLabelChange, onValueChange, onRemove }) {
  return (
    <div className={s.modRow}>
      {/* Editable label — user types what this modifier represents */}
      <input
        className={c.modLabelInput}
        value={label}
        onChange={(e) => onLabelChange(id, e.target.value)}
        placeholder="Label…"
      />
      {/* Multiplier value spinner */}
      <MultSpinner value={value} onChange={(v) => onValueChange(id, v)} />
      {/* Remove button — × symbol, turns red on hover */}
      <button className={c.rmBtn} onClick={() => onRemove(id)}>×</button>
    </div>
  );
}

/**
 * useModifiers — Custom hook for managing modifier rows
 *
 * A "hook" is a reusable piece of stateful logic. This one manages the list
 * of custom modifier rows for a skill card. It's extracted as a hook because
 * three components (BattleSkill, ComboSkill, Ultimate) all need the same logic.
 *
 * Without this hook, each of those three components would duplicate the same
 * useState + add/remove/update functions.
 *
 * Returns:
 *   mods      {array}     List of modifier objects { id, label, value }
 *   add       {function}  Appends a new blank modifier
 *   remove    {function}  Removes the modifier with the given id
 *   setLabel  {function}  Updates the label of a modifier by id
 *   setValue  {function}  Updates the value of a modifier by id
 *
 * useCallback:
 *   Wraps each function in useCallback to prevent them being recreated on
 *   every render. Without this, child components would re-render unnecessarily
 *   because they'd receive a "new" function reference each time.
 */
function useModifiers() {
  const [mods, setMods] = useState([]);

  // Add a new blank modifier — uses Date.now() as a unique ID
  const add = useCallback(
    () => setMods((m) => [...m, { id: Date.now(), label: "", value: 1.0 }]),
    []
  );

  // Remove the modifier with the given id
  const remove = useCallback(
    (id) => setMods((m) => m.filter((r) => r.id !== id)),
    []
  );

  // Update the label text of a modifier
  const setLabel = useCallback(
    (id, label) => setMods((m) => m.map((r) => r.id === id ? { ...r, label } : r)),
    []
  );

  // Update the multiplier value of a modifier
  const setValue = useCallback(
    (id, value) => setMods((m) => m.map((r) => r.id === id ? { ...r, value } : r)),
    []
  );

  return { mods, add, remove, setLabel, setValue };
}

/** The dashed "+ Add modifier" button at the bottom of skill cards */
function AddModBtn({ onClick }) {
  return <button className={c.addModBtn} onClick={onClick}>+ Add modifier</button>;
}

// ─────────────────────────────────────────────────────────────────────────────
// BUFF COLUMN CONTENT COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AttackerBuffs — Content for the "Attacker buffs" collapsible column
 *
 * State:
 *   atkPct      — ATK% bonus (adds to the operator's base ATK)
 *   dmgPct      — Flat DMG bonus (multiplicative with ATK)
 *   finalDmg    — Final DMG bonus (applied after all other multipliers)
 *   critRate    — Critical hit rate percentage
 *   critDmg     — Critical hit damage percentage
 *   link        — Whether the Link mechanic is active
 *   linkStacks  — Number of active Link stacks (only relevant when link is true)
 */
function AttackerBuffs() {
  const [atkPct,     setAtkPct]     = useState(0);
  const [dmgPct,     setDmgPct]     = useState(0);
  const [finalDmg,   setFinalDmg]   = useState(0);
  const [critRate,   setCritRate]   = useState(5);   // Default 5% base crit rate
  const [critDmg,    setCritDmg]    = useState(50);  // Default 50% crit damage
  const [link,       setLink]       = useState(false);
  const [linkStacks, setLinkStacks] = useState(1);

  return (
    <>
      {/* Base stat buffs card */}
      <Card>
        <SectionHead>Base buffs</SectionHead>
        <Row><Lbl>ATK %</Lbl>        <PctSpinner value={atkPct}   onChange={setAtkPct}   /></Row>
        <Row><Lbl>DMG bonus %</Lbl>  <PctSpinner value={dmgPct}   onChange={setDmgPct}   /></Row>
        <Row><Lbl>Final DMG %</Lbl>  <PctSpinner value={finalDmg} onChange={setFinalDmg} /></Row>
        <Divider />
        <Row><Lbl>Crit rate</Lbl>    <PctSpinner value={critRate} onChange={setCritRate} /></Row>
        <Row><Lbl>Crit DMG</Lbl>     <PctSpinner value={critDmg}  onChange={setCritDmg}  /></Row>
      </Card>

      {/* Link mechanic card — teal accent */}
      <Card accent={TEAL}>
        <SectionHead>Link</SectionHead>
        <Row>
          <Lbl>Link active</Lbl>
          <Checkbox checked={link} onChange={setLink} color={TEAL} />
        </Row>
        {/* Stack counter only appears when Link is active */}
        {link && (
          <Row>
            <Lbl muted>Stacks</Lbl>
            <Spinner value={linkStacks} onChange={setLinkStacks} min={1} max={4} />
          </Row>
        )}
      </Card>
    </>
  );
}

/**
 * EnemyDebuffs — Content for the "Enemy & debuffs" collapsible column
 *
 * State:
 *   def        — Enemy's base DEF stat
 *   defShred   — Percentage of enemy DEF removed by shred effects
 *   defIgnore  — Flat amount of enemy DEF bypassed (ignored entirely)
 *   susc       — Susceptibility bonus (increases damage taken by enemy)
 *   dmgTaken   — Additional DMG taken% on the enemy
 *   weaken     — Whether the Weaken debuff is active
 *   weakenPct  — How much Weaken reduces enemy's offensive output
 *                (included here as context for rotation planning)
 */
function EnemyDebuffs() {
  const [def,       setDef]       = useState(100);
  const [defShred,  setDefShred]  = useState(0);
  const [defIgnore, setDefIgnore] = useState(0);
  const [susc,      setSusc]      = useState(0);
  const [dmgTaken,  setDmgTaken]  = useState(0);
  const [weaken,    setWeaken]    = useState(false);
  const [weakenPct, setWeakenPct] = useState(0);

  return (
    <>
      {/* Enemy stat card */}
      <Card>
        <SectionHead>Enemy</SectionHead>
        {/* DEF steps by 10 — typical DEF values are in the hundreds */}
        <Row><Lbl>DEF</Lbl>            <Spinner    value={def}       onChange={setDef}       step={10} min={0}   max={2000} /></Row>
        <Row><Lbl>DEF shred %</Lbl>    <PctSpinner value={defShred}  onChange={setDefShred}  /></Row>
        {/* Flat DEF ignore steps by 5 */}
        <Row><Lbl>Flat DEF ignore</Lbl><Spinner    value={defIgnore} onChange={setDefIgnore} step={5}  min={0}   max={500}  /></Row>
        <Divider />
        <Row><Lbl>Susceptibility %</Lbl><PctSpinner value={susc}      onChange={setSusc}      /></Row>
        <Row><Lbl>DMG taken %</Lbl>    <PctSpinner value={dmgTaken}  onChange={setDmgTaken}  /></Row>
      </Card>

      {/* Weaken debuff card — red accent */}
      <Card accent={RED}>
        <SectionHead>Weaken</SectionHead>
        <Row>
          <Lbl>Weaken active</Lbl>
          <Checkbox checked={weaken} onChange={setWeaken} color={RED} />
        </Row>
        {/* Weaken percentage only visible when Weaken is active */}
        {weaken && (
          <Row>
            <Lbl muted>Weaken %</Lbl>
            <PctSpinner value={weakenPct} onChange={setWeakenPct} />
          </Row>
        )}
      </Card>
    </>
  );
}

/**
 * StatusEffects — Content for the "Status effects" collapsible column
 *
 * Covers two categories of status:
 *   Physical — stagger, lift, knockdown, crush, breach (from combat actions)
 *   Arts     — elemental reactions: electrification, combustion, corrosion,
 *              solidification, shatter
 *
 * State:
 *   vulnStacks      — Vulnerable stacks (0–4, increases incoming damage)
 *   lift/kd/crush/breach  — Boolean physical status toggles
 *   artsBurst       — Whether Arts Burst is active
 *   artsStacks      — Infliction stacks for Arts Burst
 *   electrification/combustion/corrosion/solidification/shatter  — Reaction toggles
 */
function StatusEffects() {
  const [vulnStacks,      setVulnStacks]      = useState(0);
  const [lift,            setLift]            = useState(false);
  const [kd,              setKd]              = useState(false);   // Knock Down
  const [crush,           setCrush]           = useState(false);
  const [breach,          setBreach]          = useState(false);
  const [artsBurst,       setArtsBurst]       = useState(false);
  const [artsStacks,      setArtsStacks]      = useState(1);
  const [electrification, setElectrification] = useState(false);
  const [combustion,      setCombustion]      = useState(false);
  const [corrosion,       setCorrosion]       = useState(false);
  const [solidification,  setSolidification]  = useState(false);
  const [shatter,         setShatter]         = useState(false);

  return (
    <>
      {/* Physical status card — amber accent */}
      <Card accent={AMBER}>
        <SectionHead>Physical status</SectionHead>
        {/* Vulnerable stacks: 0–4, each stack increases damage taken */}
        <Row>
          <Lbl>Vulnerable stacks</Lbl>
          <Spinner value={vulnStacks} onChange={setVulnStacks} min={0} max={4} />
        </Row>
        <Divider />
        {/* Physical status badges — click to toggle */}
        <div className={c.badgeWrap}>
          <Badge label="Lift"       color={AMBER} active={lift}   onToggle={() => setLift(v => !v)}   />
          <Badge label="Knock Down" color={AMBER} active={kd}     onToggle={() => setKd(v => !v)}     />
          <Badge label="Crush"      color={RED}   active={crush}  onToggle={() => setCrush(v => !v)}  />
          <Badge label="Breach"     color={RED}   active={breach} onToggle={() => setBreach(v => !v)} />
        </div>
      </Card>

      {/* Arts reactions card — purple accent */}
      <Card accent={PURPLE}>
        <SectionHead>Arts reactions</SectionHead>
        <Row>
          <Lbl>Arts burst active</Lbl>
          <Checkbox checked={artsBurst} onChange={setArtsBurst} color={PURPLE} />
        </Row>
        {/* Infliction stack count only visible when Arts Burst is active */}
        {artsBurst && (
          <Row>
            <Lbl muted>Infliction stacks</Lbl>
            <Spinner value={artsStacks} onChange={setArtsStacks} min={1} max={4} />
          </Row>
        )}
        <Divider />
        {/* Arts reaction badges — each has its own colour from the game */}
        <div className={c.badgeWrap}>
          <Badge label="Electrification" color={TEAL}   active={electrification} onToggle={() => setElectrification(v => !v)} />
          <Badge label="Combustion"       color={AMBER}  active={combustion}      onToggle={() => setCombustion(v => !v)}      />
          <Badge label="Corrosion"        color={GREEN}  active={corrosion}       onToggle={() => setCorrosion(v => !v)}       />
          <Badge label="Solidification"   color={BLUE}   active={solidification}  onToggle={() => setSolidification(v => !v)}  />
          <Badge label="Shatter"          color={RED}    active={shatter}         onToggle={() => setShatter(v => !v)}         />
        </div>
      </Card>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILL SEGMENT COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BasicAttack — Basic attack skill segment
 *
 * The most structured of the four skill segments because basic attacks have
 * a fixed set of sub-hits (AA1–4 or AA1–5) plus optional Dive and Finisher.
 *
 * State:
 *   enabled    — Object tracking which hits are active (included in calculation)
 *                Keys: 1, 2, 3, 4, 5, "dive", "finisher"
 *   mults      — Object storing the multiplier for each hit
 *   has5th     — Whether the 5-hit string variant is enabled (shows AA5 row)
 *   staggered  — Whether the enemy is staggered (gates the Finisher row)
 *
 * The `activeCount` derived value counts how many hits are currently enabled
 * and shown in the panel — displayed at the bottom as a quick reference.
 */
function BasicAttack() {
  // The base 4 AA hits — always present
  const AA_HITS = [1, 2, 3, 4];

  // Which hits are currently included in the calculation (checkboxes)
  const [enabled, setEnabled] = useState({
    1: true, 2: true, 3: true, 4: true,   // All 4 base hits enabled by default
    5: false,                               // 5th hit disabled until has5th is true
    dive: false,                           // Dive not included by default
    finisher: false,                       // Finisher not available until staggered
  });

  // Multiplier value for each hit
  const [mults, setMults] = useState({
    1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0,
    dive: 1.5,      // Dive typically hits harder than normal AA
    finisher: 3.0,  // Finisher is usually a very strong hit
  });

  const [has5th,    setHas5th]    = useState(false);  // 5-hit string toggle
  const [staggered, setStaggered] = useState(false);  // Enemy stagger state

  // Update a single multiplier without replacing the whole object
  // { ...m, [key]: v } = spread existing object, then overwrite key with v
  const setMult   = (key, v) => setMults(m => ({ ...m, [key]: v }));

  // Toggle a single hit's enabled state
  const toggleHit = (key) => setEnabled(e => ({ ...e, [key]: !e[key] }));

  /**
   * Derived value: count of currently active hits.
   * Recalculated automatically whenever enabled/has5th/staggered changes.
   */
  const activeCount =
    AA_HITS.filter(i => enabled[i]).length            // Base hits AA1–4
    + (has5th && enabled[5] ? 1 : 0)                  // AA5 (if 5-hit enabled and checked)
    + (enabled.dive ? 1 : 0)                          // Dive (if checked)
    + (staggered && enabled.finisher ? 1 : 0);        // Finisher (if staggered and checked)

  return (
    <SkillCard label="Basic Attack" accent={AMBER}>

      {/* Toggle to enable the 5th hit variant */}
      <Row>
        <Lbl muted>5-hit string</Lbl>
        <Checkbox checked={has5th} onChange={setHas5th} color={AMBER} />
      </Row>
      <Divider />

      {/* AA1–AA4: always rendered */}
      {AA_HITS.map(i => (
        <div key={i} className={s.hitRow}>
          <Checkbox checked={enabled[i]} onChange={() => toggleHit(i)} color={AMBER} />
          <span className={s.hitLabel}>AA {i}</span>
          <MultSpinner value={mults[i]} onChange={(v) => setMult(i, v)} />
        </div>
      ))}

      {/* AA5: only rendered when the 5-hit string is enabled */}
      {has5th && (
        <div className={s.hitRow}>
          <Checkbox checked={enabled[5]} onChange={() => toggleHit(5)} color={AMBER} />
          <span className={s.hitLabel}>AA 5</span>
          <MultSpinner value={mults[5]} onChange={(v) => setMult(5, v)} />
        </div>
      )}

      <Divider />

      {/* Dive attack — available regardless of stagger */}
      <div className={s.hitRow}>
        <Checkbox checked={enabled.dive} onChange={() => toggleHit("dive")} color={AMBER} />
        <span className={s.hitLabel}>Dive attack</span>
        <MultSpinner value={mults.dive} onChange={(v) => setMult("dive", v)} />
      </div>

      <Divider />

      {/* Stagger toggle — gates the finisher row */}
      <Row>
        <Lbl muted>Target staggered</Lbl>
        <Checkbox checked={staggered} onChange={setStaggered} color={AMBER} />
      </Row>

      {/* Finisher row — dimmed and non-interactive when not staggered */}
      <div
        className={s.finisherRow}
        style={{
          opacity:       staggered ? 1 : 0.35,    // Visual dimming when locked
          pointerEvents: staggered ? "auto" : "none",  // Prevents interaction when locked
        }}
      >
        <Checkbox checked={enabled.finisher} onChange={() => toggleHit("finisher")} color={AMBER} />
        <span
          className={s.hitLabel}
          style={{ color: staggered ? "var(--color-text-secondary)" : "var(--color-text-tertiary)" }}
        >
          Finisher
        </span>
        <MultSpinner value={mults.finisher} onChange={(v) => setMult("finisher", v)} />
      </div>

      <Divider />

      {/* Active hit count summary */}
      <div className={s.totalRow}>
        <span className={s.totalLabel}>Active hits</span>
        <span className={s.totalValue} style={{ color: AMBER }}>{activeCount}</span>
      </div>

    </SkillCard>
  );
}

/**
 * BattleSkill — Battle skill segment
 *
 * The operator's primary activated skill. Highly variable between operators,
 * so the structure is intentionally open-ended with custom modifier rows.
 *
 * State:
 *   mult     — Base damage multiplier
 *   hits     — Number of hits the skill deals
 *   followUp — Whether the skill triggers a follow-up attack
 *   mods     — Custom modifier rows (managed by useModifiers hook)
 */
function BattleSkill() {
  const [mult,     setMult]     = useState(1.0);
  const [hits,     setHits]     = useState(1);
  const [followUp, setFollowUp] = useState(false);
  // Destructure everything from the useModifiers hook
  const { mods, add, remove, setLabel, setValue } = useModifiers();

  return (
    <SkillCard label="Battle Skill" accent={TEAL}>
      <Row><Lbl>Multiplier</Lbl>   <MultSpinner value={mult}     onChange={setMult}     /></Row>
      <Row><Lbl>Hits</Lbl>          <Spinner     value={hits}     onChange={setHits}     min={1} max={20} /></Row>
      <Row><Lbl>Has follow-up</Lbl> <Checkbox    checked={followUp} onChange={setFollowUp} color={TEAL} /></Row>
      <Divider />
      <SectionHead>Custom modifiers</SectionHead>
      {/* Render one ModRow per modifier in the list */}
      {mods.map(m => (
        <ModRow
          key={m.id}
          id={m.id}
          label={m.label}
          value={m.value}
          onLabelChange={setLabel}
          onValueChange={setValue}
          onRemove={remove}
        />
      ))}
      <AddModBtn onClick={add} />
    </SkillCard>
  );
}

/**
 * ComboSkill — Combo skill segment
 *
 * Similar to Battle Skill but gated by a Combo resource cost.
 * The `cost` field represents how many Combo points are consumed on use.
 *
 * State:
 *   cost     — Combo resource cost to activate
 *   mult     — Base damage multiplier
 *   hits     — Number of hits
 *   followUp — Whether a follow-up is triggered
 *   mods     — Custom modifier rows
 */
function ComboSkill() {
  const [cost,     setCost]     = useState(1);
  const [mult,     setMult]     = useState(1.0);
  const [hits,     setHits]     = useState(1);
  const [followUp, setFollowUp] = useState(false);
  const { mods, add, remove, setLabel, setValue } = useModifiers();

  return (
    <SkillCard label="Combo Skill" accent={PURPLE}>
      <Row><Lbl>Combo cost</Lbl>   <Spinner     value={cost}     onChange={setCost}     min={1} max={10} /></Row>
      <Row><Lbl>Multiplier</Lbl>   <MultSpinner value={mult}     onChange={setMult}     /></Row>
      <Row><Lbl>Hits</Lbl>          <Spinner     value={hits}     onChange={setHits}     min={1} max={20} /></Row>
      <Row><Lbl>Has follow-up</Lbl> <Checkbox    checked={followUp} onChange={setFollowUp} color={PURPLE} /></Row>
      <Divider />
      <SectionHead>Custom modifiers</SectionHead>
      {mods.map(m => (
        <ModRow
          key={m.id}
          id={m.id}
          label={m.label}
          value={m.value}
          onLabelChange={setLabel}
          onValueChange={setValue}
          onRemove={remove}
        />
      ))}
      <AddModBtn onClick={add} />
    </SkillCard>
  );
}

/**
 * Ultimate — Ultimate skill segment
 *
 * The operator's most powerful skill, gated by an Energy resource.
 * Has an extra "Lingering effect" toggle for ultimates that deal damage
 * over time or leave persistent zones.
 *
 * State:
 *   energy    — Energy cost to activate
 *   mult      — Base damage multiplier
 *   hits      — Number of hits
 *   followUp  — Whether a follow-up is triggered
 *   lingering — Whether the skill has a persistent/DoT component
 *   mods      — Custom modifier rows
 */
function Ultimate() {
  const [energy,    setEnergy]    = useState(100);
  const [mult,      setMult]      = useState(1.0);
  const [hits,      setHits]      = useState(1);
  const [followUp,  setFollowUp]  = useState(false);
  const [lingering, setLingering] = useState(false);
  const { mods, add, remove, setLabel, setValue } = useModifiers();

  return (
    <SkillCard label="Ultimate" accent={RED}>
      {/* Energy steps by 10 — typical costs are multiples of 10 */}
      <Row><Lbl>Energy cost</Lbl>     <Spinner     value={energy}    onChange={setEnergy}    step={10} min={0} max={300} /></Row>
      <Row><Lbl>Multiplier</Lbl>      <MultSpinner value={mult}      onChange={setMult}      /></Row>
      <Row><Lbl>Hits</Lbl>             <Spinner     value={hits}      onChange={setHits}      min={1} max={20} /></Row>
      <Row><Lbl>Has follow-up</Lbl>   <Checkbox    checked={followUp}  onChange={setFollowUp}  color={RED} /></Row>
      <Row><Lbl>Lingering effect</Lbl><Checkbox    checked={lingering} onChange={setLingering} color={RED} /></Row>
      <Divider />
      <SectionHead>Custom modifiers</SectionHead>
      {mods.map(m => (
        <ModRow
          key={m.id}
          id={m.id}
          label={m.label}
          value={m.value}
          onLabelChange={setLabel}
          onValueChange={setValue}
          onRemove={remove}
        />
      ))}
      <AddModBtn onClick={add} />
    </SkillCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT DPS TAB COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * DPSTab — Root component for the DPS tab
 *
 * Owns the open/closed state for the three collapsible buff columns.
 * Renders the buff row and skill row, passing open state and toggle
 * callbacks down to each ColSection.
 *
 * State:
 *   open  {object}  { atk, enemy, status } — booleans, all false by default
 *                   Each key controls one column's open/closed state.
 */
export default function DPSTab() {
  // All columns start collapsed
  const [open, setOpen] = useState({ atk: false, enemy: false, status: false });

  /**
   * Toggle a single column by key.
   * Uses the spread operator to update only the targeted key:
   *   { ...o, [key]: !o[key] }
   *   → copies all existing values, then flips the value at [key]
   */
  const toggle = (key) => setOpen(o => ({ ...o, [key]: !o[key] }));

  return (
    <div className={s.dpsRoot}>

      {/* ── TOP ROW: Collapsible buff columns ──────────────────────────── */}
      <div className={s.buffRow}>
        <ColSection
          label="Attacker buffs"
          accent={TEAL}
          open={open.atk}
          onToggle={() => toggle("atk")}
        >
          <AttackerBuffs />
        </ColSection>

        <ColSection
          label="Enemy & debuffs"
          accent={RED}
          open={open.enemy}
          onToggle={() => toggle("enemy")}
        >
          <EnemyDebuffs />
        </ColSection>

        <ColSection
          label="Status effects"
          accent={PURPLE}
          open={open.status}
          onToggle={() => toggle("status")}
        >
          <StatusEffects />
        </ColSection>
      </div>

      {/* Thin horizontal rule separating buff row from skill row */}
      <div className={s.rowDivider} />

      {/* ── BOTTOM ROW: Skill segments (always visible) ─────────────────── */}
      <div className={s.skillRow}>
        <BasicAttack />
        <BattleSkill />
        <ComboSkill  />
        <Ultimate    />
      </div>

    </div>
  );
}
