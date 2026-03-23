/**
 * constants.js — Shared data and configuration
 *
 * This file is the single source of truth for all static data used across
 * the app. Keeping data here (rather than hardcoded in components) means:
 *   - Adding a new operator = edit this file only
 *   - Changing a colour = edit this file only
 *   - No hunting through multiple component files
 *
 * Nothing here is a React component — these are plain JavaScript exports.
 */

// ── Colour tokens ─────────────────────────────────────────────────────────────
// These are used for dynamic styles (passed as JS values to style= props).
// Static colours go in CSS files using CSS variables instead.

/** Primary teal accent — used for active states, skill circles, tray highlights */
export const TEAL = "#0fc4c4";

/** Teal at ~13% opacity — used as a subtle background tint (e.g. element icon bg) */
export const TEAL_BG = "#0fc4c422";

/** Teal at ~40% opacity — used as a border colour (e.g. element icon border) */
export const TEAL_BORDER = "#0fc4c466";

/** Gold — used exclusively for the Intellect attribute to make it stand out */
export const GOLD = "#c8a200";

// ── Operator data ─────────────────────────────────────────────────────────────
/**
 * Array of operator objects. Each object represents one playable character.
 * The array index must match the `id` field.
 *
 * To add a new operator, append a new object here following the same shape.
 * See docs/ADDING_OPERATORS.md for a full guide.
 */
export const OPERATORS = [
  {
    id: 0,                    // Unique ID — must match the array index
    name: "Yvonne",           // Display name
    element: "cryo",          // Element type (display-only for now)
    stars: 6,                 // Rarity — controls number of ◆ stars shown
    tags: [                   // Role tags shown below the name
      "Damage Dealer",
      "Solidify",
      "Crit",
    ],
    attributes: {             // Four core stats shown in the attributes section
      Strength:  82,
      Agility:   271,
      Intellect: 578,         // Displayed in gold to highlight the main scaling stat
      Will:      105,
    },
    hp:  5905,                // Max HP
    atk: 3412,                // Attack
    def: 140,                 // Defence
    skills: [
      // Four skill slots. rank: null = no badge, rank: N = shows "RANK N"
      { rank: null },         // Skill 1 (passive / basic)
      { rank: 6    },         // Skill 2 — maxed at rank 6
      { rank: 6    },         // Skill 3 — maxed at rank 6
      { rank: null },         // Skill 4 (ultimate / passive)
    ],
    techniques: [             // Two technique buttons at the bottom of the card
      "Barrage of Technology",
      "Freezing Point",
    ],
  },

  // ── Placeholder operators (slots 2–4, not yet filled with real data) ──────
  {
    id: 1, name: "Op 2", element: null, stars: 5,
    tags: [],
    attributes: { Strength: 0, Agility: 0, Intellect: 0, Will: 0 },
    hp: 0, atk: 0, def: 0,
    skills: [], techniques: [],
  },
  {
    id: 2, name: "Op 3", element: null, stars: 5,
    tags: [],
    attributes: { Strength: 0, Agility: 0, Intellect: 0, Will: 0 },
    hp: 0, atk: 0, def: 0,
    skills: [], techniques: [],
  },
  {
    id: 3, name: "Op 4", element: null, stars: 5,
    tags: [],
    attributes: { Strength: 0, Agility: 0, Intellect: 0, Will: 0 },
    hp: 0, atk: 0, def: 0,
    skills: [], techniques: [],
  },
];

// ── Equipment slots ───────────────────────────────────────────────────────────
/**
 * Defines the five equipment slots shown in the top bar.
 * Each slot has a display name and a type string.
 *
 * The `type` field controls conditional behaviour in EquipmentBox:
 *   "weapon" — shows the extra weapon level dropdown
 *   Others   — only show the three standard spinners
 */
export const EQUIPMENT_SLOTS = [
  { name: "Weapon", type: "weapon" }, // Weapon — gets the level dropdown
  { name: "Armour", type: "armour" }, // Armour piece
  { name: "Gloves", type: "gloves" }, // Gloves
  { name: "Kit 1",  type: "kit"    }, // Accessory kit slot 1
  { name: "Kit 2",  type: "kit"    }, // Accessory kit slot 2
];

// ── Weapon levels ─────────────────────────────────────────────────────────────
/**
 * Available weapon level values for the level dropdown in the weapon slot.
 * These correspond to actual upgrade breakpoints in Arknights: Endfield.
 * Update this array if the game adds new level caps.
 */
