/**
 * main.jsx — Application entry point
 *
 * This is the first file React executes. It finds the <div id="root"> element
 * in index.html and renders the entire application inside it.
 *
 * StrictMode is a React development helper — it intentionally renders components
 * twice in development to help catch bugs. It has no effect in production builds.
 *
 * You should never need to edit this file.
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";   // Global CSS reset and CSS variable definitions
import App from "./App.jsx";

// Find the root DOM element and mount the React app inside it
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
