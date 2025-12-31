# Linear UI/UX Transformation Prompt for Anjam Product Mode

This prompt is designed to guide an AI agent in transforming the **Product Mode** of the Anjam application to align with the principles of the Linear Design System, as detailed in [linear.md](../product/linear.md).

## Context

Anjam is a task management application with a "Dual-Mode" architecture (Operations vs. Product). The goal is to make the **Product Mode** feel like a high-performance "instrument" for developers and product teams, mimicking the tactile minimalism and keyboard-first workflow of Linear.

## Reference

- [linear.md](../product/linear.md): Deep Analysis of Linear Design System & Workflow Architecture.

## Instructions for the Agent

### 1. Visual Identity & Theming

Apply the "Tactile Minimalist" framework to all Product Mode components.

- **Color Palette:**
  - Background: `#0c0c0e`
  - Card/Surface Background: `#161618`
  - Border Color: `rgba(255, 255, 255, 0.08)`
  - Accent (Linear Blue): `#5e6ad2`
  - Use "Cool Greys" (Zinc/Slate) for text and secondary elements.
- **Layering & Elevation:**
  - Implement the Z-axis hierarchy: Canvas (Level 0), Surface (Level 1), Elevated (Level 2).
  - Use 1px borders with a "top-down" light source simulation (brighter top border).
  - Apply `backdrop-filter: blur(20px)` to modals and popovers (Glassmorphism).
- **Subtle Luminance:**
  - Use `box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05)` for beveled edges.
  - Add a 2px "halo" with a slight outer glow for active/selected elements.
- **Typography:**
  - Use "Sentence case" for micro-copy and labels.

### 2. UX & Interaction Design

Shift the mental model from "Database with UI" to "Software as an Instrument".

- **Keyboard-First Workflow:**
  - Integrate a Command Menu (`Cmd+K`) using `cmdk` or similar.
  - Bind every primary action (status change, assignment, navigation) to a keyboard shortcut.
  - Ensure fuzzy search and context awareness in the command menu.
- **Performance & Responsiveness:**
  - Implement **Optimistic UI** for all task updates (status, priority, assignment).
  - Use subtle motion: 150ms ease-out transitions. Avoid bouncy animations.
- **Batch Actions:**
  - Enable multi-select (Shift+Click) and batch editing for issues.

### 3. Workflow & Features

Align the Product Mode features with the "Linear Method".

- **Terminology:**
  - Rename "Tasks" to "Issues".
  - Rename "Reports" to "Insights".
  - Rename "Saved Filters" to "Views".
- **Inbox & Triage:**
  - Ensure the **Inbox** is the primary entry point.
  - Implement a **Triage** system for new issues (Accept, Decline, Snooze).
- **Feature Gating:**
  - Ensure operations-heavy features (Time Tracking, Audit Logs, Timesheets) are completely hidden in Product Mode.

### 4. Implementation Strategy

- Use the `currentOrgMode` from `auth-store.ts` to conditionally apply styles and logic.
- Update `src/lib/mode-features.ts` and `src/lib/mode-labels.ts` as the source of truth for mode-specific behavior.
- Modify Tailwind configurations or CSS variables to match the Linear palette when `mode === 'product'`.
