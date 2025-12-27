# Anjam Design Philosophy: Industrial Editorial

## Overview

The Anjam application has transitioned from a generic component-based UI to a distinctive **Industrial Editorial** aesthetic. This philosophy treats the task management interface not just as a software tool, but as a high-precision professional instrument—reminiscent of a technical manual, an architect's control center, or an industrial registry.

## Core Pillars

### 1. Technical Authority (Industrial Utilitarian)

The interface must project reliability, precision, and structural integrity.

- **Sharp Geometry**: Use ultra-low border radii (`0.125rem` / 2px) to create a "technical edge." Standard components use `rounded-none` or `rounded-sm` to maintain architectural sharpness.
- **Blueprint Foundations**: High-level headers utilize linear and radial grid patterns to provide structural depth and visual grounding, mimicking technical drafting paper.
- **Registry Layouts**: Lists and modules are designed as technical logs or industrial punch cards, with clear zonal divisions for metadata, telemetry, and status signals.

### 2. Typographic Hierarchy (Editorial Refinement)

Typography is the primary driver of the interface's character, balancing bold weights with technical monospaced precision.

- **Bold Authority**: Leverage the `black` and `bold` weights of **Vazirmatn** for primary metrics, headers, and "Command Console" labels.
- **Monospaced Precision**: Use **Fira Code** for all technical metadata, including IDs, timestamps, Project Codes, IPs, and internal system serials.
- **Localized Numbers**: Always use Persian digits (`@persian-tools/persian-tools`) for numeric data to maintain full RTL cultural immersion and professional stability.
- **Technical Labeling**: Use uppercase, widely tracked (`tracking-[0.3em]`), and small font-size (`text-[8px]` to `text-[10px]`) text for secondary "Protocol" labels to create a sophisticated, effortless hierarchy.

### 3. High-Precision Color (OKLCH System)

The app utilizes the perceptually uniform OKLCH color space to ensure consistent, professional "Signal" colors across all themes.

- **Obsidian & Steel Silver**: Use deep, stable neutral bases (`Obsidian` for dark, `Steel Silver` for light) to provide a high-end, stable background for technical data.
- **Technical Blue Primary**: A sharp, authoritative blue (`oklch(0.45 0.12 250)`) represents active states, primary protocols, and critical system paths.
- **Signal Status Colors**: All statuses (Done, In Progress, Overdue) use a standardized "Signal" palette that provides immediate behavioral feedback (e.g., Signal Red for overdue, Safety Orange for in-progress).

### 4. Tactile Motion & Mechanical Feedback

Interactions are designed to feel like operating physical precision hardware.

- **Physical Switches**: Buttons and navigation items utilize subtle scale transforms (`active:scale-95`) and sharp shadow transitions to mimic mechanical switch feedback.
- **Staggered Orchestration**: Orchestrate page loads using staggered CSS reveals (`data-animate-stagger`), creating a "system startup" readout sequence that feels intentional and high-end.
- **Micro-Telemetry**: Subtle details like rotating icons on hover, pulse animations for active status, and micro-sparklines provide delight without introducing visual clutter.

### 5. Unified Command Frame (The L-Frame)

The application frame (Header and Sidebar) is a singular, integrated instrument rather than separate floating elements.

- **Zero-Gap Architecture**: The Header and Sidebar share identical height parameters (`h-14`) and structural border treatments to create a continuous technical frame.
- **Telemetry Console**: The Header functions as a mission-critical telemetry bar, displaying real-time `System Time`, `Network Status`, and `Node IDs`.
- **Zonal Filtering**: Search and filter interfaces are redesigned as "Logic Gate" grids, packing high functionality into a dense, professional footprint.

## Implementation Guidelines

- **Scalability**: Every dimension, gap, and font size must use `rem` units to ensure the technical authority scales perfectly across all professional displays.
- **Hardened Surfaces**: Prefer `bg-muted/5` for structural backgrounds and `border-border/40` for technical framing to maintain a "drawn" rather than "painted" look.
- **Registry Standards**: Every list item must feature a dedicated metadata zone, a primary content zone, and an action bay that utilizes sharp, physical-style button protocols.

---

_Anjam: Engineered. Unified. Authoritative._
