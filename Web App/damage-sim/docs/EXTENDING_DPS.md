# Extending the DPS Tab

This guide explains how to hook up the existing DPS tab inputs to actual damage calculations, and how to extend the skill segments.

---

## Current State

The DPS tab currently captures a lot of input (buff values, debuff values, skill multipliers) but doesn't yet calculate anything. All the values are stored in local component state — the next step is to lift that state up and wire it into a damage formula.

---

## Step 1 — Understanding the Damage Formula

Arknights: Endfield uses a layered damage formula. A simplified version:

```
Final Damage =
  Base Damage
  × ATK multiplier
  × Skill multiplier
  × DMG bonus
  × DEF reduction
  × Susceptibility
  × Crit multiplier (if crit)
  × Final DMG bonus
  × Weaken (if active)
```

Where:
- **Base Damage** = Operator ATK stat × skill base ratio
- **DEF reduction** = `ATK / (ATK + enemy DEF after shred)`
- **Crit multiplier** = `1 + (Crit DMG / 100)` when a crit occurs
- **Expected crit** = `1 + (Crit Rate / 100) × (Crit DMG / 100)`

---

## Step 2 — Lifting State Up

Right now each buff/debuff/skill value is stored inside its own component. To calculate damage, you need all of them in one place.

The cleanest approach is to create a shared state object in `DPSTab.jsx` and pass setter functions down:

```jsx
// In DPSTab.jsx — add at the top of the DPSTab component:
const [buffs, setBuffs] = useState({
  atkPct:    0,
  dmgPct:    0,
  finalDmg:  0,
  critRate:  5,
  critDmg:   50,
  linkActive: false,
  linkStacks: 1,
});

const [enemy, setEnemy] = useState({
  def:       100,
  defShred:  0,
  defIgnore: 0,
  susc:      0,
  dmgTaken:  0,
  weaken:    false,
  weakenPct: 0,
});
```

Then pass a `onBuffChange` prop to `AttackerBuffs` and `onEnemyChange` to `EnemyDebuffs`:

```jsx
<ColSection ...>
  <AttackerBuffs values={buffs} onChange={(key, val) => setBuffs(b => ({ ...b, [key]: val }))} />
</ColSection>
```

---

## Step 3 — Create a `damageCalc.js` utility

Create `src/utils/damageCalc.js`:

```js
/**
 * Calculates expected damage per hit.
 *
 * @param {object} params
 * @param {number} params.baseAtk        - Operator's ATK stat
 * @param {number} params.skillMult      - Skill multiplier (e.g. 1.5 = 150%)
 * @param {number} params.atkPct         - ATK% bonus (e.g. 30 = +30%)
 * @param {number} params.dmgPct         - DMG bonus% (e.g. 20 = +20%)
 * @param {number} params.finalDmgPct    - Final DMG bonus%
 * @param {number} params.critRate       - Crit rate as percentage (e.g. 30 = 30%)
 * @param {number} params.critDmg        - Crit DMG as percentage (e.g. 150 = 150%)
 * @param {number} params.enemyDef       - Enemy DEF stat
 * @param {number} params.defShredPct    - DEF shred% (e.g. 20 = removes 20% of DEF)
 * @param {number} params.flatDefIgnore  - Flat DEF ignored
 * @param {number} params.suscPct        - Susceptibility% bonus
 * @param {number} params.dmgTakenPct    - DMG taken% bonus on enemy
 * @param {boolean} params.weaken        - Whether weaken debuff is active
 * @param {number} params.weakenPct      - Weaken penalty%
 * @returns {number} Expected damage per hit
 */
export function calcDamage({
  baseAtk,
  skillMult,
  atkPct,
  dmgPct,
  finalDmgPct,
  critRate,
  critDmg,
  enemyDef,
  defShredPct,
  flatDefIgnore,
  suscPct,
  dmgTakenPct,
  weaken,
  weakenPct,
}) {
  // Step 1: Apply ATK bonus
  const effectiveAtk = baseAtk * (1 + atkPct / 100);

  // Step 2: Base hit damage
  const baseDmg = effectiveAtk * skillMult;

  // Step 3: DEF calculation
  const defAfterShred  = enemyDef * (1 - defShredPct / 100);
  const defAfterIgnore = Math.max(0, defAfterShred - flatDefIgnore);
  const defReduction   = effectiveAtk / (effectiveAtk + defAfterIgnore);

  // Step 4: DMG bonus multipliers
  const dmgMult      = 1 + dmgPct / 100;
  const suscMult     = 1 + suscPct / 100;
  const dmgTakenMult = 1 + dmgTakenPct / 100;
  const finalMult    = 1 + finalDmgPct / 100;

  // Step 5: Expected crit multiplier (averages across all hits)
  const critMult = 1 + (critRate / 100) * (critDmg / 100);

  // Step 6: Weaken penalty (reduces damage dealt)
  const weakenMult = weaken ? (1 - weakenPct / 100) : 1;

  // Step 7: Combine
  return baseDmg * defReduction * dmgMult * suscMult * dmgTakenMult * finalMult * critMult * weakenMult;
}
```

---

## Step 4 — Display the Result

Add a result bar at the bottom of `DPSTab.jsx`:

```jsx
const damage = calcDamage({
  baseAtk: OPERATORS[activeOperator].atk,
  skillMult: /* from skill segment state */,
  ...buffs,
  ...enemy,
});

// In the JSX:
<div style={{ padding: "8px 0", display: "flex", justifyContent: "space-between" }}>
  <span>Expected damage per hit</span>
  <span style={{ color: AMBER, fontWeight: 500 }}>{Math.round(damage).toLocaleString()}</span>
</div>
```

---

## Step 5 — Extending Skill Segments

Each skill card (Battle Skill, Combo Skill, Ultimate) has a "Custom modifiers" section where you can add free-form multiplier rows. Each modifier object looks like:

```js
{ id: 1234567890, label: "Talent bonus", value: 1.2 }
```

To fold these into the damage calculation, multiply them all together:

```js
const modifierTotal = mods.reduce((acc, mod) => acc * mod.value, 1);
const totalDamage = calcDamage({ ... }) * modifierTotal * hits;
```

---

## Adding a New Buff Row

To add a new row to, say, the Attacker Buffs card:

1. Add a new `useState` for the value:
   ```jsx
   const [newBuff, setNewBuff] = useState(0);
   ```
2. Add the row in the JSX:
   ```jsx
   <Row><Lbl>New buff %</Lbl><PctSpinner value={newBuff} onChange={setNewBuff} /></Row>
   ```
3. Include the value in your damage formula.

---

## Adding a New Status Effect Badge

To add a new badge to the Status Effects panel:

```jsx
const [frozen, setFrozen] = useState(false);

// In the badgeWrap:
<Badge label="Frozen" color={BLUE} active={frozen} onToggle={() => setFrozen(v => !v)} />
```

The `color` prop controls the highlight colour when active. Use the colour constants at the top of `DPSTab.jsx` (`TEAL`, `AMBER`, `RED`, `PURPLE`, `GREEN`, `BLUE`).
