# Modern Landing Page Design Plan

## 1. Aesthetic Direction: "Deep Violet Horizon"

- **Theme**: Dark-first (or high-contrast Light), matching `src/index.css`.
- **Core Colors**:
  - Primary: Deep Violet (oklch 0.21 0.006 285) - Brand Color
  - Accent: Soft Lavender glow effects.
  - Background: Clean, possibly with subtle noise/grain texture.
- **Vibe**: Sleek, trustworthy, fast, professional yet modern.
- **UI Trends**:
  - **Glassmorphism**: `backdrop-blur-md` on navbar and feature cards.
  - **Aurora Gradients**: Subtle animated blobs in the background (using Tailwind animation).
  - **Bento Grid**: Asymmetrical layout for feature highlights.
  - **Typography**: `Vazirmatn` for all Persian text.

## 2. ASCII Wireframe

```ascii
+-----------------------------------------------------------------------+
|  .-----------------------------------------------------------------.  |
|  | [Logo] انـجـام                                      [ورود  ->]  |  | <-- Floating Glass Nav
|  '-----------------------------------------------------------------'  |
|                                                                       |
|      (Subtle Violet Glow Background Animation)                        |
|                                                                       |
|               نظم ذهنی، قدرت اجرایی                                   | <-- H1 (Bold, tracking-tight)
|           (Mental Order, Executive Power)                             |
|                                                                       |
|       همه ابزارهای مدیریت پروژه در یک پلتفرم امن و سریع               | <-- Subtext (Muted foreground)
|                                                                       |
|            [  شروع کنید  ]    [  مشاهده دمو  ]                        | <-- Primary & Ghost Buttons
|                                                                       |
|    .-------------------------------------------------------------.    |
|    |  /   /   /   /   /   /   /   /   /   /   /   /   /   /   /  |    |
|    | /   (3D Tilted Perspective of Dashboard UI Placeholder)    /    |    | <-- Hero Visual
|    |/___/___/___/___/___/___/___/___/___/___/___/___/___/___/___/     |
|                                                                       |
+-----------------------------------------------------------------------+
|                                                                       |
|  Why Anjam? (Grid Layout)                                             |
|                                                                       |
|  +-----------------------+  +--------------------------------------+  |
|  |      مدیریت تسک       |  |             رهگیری زمان              |  |
|  | (Icon)                |  | (Icon)                               |  |
|  | Kanban & Lists        |  | Integrated Timesheets                |  |
|  +-----------------------+  +--------------------------------------+  |
|                                                                       |
|  +--------------------------------------+  +-----------------------+  |
|  |           گزارش‌های پیشرفته           |  |      امنیت داده       |  |
|  | (Icon)                               |  | (Icon)                |  |
|  | Analytics & Charts                   |  | Self-Hosted           |  |
|  +--------------------------------------+  +-----------------------+  |
|                                                                       |
+-----------------------------------------------------------------------+
|   © 2025 Anjam • Open Source                                          |
+-----------------------------------------------------------------------+
```

## 3. Implementation Steps

### Phase 1: Foundation

- [ ] **Create Design Doc**: Save this file to `docs/LANDING_PAGE_DESIGN.md`.
- [ ] **Create Component**: `src/pages/landing.tsx`.
  - Use `framer-motion` concepts (via CSS `animate-in` utilities already in `index.css`).
  - Implement `FloatingNav` component (local to landing page).
  - Implement `HeroSection` with CSS-only background glow.

### Phase 2: Content & Visuals

- [ ] **Copywriting**:
  - **H1**: "مدیریت پروژه‌ها، ساده و هوشمند" (Manage projects, simply and smartly)
  - **Sub**: "با انجام، کارهای تیمی را منظم‌تر پیش ببرید." (Move teamwork forward more organized with Anjam.)
  - **CTA**: "ورود به حساب کاربری" (Login to Account)
- [ ] **Icons**: Use `@tabler/icons-react` (already installed) for consistent stroke width.
- [ ] **Visuals**: CSS-based abstract representation of the dashboard (no external images required).

### Phase 3: Routing

- [ ] **Update `src/router.tsx`**:
  - Add `/landing` route.
  - Redirect root `/` to `/landing` if not authenticated (currently redirects to `/login`).
  - Ensure `/login` remains accessible.