export const WEAPON_LEVELS = [
  1, 20, 40, 60, 80, 90
];

// ── Operator levels ─────────────────────────────────────────────────────────────
/**
 * Available weapon level values for the level dropdown in the operator slot.
 */
export const OPERATOR_LEVELS = [
  1, 20, 40, 60, 80, 90
];

export const SKILL_LABELS = [
  "Basic Attack",
  "Battle Skill",
  "Combo Skill",
  "Ultimate"
]

// ── Equipment item data ───────────────────────────────────────────────────────
/**
 * Items available per slot type.
 * Each item has:
 *   id      — unique string identifier
 *   name    — display name
 *   rarity  — star count (5 or 6) — used for grouping and border colour
 *   color   — placeholder accent colour (replace with rarity colour system later)
 *   image   — null until real art assets are available
 *
 * Items are grouped by slot type so each equipment box only shows relevant items.
 * To add a new item, append to the relevant array below.
 */
export const EQUIPMENT_ITEMS = {
  weapon: [
    { id: "w1", name: "Celestial Cascade", rarity: 6, color: "#0fc4c4", image: null },
    { id: "w2", name: "Void Arbiter",       rarity: 6, color: "#9b72e8", image: null },
    { id: "w3", name: "Dawnrift Lance",     rarity: 6, color: "#e8a020", image: null },
    { id: "w4", name: "Crimson Epoch",      rarity: 6, color: "#e05050", image: null },
    { id: "w5", name: "Verdant Shard",      rarity: 6, color: "#4caf7d", image: null },
    { id: "w6", name: "Azure Tempest",      rarity: 5, color: "#60b8e0", image: null },
    { id: "w7", name: "Hollow Verdict",     rarity: 5, color: "#9b72e8", image: null },
    { id: "w8", name: "Solstice Mark",      rarity: 5, color: "#e8a020", image: null },
    { id: "w9", name: "Iron Covenant",      rarity: 5, color: "#b0b8c8", image: null },
    { id: "w10",name: "Pale Requiem",       rarity: 5, color: "#e05050", image: null },
  ],
  armour: [
    { id: "a1", name: "Titanfall Plate",    rarity: 6, color: "#0fc4c4", image: null },
    { id: "a2", name: "Voidwalker Mantle",  rarity: 6, color: "#9b72e8", image: null },
    { id: "a3", name: "Embered Carapace",   rarity: 6, color: "#e8a020", image: null },
    { id: "a4", name: "Frosted Aegis",      rarity: 5, color: "#60b8e0", image: null },
    { id: "a5", name: "Ashen Bulwark",      rarity: 5, color: "#b0b8c8", image: null },
    { id: "a6", name: "Thornback Vest",     rarity: 5, color: "#4caf7d", image: null },
  ],
  gloves: [
    { id: "g1", name: "Crestfallen Grip",   rarity: 6, color: "#0fc4c4", image: null },
    { id: "g2", name: "Null Gauntlets",     rarity: 6, color: "#9b72e8", image: null },
    { id: "g3", name: "Scorchmark Wraps",   rarity: 5, color: "#e8a020", image: null },
    { id: "g4", name: "Glacial Fingers",    rarity: 5, color: "#60b8e0", image: null },
    { id: "g5", name: "Ironthread Gloves",  rarity: 5, color: "#b0b8c8", image: null },
  ],
  kit: [
    { id: "k1", name: "Resonance Core",     rarity: 6, color: "#0fc4c4", image: null },
    { id: "k2", name: "Phantom Circuit",    rarity: 6, color: "#9b72e8", image: null },
    { id: "k3", name: "Ember Module",       rarity: 6, color: "#e8a020", image: null },
    { id: "k4", name: "Cryo Injector",      rarity: 5, color: "#60b8e0", image: null },
    { id: "k5", name: "Static Relay",       rarity: 5, color: "#4caf7d", image: null },
    { id: "k6", name: "Null Conduit",       rarity: 5, color: "#b0b8c8", image: null },
    { id: "k7", name: "Overdrive Cell",     rarity: 5, color: "#e05050", image: null },
  ],
};

/**
 * Rarity display config — update border/glow colours here when the final
 * rarity colour system is decided.
 */
export const RARITY_CONFIG = {
  6: { label: "★★★★★★", color: "#c8a200" }, // Placeholder — update later
  5: { label: "★★★★★",  color: "#9b72e8" }, // Placeholder — update later
};
