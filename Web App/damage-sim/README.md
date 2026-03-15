# Endfield Damage Simulator

A browser-based damage simulation tool for **Arknights: Endfield**, built with React and Vite. It lets you configure an operator's equipment, buffs, debuffs, and skill multipliers to model expected damage output.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Component Reference](#component-reference)
- [Styling System](#styling-system)
- [Data & Constants](#data--constants)
- [Extending the App](#extending-the-app)
- [Glossary](#glossary)

---

## Getting Started

### Prerequisites

You need **Node.js** installed. Download it from [nodejs.org](https://nodejs.org). Any version 18 or above works.

### Installation

```bash
# 1. Navigate into the project folder
cd endfield-sim-full

# 2. Install all dependencies (only needed once)
npm install

# 3. Start the development server
npm start
```

After running `npm start`, open your browser and go to **http://localhost:5173**. The app will hot-reload automatically whenever you save a file — you don't need to restart the server.

### Building for Production

```bash
npm run build
```

This creates a `dist/` folder with a fully optimised, self-contained version of the app you can host anywhere.

---

## Project Structure

```
endfield-sim-full/
├── index.html                        # HTML entry point — React mounts here
├── vite.config.js                    # Vite build tool configuration
├── package.json                      # Project metadata and dependencies
├── README.md                         # This file
├── docs/                             # Supplementary documentation
│   ├── ARCHITECTURE.md               # How components talk to each other
│   ├── STYLING.md                    # CSS Modules guide
│   ├── ADDING_OPERATORS.md           # How to add new operators
│   └── EXTENDING_DPS.md              # How to add new DPS calculations
└── src/
    ├── main.jsx                      # React bootstrapper — mounts <App />
    ├── App.jsx                       # Root component — owns top-level layout
    ├── constants.js                  # All shared data: colours, operators, slots
    ├── index.css                     # Global reset + CSS variable definitions
    ├── components/
    │   ├── LeftPanel.jsx             # Left sidebar shell (20% width)
    │   ├── OperatorTray.jsx          # Collapsible operator selector at top of sidebar
    │   ├── OperatorCard.jsx          # Operator stats display (attributes, skills etc.)
    │   ├── TopBar.jsx                # Equipment row + set effect bar
    │   ├── EquipmentBox.jsx          # Individual equipment slot (image + spinners)
    │   ├── Spinner.jsx               # Reusable +/− number input
    │   └── MainContent/
    │       ├── MainContent.jsx       # Tab bar + tab switching logic
    │       ├── DPSTab.jsx            # DPS tab: buffs, debuffs, skill segments
    │       ├── OverviewTab.jsx       # Overview tab (placeholder)
    │       └── RotationsTab.jsx      # Rotations tab (placeholder)
    └── styles/
        ├── components.module.css     # Styles for shared primitives (Spinner, Badge etc.)
        ├── TopBar.module.css         # Styles for TopBar and EquipmentBox
        ├── OperatorTray.module.css   # Styles for the operator dropdown tray
        ├── OperatorCard.module.css   # Styles for the operator stats panel
        ├── MainContent.module.css    # Styles for the tab bar and content area
        └── DPSTab.module.css         # Styles for the DPS tab layout and cards
```

---

## How It Works

The app is divided into three visual regions:

```
┌─────────────────────────────────────────────────────────┐
│  LEFT PANEL (20%)  │         RIGHT SIDE (80%)           │
│                    │  TOP BAR (equipment + set effect)  │
│  Operator tray     ├────────────────────────────────────│
│  Operator card     │  MAIN CONTENT (tabs)               │
│    - attributes    │    DPS tab                         │
│    - skills        │    Overview tab                    │
│    - techniques    │    Rotations tab                   │
└─────────────────────────────────────────────────────────┘
```

**State** (the data that changes when you interact with the app) lives at the top of the tree in `App.jsx` for things that multiple components need (like which operator is active), and locally inside each component for things only that component cares about (like whether a checkbox is ticked).

---

## Component Reference

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for a full breakdown of every component, its props, and how they connect.

---

## Styling System

This project uses **CSS Modules**. See [docs/STYLING.md](docs/STYLING.md) for a full explanation of how they work and how to add new styles.

---

## Data & Constants

All shared data lives in `src/constants.js`. See [docs/ADDING_OPERATORS.md](docs/ADDING_OPERATORS.md) for how to add new operators.

---

## Extending the App

- **Adding a new operator** → [docs/ADDING_OPERATORS.md](docs/ADDING_OPERATORS.md)
- **Adding DPS calculations** → [docs/EXTENDING_DPS.md](docs/EXTENDING_DPS.md)

---

## Glossary

| Term | Meaning |
|------|---------|
| **Component** | A reusable piece of UI written as a JavaScript function that returns HTML-like JSX |
| **Props** | Data passed from a parent component down to a child component |
| **State** | Data that lives inside a component and can change over time, causing a re-render |
| **Hook** | A special React function (always starting with `use`) that lets you add state or side effects to a component |
| **CSS Module** | A `.module.css` file where class names are automatically scoped to the component that imports it |
| **JSX** | The HTML-like syntax used inside React components — it gets compiled to JavaScript |
| **Portal** | A React feature that renders a component's HTML outside its normal DOM position |
| **Vite** | The build tool that powers the development server and production build |
