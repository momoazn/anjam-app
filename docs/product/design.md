# Anjam Design Philosophy: Modern Industrial Editorial

## Overview

The Anjam application features a **Modern Industrial Editorial** aesthetic that blends professional precision with contemporary UI patterns. The interface is designed as a high-precision professional instrument—combining the structural clarity of technical documentation with the refined polish of modern SaaS applications.

## Core Pillars

### 1. Technical Authority (Modern Industrial)

The interface projects reliability, precision, and structural integrity through contemporary design patterns.

- **Softened Geometry**: Components use a refined border radius system (`rounded-2xl` for containers, `rounded-xl` for interactives) with a base radius of `0.5rem` (8px), balancing technical precision with modern usability.
- **Blueprint Foundations**: High-level headers and sections utilize the `BlueprintPattern` component (grid, dots, lines, technical, cross) to provide structural depth and visual grounding, mimicking technical drafting paper.
- **Registry Layouts**: Lists and modules are designed as modern technical logs with clear zonal divisions for metadata, telemetry, and status signals using cards with `rounded-2xl` and subtle `shadow-sm`.
- **L-Frame Architecture**: The `LFrame` component provides consistent angular design and corner accents with three variants (`corners`, `border`, `full`) for structural depth.

### 2. Typographic Hierarchy (Editorial Refinement)

Typography is the primary driver of the interface's character, balancing bold weights with technical monospaced precision.

- **Bold Authority**: Leverage the `black` and `bold` weights of **Arad** (Variable Font, 100-900) for primary metrics, headers, and labels.
- **Monospaced Precision**: Use **Fira Code** for all technical metadata, including IDs, timestamps, Project Codes, IPs, and internal system serials.
- **RTL Foundation**: The interface uses `direction: rtl` with Persian digits (`@persian-tools/persian-tools`) for numeric data to maintain full RTL cultural immersion.
- **Technical Labeling**: Use uppercase, widely tracked (`tracking-tight`), and ultra-small font-size (`text-[9px]` to `text-xs`) text for secondary labels to create a sophisticated hierarchy.

### 3. High-Precision Color (OKLCH System)

The app utilizes the perceptually uniform OKLCH color space to ensure consistent, professional "Signal" colors across all themes.

- **Refined Neutral Bases**: Light theme uses `oklch(0.99 0.002 240)` for backgrounds, dark theme uses `oklch(0.12 0.01 240)` to provide a stable, modern foundation.
- **Technical Blue Primary**: Light theme uses `oklch(0.55 0.18 255)`, dark theme uses `oklch(0.65 0.15 255)` for active states, primary protocols, and critical system paths.
- **Signal Status Colors**: All statuses (Done, In Progress, Overdue) use a standardized palette that provides immediate behavioral feedback.
- **Border Opacity**: Consistent use of `border-border/40` for structural framing, creating a refined technical aesthetic.

### 4. Tactile Motion & Mechanical Feedback

Interactions are designed to feel responsive and polished using spring physics.

- **Physical Switches**: Buttons and interactive elements utilize `active:scale-[0.98]` and `active:translate-y-[1px]` to mimic mechanical feedback.
- **Spring Physics**: All transitions use a consistent spring-based timing (`cubic-bezier(0.16, 1, 0.3, 1)`) for a responsive, high-end feel.
- **Staggered Orchestration**: Orchestrate page loads using staggered CSS reveals (`data-animate-stagger`), creating a "system startup" readout sequence.
- **Micro-Telemetry**: Subtle details like hover states, scale transforms, and glow effects provide delight without introducing visual clutter.

### 5. Unified Command Frame (Modern Application Shell)

The application frame (Header and Sidebar) is a cohesive, integrated shell with modern patterns.

- **Consistent Height**: The Header uses `h-16` (64px) with `backdrop-blur-md` for a modern glass effect, while the Sidebar maintains proportional spacing.
- **Breadcrumb Console**: The Header functions as a navigation console with breadcrumbs, global search, and action buttons organized in clear zones.
- **Sidebar Architecture**: Uses collapsible navigation with `border-border/40` borders, organized into logical sections (Workspace, Projects, Task Views, Management, Admin).

## Component Design Patterns

### Border Radius System

- **rounded-2xl** (16px): Primary radius for containers (Cards, IconBoxes), dialogs, and tables
- **rounded-xl** (12px): Primary radius for interactive elements (Buttons, Inputs, L-Frames)
- **rounded-lg** (8px): Secondary interactive elements, menu items, toggles
- **rounded-md** (6px): Small elements like badges, checkboxes
- **rounded-full**: Circular elements like avatars, radio buttons

### Typography Scale

