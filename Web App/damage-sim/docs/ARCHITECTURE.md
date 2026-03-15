# Architecture

This document explains every component in the app — what it does, what data it receives, and how it connects to the rest of the app.

---

## Component Tree

```
App
├── LeftPanel
│   ├── OperatorTray
│   └── OperatorCard
└── (right side div)
    ├── TopBar
    │   └── EquipmentBox (×5)
    │       └── Spinner (×3 per box)
    │       └── WeaponLevelDropdown (weapon box only)
    └── MainContent
        ├── DPSTab
        │   ├── ColSection (×3: Attacker Buffs, Enemy & Debuffs, Status Effects)
        │   │   ├── AttackerBuffs
        │   │   ├── EnemyDebuffs
        │   │   └── StatusEffects
        │   └── (skill row)
        │       ├── BasicAttack
        │       ├── BattleSkill
        │       ├── ComboSkill
        │       └── Ultimate
        ├── OverviewTab
        └── RotationsTab
```

---

## Data Flow

```
App (owns: activeOperator)
 │
 ├─── passes activeOperator ──────────────► LeftPanel
 │                                              │
 │                                              ├── OperatorTray
 │                                              │     reads OPERATORS from constants.js
 │                                              │     calls onSelect(id) → bubbles up to App
 │                                              │
 │                                              └── OperatorCard
 │                                                    reads OPERATORS[activeOperator]
 │
 └─── TopBar (self-contained, no props needed yet)
 └─── MainContent (self-contained)
```

State that only affects one area (e.g. which DPS tab buff is ticked) stays local to that component and never needs to bubble up.

---

## File-by-File Reference

---

### `src/main.jsx`

**What it does:** The entry point. React needs a single JavaScript file to start from. This file finds the `<div id="root">` in `index.html` and renders the entire app inside it.

**You should never need to edit this file.**

---

### `src/App.jsx`

**What it does:** The root component. It defines the overall page layout (left panel 20%, right side 80%) and owns the `activeOperator` state — the index of whichever operator is currently selected.

**Why state lives here:** Both `OperatorTray` (the selector) and `OperatorCard` (the display) need to know which operator is active. Since they're in separate branches of the tree, their shared state must live in their closest common ancestor — which is `App`.

**Props it passes down:**

| Prop | Goes to | Purpose |
|------|---------|---------|
| `activeOperator` | `LeftPanel` | Which operator's data to display |
| `onSelectOperator` | `LeftPanel` | Callback to change the active operator |

---

### `src/constants.js`

**What it does:** A single source of truth for all static data used across the app. Nothing here is a React component — it's just exported JavaScript values.

**Exports:**

