# Anjam Design Philosophy: Industrial Editorial

## Overview

The Anjam (انجام) application has transitioned from a generic component-based UI to a distinctive **Industrial Editorial** aesthetic. This philosophy treats the task management interface not just as a software tool, but as a high-precision professional instrument—reminiscent of a technical manual, an architect's control center, or an industrial registry.

## Core Pillars

### 1. Technical Authority (Industrial Utilitarian)

The interface must project reliability, precision, and structural integrity.

- **Sharp Geometry**: Use ultra-low border radii (`0.125rem` / 2px) to create a "technical edge."
- **Blueprint Foundations**: Utilize radial and linear grid patterns in high-level headers to provide structural depth and visual grounding.
- **Registry Layouts**: Lists and modules should resemble technical logs or industrial punch cards, with clear zonal divisions for metadata and status.

### 2. Typographic Hierarchy (Editorial Refinement)

Typography is the primary driver of the interface's character.

- **Bold Authority**: Leverage the `black` and `bold` weights of **Vazirmatn** for primary metrics and headlines.
- **Monospaced Precision**: Use **Fira Code** for all technical metadata, including IDs, timestamps, and project codes.
- **Localized Numbers**: Always use Persian digits (`@persian-tools/persian-tools`) for numeric data to maintain full RTL cultural immersion.
- **Micro-Labels**: Use uppercase, widely tracked (`tracking-[0.2em]`), and small font-size (`text-[10px]`) text for secondary labels to create an effortless hierarchy.

### 3. High-Precision Color (OKLCH System)

Move away from standard RGB/HEX palettes toward the perceptually uniform OKLCH space.

- **Carbon & Steel**: Use deep neutral bases (`Carbon` for dark, `Steel Silver` for light) instead of pure black/white.
- **Technical Primary**: A sharp, authoritative blue (`oklch(0.42 0.14 250)`) for active states and critical actions.
- **Signal Status Colors**: Statuses (Done, In Progress, Overdue) should use a "Signal" palette that is distinct and accessible, providing immediate behavioral feedback.

### 4. Tactile Motion & Feedback

Interactions should feel like operating physical hardware.

- **Physical Switches**: Buttons and navigation items should use subtle scale transforms (`active:scale-95`) and sharp shadow transitions to mimic mechanical feedback.
- **Staggered Reveals**: Use CSS animations (`data-animate-stagger`) to orchestrate page loads, creating a sophisticated "technical readout" sequence.
- **Micro-Interactions**: Small details like rotating icons on hover or micro-sparkline indicators add delight without clutter.

### 5. Controlled Density (Minimalist Precision)

Avoid "cluttered" industrialism. Maintain high information density while maximizing negative space.

- **Zonal Architecture**: Group related data into clear, bordered zones to reduce visual searching.
- **Secondary Masking**: De-emphasize secondary information through transparency (`opacity-40`) rather than removal, keeping technical context available but not distracting.
- **Consistent Guttering**: Use `scrollbar-gutter: stable` to ensure layout shifts are eliminated during navigation.

## Implementation Guidelines

- **Scalability**: Always use `rem` units for geometry, typography, and spacing to ensure responsive authority.
- **Accessibility**: Ensure every "industrial" element remains an interactive standard (buttons, roles, aria-labels).
- **Hardened Borders**: Prefer `border-border/50` for primary containment and `bg-muted/20` for structural backgrounds.

---

_Anjam: Engineered for Execution._
