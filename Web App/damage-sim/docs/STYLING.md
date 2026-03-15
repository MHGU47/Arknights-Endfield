# Styling Guide

This project uses **CSS Modules** for all component styles. This document explains what that means, how to use them, and how to add new styles.

---

## What Are CSS Modules?

A CSS Module is a `.module.css` file where every class name is **automatically scoped** to the component that imports it.

Without CSS Modules, if two files both define `.card`, they conflict globally. With CSS Modules, each `.card` gets a unique hashed name at build time (e.g. `.card_x7f2k`), so they never collide — even if you use the same class name in ten different files.

---

## How to Use Them

### 1. Import the styles

```jsx
import s from "../styles/TopBar.module.css";
```

The `s` is just a convention (short for "styles"). You could call it anything. It's an object where each key is a class name from the CSS file.

### 2. Apply a class

```jsx
<div className={s.equipmentBox}>
```

This applies the `.equipmentBox` class from `TopBar.module.css` — scoped only to this component.

### 3. Combining multiple classes

```jsx
<span className={`${s.chevron} ${open ? s.chevronOpen : ""}`}>
```

This uses a template literal to conditionally add `chevronOpen` when `open` is true. It's the standard pattern for conditional classes in this project.

---

## Inline Styles vs CSS Modules

In this project, the rule is:

- **Static styles** (colours, sizes, layout that never change) → CSS Module class
- **Dynamic styles** (values driven by JavaScript variables or state) → inline `style=` prop

**Example — static:**
```jsx
// ✅ Correct — this never changes, belongs in CSS
<div className={s.card}>
```

**Example — dynamic:**
```jsx
// ✅ Correct — colour comes from a prop, must be inline
<div style={{ borderColor: accent + "44" }}>
```

**Example — wrong:**
```jsx
// ❌ Wrong — this is static, should be a CSS class
<div style={{ display: "flex", gap: 8, padding: "10px 12px" }}>
```

---

## CSS Variable Reference

These variables are defined in `src/index.css` and automatically adapt to light/dark mode. Always use them instead of hardcoded colours.

### Background colours

| Variable | Light mode | Dark mode | Use for |
|----------|-----------|-----------|---------|
| `--color-background-primary` | White | Near-black | Cards, panels, main surfaces |
| `--color-background-secondary` | Light grey | Dark grey | Sidebar, section headers, input backgrounds |
| `--color-background-tertiary` | Lighter grey | Darker grey | Page background |

### Text colours

| Variable | Use for |
|----------|---------|
| `--color-text-primary` | Main readable text |
| `--color-text-secondary` | Labels, supporting text |
| `--color-text-tertiary` | Hints, placeholders, disabled text |

### Border colours

| Variable | Use for |
|----------|---------|
| `--color-border-tertiary` | Default subtle borders (0.5px lines) |
| `--color-border-secondary` | Hover state borders, input borders |
| `--color-border-primary` | Active/focus borders |

### Layout tokens

| Variable | Value | Use for |
|----------|-------|---------|
| `--border-radius-md` | 8px | Most components |
| `--border-radius-lg` | 12px | Cards, larger containers |
| `--border-radius-xl` | 16px | Modals, overlays |

---

## Style File Map

| File | What it styles |
|------|---------------|
| `src/index.css` | Global reset and CSS variable definitions |
| `src/styles/components.module.css` | Shared primitives: Spinner, Checkbox, Badge, modifier inputs/buttons |
| `src/styles/TopBar.module.css` | TopBar layout, EquipmentBox, weapon level dropdown |
| `src/styles/OperatorTray.module.css` | The collapsible operator selector |
| `src/styles/OperatorCard.module.css` | Operator stats panel (header, attributes, skills, techniques) |
| `src/styles/MainContent.module.css` | Tab bar and tab content area |
| `src/styles/DPSTab.module.css` | DPS tab layout, collapsible columns, skill cards |

---

## Adding a New Style

1. Open the relevant `.module.css` file (or create a new one if your component is large enough to warrant it)
2. Add your class using camelCase (e.g. `.myNewClass`, not `.my-new-class`) — CSS Modules work better with camelCase because you reference them as `s.myNewClass` in JSX
3. Import and use it

```css
/* In TopBar.module.css */
.myNewThing {
  font-size: 12px;
  color: var(--color-text-secondary);
  padding: 4px 8px;
}
```

```jsx
// In TopBar.jsx
<div className={s.myNewThing}>Hello</div>
```

---

## Creating a New Module File

If you're building a new component that's large enough to deserve its own CSS file:

1. Create `src/styles/MyComponent.module.css`
2. Import it at the top of your component: `import s from "../styles/MyComponent.module.css";`
3. Write your classes using CSS variables for colours

There's no registration or configuration needed — Vite handles `.module.css` files automatically.