| Export | Type | Purpose |
|--------|------|---------|
| `TEAL` | string | Primary accent colour (#0fc4c4) |
| `TEAL_BG` | string | Teal at 13% opacity — used for icon backgrounds |
| `TEAL_BORDER` | string | Teal at 40% opacity — used for icon borders |
| `GOLD` | string | Gold colour for the Intellect attribute (#c8a200) |
| `OPERATORS` | array | Array of operator objects with stats, skills, etc. |
| `EQUIPMENT_SLOTS` | array | Array of `{ name, type }` objects for the 5 equipment slots |
| `WEAPON_LEVELS` | array | Available weapon level values for the dropdown |

**Operator object shape:**
```js
{
  id: 0,                          // Unique numeric ID
  name: "Yvonne",                 // Display name
  element: "cryo",                // Element type (currently display-only)
  stars: 6,                       // Rarity (controls how many ◆ stars show)
  tags: ["Damage Dealer", ...],   // Role tags shown below the name
  attributes: {                   // The four core stats
    Strength: 82,
    Agility: 271,
    Intellect: 578,
    Will: 105,
  },
  hp: 5905,                       // Max HP
  atk: 3412,                      // Attack
  def: 140,                       // Defence
  skills: [                       // Array of 4 skill objects
    { rank: null },               // null = no rank badge shown
    { rank: 6 },                  // number = shows "RANK 6" badge
    { rank: 6 },
    { rank: null },
  ],
  techniques: [                   // The two technique names at the bottom
    "Barrage of Technology",
    "Freezing Point",
  ],
}
```

---

### `src/index.css`

**What it does:** Global styles that apply to the whole page. Two main jobs:

1. **CSS reset** — removes default browser margins, padding, and box-sizing inconsistencies so everything starts from a clean slate.
2. **CSS variable definitions** — defines the colour and spacing tokens (like `--color-text-primary`, `--border-radius-md`) used throughout the app. Also includes a dark mode version using `@media (prefers-color-scheme: dark)`.

**Why CSS variables?** They let every component reference the same colour by name. If you want to change the background colour of the whole app, you change one variable rather than hunting through every CSS file.

---

### `src/components/LeftPanel.jsx`

**What it does:** A layout shell for the left sidebar. It stacks `OperatorTray` at the top and `OperatorCard` below it (scrollable).

**Props:**

| Prop | Type | Purpose |
|------|------|---------|
| `activeOperator` | number | Index of the currently selected operator |
| `onSelectOperator` | function | Called with a new operator index when the user picks one |

**Note:** This component contains no logic of its own — it just passes props down and handles the scrollable container.

---

### `src/components/OperatorTray.jsx`

**What it does:** The collapsible dropdown at the top of the left panel. Shows all four operator slots in a 2×2 grid. Clicking one selects that operator and closes the tray.

**Props:**

| Prop | Type | Purpose |
|------|------|---------|
| `activeOperator` | number | Highlights the currently selected operator in teal |
| `onSelect` | function | Called with the operator's `id` when clicked |

**State:**
- `open` (boolean) — whether the tray is expanded or collapsed

**How the animation works:** The tray body uses CSS `max-height` transitioning from `0` to `140px`. This is a common CSS trick — you can't animate `height: auto`, but you can animate `max-height` to a value larger than the content will ever be.

---

### `src/components/OperatorCard.jsx`

**What it does:** Displays all the stats for the currently selected operator — element icon, name, stars, role tags, four attributes with icons, secondary stats (HP/ATK/DEF), skill circles with rank badges, and technique buttons.

**Props:**

| Prop | Type | Purpose |
|------|------|---------|
| `operatorId` | number | Index into the `OPERATORS` array |

**No state** — this is a pure display component. It reads from `constants.js` and renders.

**`ATTR_ICONS`** — a plain object mapping each attribute name to an SVG element. Using an object means you can look up the right icon by name: `ATTR_ICONS["Intellect"]`.

**`SKILL_ICONS`** — an array of four SVG elements, one per skill slot. The index matches the skill's position in the operator's `skills` array.

---

### `src/components/TopBar.jsx`

**What it does:** Renders the equipment row (five `EquipmentBox` components side by side) and the set effect bar below it.

**No props, no state** — reads slot definitions from `constants.js` and renders them. The set effect text is currently hardcoded as a placeholder.

---

### `src/components/EquipmentBox.jsx`

**What it does:** A single equipment slot. Shows a title, an image placeholder (or real image if provided), three spinner rows, and — for the weapon slot only — a level dropdown.

**Props:**

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `name` | string | — | Slot name displayed as title |
| `type` | string | — | Slot type — only `"weapon"` triggers the level dropdown |
| `image` | string/null | `null` | URL of an item image. If null, shows placeholder SVG |
| `labels` | array | `["Refinement", "Quality", "Bonus"]` | Labels for the three spinners |
| `onValuesChange` | function | — | Called with `{ labelName: value }` whenever any input changes |

**State:**
- `weaponLevel` (number) — the currently selected weapon level (weapon box only)

**Contains:** The `WeaponLevelDropdown` component (defined in the same file since it's only used here).

---

### `WeaponLevelDropdown` (inside EquipmentBox.jsx)

**What it does:** A custom dropdown that shows the current weapon level and opens a grid of level options when clicked. Uses a **React Portal** so the menu floats above all other elements rather than being clipped by parent containers.

**How the portal works:**
1. A `ref` is attached to the toggle button
2. When opened, `getBoundingClientRect()` reads the button's exact position on screen
3. The menu is rendered with `createPortal(...)` directly into `document.body`
4. The menu uses `position: fixed` with those coordinates — so it's anchored to the viewport, not the DOM tree
5. A `useEffect` listens for clicks anywhere on the page and closes the menu if the click was outside both the toggle and the menu

---

### `src/components/Spinner.jsx`

**What it does:** A reusable −/value/+ number input used in equipment boxes.

**Props:**

| Prop | Type | Default | Purpose |
|------|------|---------|---------|
| `label` | string | — | Text label shown to the left |
| `min` | number | `0` | Minimum allowed value |
| `max` | number | `999` | Maximum allowed value |
| `defaultValue` | number | `0` | Starting value |
| `onChange` | function | — | Called with the new value whenever it changes |

---

### `src/components/MainContent/MainContent.jsx`

**What it does:** Renders the tab bar (DPS / Overview / Rotations) and the content area. Switching tabs swaps out which component fills the content area.

**State:**
- `activeTab` (string) — `"dps"`, `"overview"`, or `"rotations"`

**`TABS` array:** Defined at the top of the file. Each entry has an `id`, a display `label`, and a `Component` reference. Adding a new tab means adding one entry here — no other changes needed.

---

### `src/components/MainContent/DPSTab.jsx`

**What it does:** The main working area of the app. Contains two rows:

1. **Buff row** — three collapsible columns (Attacker Buffs, Enemy & Debuffs, Status Effects), each starting collapsed
2. **Skill row** — four always-visible skill cards (Basic Attack, Battle Skill, Combo Skill, Ultimate)

This is the largest file in the project. It defines many small components internally because they're only used within the DPS tab.

**Internal components (not exported):**

| Component | Purpose |
|-----------|---------|
| `SectionHead` | Small uppercase section label |
| `Divider` | Horizontal rule between sections |
| `Row` | Flexbox row with space-between alignment |
| `Lbl` | Text label for a row |
| `Checkbox` | Tick/untick control with dynamic accent colour |
| `Spinner` | +/− value control (DPS variant — different from the EquipmentBox one) |
| `MultSpinner` | Spinner pre-configured for multiplier values (1.0×, 1.5×, etc.) |
| `PctSpinner` | Spinner pre-configured for percentage values |
| `Badge` | Toggleable pill for status effects |
| `Card` | White card container with optional accent border |
| `ColSection` | Collapsible column with header bar |
| `SkillCard` | Card container for a skill segment |
| `ModRow` | A single custom modifier row (label input + spinner + remove button) |
| `AddModBtn` | The "+ Add modifier" dashed button |

**Custom hook `useModifiers()`:** Manages the list of custom modifier rows for Battle Skill, Combo Skill, and Ultimate. Returns `{ mods, add, remove, setLabel, setValue }`. Using a hook here keeps the logic reusable across three components without duplicating code.

---

### `src/components/MainContent/OverviewTab.jsx` & `RotationsTab.jsx`

Currently placeholder components. They render a centred message and nothing else. These are the next areas to build out.

---

## Key React Concepts Used

### `useState`
Stores a value that can change. When it changes, React re-renders the component.
```js
const [open, setOpen] = useState(false); // starts as false
setOpen(true); // triggers a re-render with open = true
```

### `useEffect`
Runs code in response to something changing (or when a component mounts/unmounts).
```js
useEffect(() => {
  // runs when `open` changes
  document.addEventListener("mousedown", handler);
  return () => document.removeEventListener("mousedown", handler); // cleanup
}, [open]);
```

### `useRef`
Stores a reference to a DOM element without causing re-renders.
```js
const toggleRef = useRef(null);
// later: toggleRef.current.getBoundingClientRect()
```

### `useCallback`
Prevents a function from being recreated on every render. Used in `useModifiers()` to avoid unnecessary re-renders in the modifier list.

### `createPortal`
Renders JSX into a different DOM node than its parent.
```js
createPortal(<Menu />, document.body)
// <Menu /> appears in document.body, not inside the component's normal DOM position
```