- **text-xs** (12px): Secondary labels, metadata, badges, menu items
- **text-sm** (14px): Body text, descriptions, standard UI elements
- **text-base** (16px): Larger body text, important content
- **text-lg** (18px): Section headers, important labels
- **text-xl** (20px): Page section headings
- **text-2xl** (24px): Page titles
- **text-3xl** (30px): Hero titles, major headings

### Font Weights

- **font-medium** (500): Body text, descriptions
- **font-semibold** (600): Section headers, important labels
- **font-bold** (700): Primary headings, buttons, emphasized text

### Color Tokens

#### Light Theme

- Background: `oklch(0.99 0.002 240)`
- Foreground: `oklch(0.15 0.01 240)`
- Primary: `oklch(0.55 0.18 255)`
- Muted: `oklch(0.97 0.005 240)`
- Border: `oklch(0.9 0.01 240)`

#### Sidebar (Light)

- Background: `oklch(0.98 0.002 240)`
- Foreground: `oklch(0.15 0.01 240)`
- Primary: `oklch(0.55 0.18 255)`
- Border: `oklch(0.92 0.01 240)`

#### Dark Theme

- Background: `oklch(0.12 0.01 240)`
- Foreground: `oklch(0.95 0.01 240)`
- Primary: `oklch(0.65 0.15 255)`
- Muted: `oklch(0.18 0.01 240)`
- Border: `oklch(0.25 0.01 240)`

#### Sidebar (Dark)

- Background: `oklch(0.14 0.01 240)`
- Foreground: `oklch(0.95 0.01 240)`
- Primary: `oklch(0.65 0.15 255)`
- Border: `oklch(0.22 0.01 240)`

#### Chart Colors

- Chart 1: `oklch(0.87 0.12 207)`
- Chart 2: `oklch(0.8 0.13 212)`
- Chart 3: `oklch(0.71 0.13 215)`
- Chart 4: `oklch(0.61 0.11 222)`
- Chart 5: `oklch(0.52 0.09 223)`

## Implementation Guidelines

### Component Usage

- **LFrame**: Use for containers that need structural depth or corner accents. Variants:
  - `corners`: Hover-only corner accents
  - `border`: Simple border frame
  - `full`: Always-visible corner accents

- **BlueprintPattern**: Use for background textures in headers and sections. Variants:
  - `grid`: Technical grid pattern
  - `dots`: Dot matrix pattern
  - `lines`: Diagonal line pattern
  - `technical`: Multi-scale grid
  - `cross`: Cross-hatch pattern

- **TechnicalHeader**: Use for section headers requiring a blueprint background context.

- **SpringCard & SpringButton**: Use for interactive elements to ensure consistent mechanical feedback with spring physics.

- **IconBox**: Use for icon containers with size variants (`xs`, `sm`, `md`, `lg`) and tone variants (`primary`, `primarySolid`, `muted`, `accent`, `custom`).

### Layout Patterns

- **Cards**: Use `rounded-2xl` with `shadow-sm` for content containers
- **Buttons**: Use `rounded-xl` with `active:scale-[0.98]` for tactile feedback
- **Inputs**: Use `rounded-xl` with `border-border/40` borders
- **Dialogs**: Use `rounded-2xl` for larger modal containers
- **Tables**: Use `rounded-2xl` with `shadow-sm` for data displays

### Animation Patterns

- **Page Transitions**: Apply `data-page-transition` to main page containers for fade-in effects
- **Staggered Lists**: Apply `data-animate-stagger` to list items for orchestrated entry
- **Spring Transitions**: Use `.spring-transition`, `.spring-transition-slow`, or `.spring-transition-fast` utilities
- **Interactive Elements**: Use `hover:scale-[1.02]` and `active:scale-[0.98]` for tactile feedback

### Utility Classes

- **Spring Physics**: `transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]`
- **Backdrop Blur**: `backdrop-blur-md` for glass effects
- **Border Opacity**: `border-border/40` for structural framing
- **Shadow System**: `shadow-sm` for subtle depth, `shadow-lg` for emphasis

### Industrial Utilities

- **.industrial-grid**: CSS background pattern for technical areas
- **.industrial-dots**: CSS radial background pattern
- **.text-vertical**: Vertical writing mode for side labels
- **.mask-fade-bottom / .mask-fade-top**: Gradient masks for scrollable areas

### RTL Considerations

- All layouts use `direction: rtl` by default
- Use `digitsEnToFa` from `@persian-tools/persian-tools` for numeric display
- Ensure proper spacing and alignment for RTL text flow
- Test all interactive elements in RTL context

---

_Anjam: Engineered. Unified. Authoritative._
