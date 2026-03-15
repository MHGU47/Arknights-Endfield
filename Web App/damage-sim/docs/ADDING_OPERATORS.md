# Adding Operators

This guide explains how to add a new operator to the simulator.

All operator data lives in `src/constants.js`. The app reads from this file — you don't need to touch any component files to add a new operator.

---

## Step 1 — Add the operator to the `OPERATORS` array

Open `src/constants.js` and find the `OPERATORS` array. Add a new object following this template:

```js
{
  id: 4,                              // Must be unique. Use the next number in sequence.
  name: "Perlica",                    // Display name — appears in the operator card header
  element: "electro",                 // Element type — currently display-only
  stars: 6,                           // Rarity: controls number of ◆ stars shown (1–6)
  tags: ["Damage Dealer", "Link"],    // Role tags shown below the name. Use any strings.
  attributes: {
    Strength:  120,                   // Raw stat values from the game
    Agility:   180,
    Intellect: 420,
    Will:       95,
  },
  hp:  6200,                          // Max HP
  atk: 3800,                          // Attack
  def:  160,                          // Defence
  skills: [
    { rank: null },                   // Skill 1 — null means no rank badge
    { rank: null },                   // Skill 2
    { rank: 6  },                     // Skill 3 — shows "RANK 6" badge
    { rank: null },                   // Skill 4
  ],
  techniques: [
    "Technique Name 1",               // First technique button label
    "Technique Name 2",               // Second technique button label
  ],
}
```

**Important:** The `id` must be unique and match the array index (0, 1, 2, 3...). The operator tray uses this index to select operators.

---

## Step 2 — Done

That's it. The `OperatorTray` and `OperatorCard` components both read from the `OPERATORS` array automatically. Your new operator will appear in the tray immediately.

---

## Optional: Adding a profile image

The operator circles in the tray currently show a generic person icon. Once you have actual character portrait images:

1. Put the image file in `src/assets/operators/` (create this folder if it doesn't exist)
2. Import it at the top of `OperatorCard.jsx`:
   ```js
   import perlicaImg from "../assets/operators/perlica.png";
   ```
3. Add an `image` field to the operator object in `constants.js`:
   ```js
   image: perlicaImg,
   ```
4. Pass it to the circle div in `OperatorTray.jsx` as a background image

---

## Skill ranks

The `rank` field on each skill controls whether a "RANK 6" badge appears on the skill circle:

- `{ rank: null }` — no badge, default border colour
- `{ rank: 6 }` — shows "RANK 6" in teal, teal border on the circle
- Any other number works too: `{ rank: 3 }` shows "RANK 3"

---

## Notes on `element`

The `element` field is stored but currently only used to determine the icon colour in the header. The mapping of element names to colours is defined inline in `OperatorCard.jsx`. If you want to add support for a new element with a different colour, add a condition there.

Currently all operators use the teal/cryo colour. Future work: extend this to support the other Endfield elements (pyro, electro, etc.) with appropriate colours.
