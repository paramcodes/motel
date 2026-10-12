# Airbnb Category Bar and Navigation Header Prototype Specification

## Executive Summary

This document establishes the UI architecture, component hierarchy, animation contracts, and interaction design for Motel's navigation header and horizontal category bar, resolving **Ticket 04** ([`04-airbnb-category-and-search-header-prototype.md`](../../.scratch/airbnb-clone/issues/04-airbnb-category-and-search-header-prototype.md)).

An interactive prototype evaluating three structurally distinct variations was constructed and validated under `prototype/index.html` (served via `bun run prototype` on branch `prototype/04-airbnb-category-and-search-header`).

---

## 1. Prototype Architecture & Switcher

The prototype implements a floating switcher mounted at the bottom center of the viewport that synchronizes with `?variant=A|B|C` via HTML5 History (`pushState`), supports arrow key navigation (`←` and `→`), and renders live query filter state:

```
+-----------------------------------------------------------------------------------+
|  [Logo: motel]         [Anywhere | Any week | Add guests (Search Orb)]    [Profile] |
+-----------------------------------------------------------------------------------+
|  [<]  🏖️ Beachfront   🪵 Cabins   🏙️ Cities   🌾 Countryside   ⛵ Lakefront  [>] [Filter]|
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [ Listing Cards Grid (photo, badge, title, distance, rating, price) ]            |
|                                                                                   |
+-----------------------------------------------------------------------------------+
|              [ ← ]  Variant A: Canonical Inline Expansion  [ → ]                   |
+-----------------------------------------------------------------------------------+
```

---

## 2. Variant Structural Analysis

### Variant A: Canonical Inline Header Expansion (Airbnb Desktop Standard)

- **Rest State**:
  - Compact 3-segment pill: `"Anywhere"` | `"Any week"` | `"Add guests"` + circular 32px Rausch Red (`#ff385c`) search button.
  - Sits in top header row ($h = 80\text{px}$), elevated by the 3-layer ambient rest shadow (`0 0 0 1px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.10)`).
- **Expanded Interaction**:
  - Clicking any segment expands the header container downwards to $168\text{px}$ using a Framer Motion `layout` transition with spring easing (`damping: 28, stiffness: 300`).
  - Top bar reveals category switchers: **Stays** vs **Experiences** with an animated underline indicator (`layoutId="activeTab"`).
  - Search pill morphs into an expanded 4-segment search bar (`Where`, `Check in`, `Check out`, `Who`).
  - Active segment receives elevated white pill background with diffuse float (`0 12px 28px rgba(0,0,0,0.15)`); inactive segments receive muted hover backgrounds (`#f2f2f2`).
  - An anchored popover card appears directly beneath the active segment:
    - `Where`: Region selector grid ("I'm flexible", Europe, United States, Japan, Southeast Asia, Caribbean).
    - `Check in` / `Check out`: Dual-month calendar picker with range highlighting.
    - `Who`: Stepper controls (+/–) for Adults, Children, Infants, Pets.
  - Search CTA expands to a pill button displaying `"Search"` text alongside the magnifying glass.
  - A semi-transparent backdrop (`rgba(0,0,0,0.25)`) covers the document body. Clicking outside collapses the header.
- **Evaluation**: Authentic Airbnb desktop visual identity. High affordance and fluid transition. Requires careful overflow management to prevent Cumulative Layout Shift (CLS).

---

### Variant B: Overlay Dialog / Modal Flow (Adaptive & Mobile First)

- **Rest State**:
  - Compact full-width search card spanning the center container:
    - Search orb icon on left.
    - Two-line summary: `"Where to?"` (bold 12px Near Black) over `"Anywhere · Any week · Add guests"` (12px Secondary Gray).
    - Filter icon button on the right.
- **Expanded Interaction**:
  - Clicking does **not** expand the header inline. Instead, it triggers a centered Radix UI `Dialog` modal (`role="dialog"`, `aria-modal="true"`) with backdrop blur (`backdrop-blur-sm bg-black/50`).
  - Inside the dialog, search segments are organized as a progressive 3-step vertical card accordion:
    - **Step 1: Where to?** (Input field + popular destination region tiles).
    - **Step 2: When is your stay?** (Date range calendar selection).
    - **Step 3: Who's coming?** (Guest count steppers).
  - Modal footer includes `"Clear all"` text button and primary `"Search listings"` CTA.
- **Evaluation**: Zero header layout shift (zero CLS). Completely self-contained focus trapping and accessibility. Best suited for viewports $< 768\text{px}$ where desktop expanded header elements clip or collide with mobile viewport edges.

---

### Variant C: Detached Floating Island Dock with Segment Popovers (Zero-CLS Minimalist Dock)

- **Rest State**:
  - Ultra-minimal top navigation bar ($h = 64\text{px}$) with logo and host menu.
  - Independent search dock floats as an island below the header with `sticky top-4`.
- **Expanded Interaction**:
  - Header height **never** changes.
  - Clicking `"Where"`, `"Dates"`, or `"Guests"` opens an independent anchored Radix `Popover` directly below that specific segment.
  - No backdrop scrim is applied; users can interact with listings while popovers are open.
  - Includes a bottom floating pill toggle for `"Show map"`.
- **Evaluation**: Maximum performance and zero layout shift. However, lacks the cohesive "immersive planning" canvas feel that characterizes Airbnb's signature desktop browsing experience.

---

## 3. Category Bar Navigation Specifications

### 3.1 Scrolling Mechanics & Edge Masks

1. **Horizontal Scroll Container**:
   - Flex row with `overflow-x: auto`, `scrollbar-width: none` (`-webkit-overflow-scrolling: touch`).
   - Smooth programmatic scrolling via `scrollBy({ left: ±280, behavior: 'smooth' })`.
2. **Dynamic Chevron Controls**:
   - Circular 32px controls (`rounded-full bg-white border border-hairline shadow-sm hover:scale-105`).
   - Left chevron is conditionally mounted when `scrollLeft > 10`.
   - Right chevron is conditionally mounted when `scrollLeft < scrollWidth - clientWidth - 10`.
3. **Gradient Edge Masks**:
   - Left gradient: `linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)` spanning 64px.
   - Right gradient: `linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)` spanning 64px.
   - Prevents hard clipping of category icons at the viewport boundary.

### 3.2 Category Selection Indicator

- **Desktop (Variant A)**: 2px Near Black (`#222222`) underline indicator mounted at the bottom of the active category button, animated via Framer Motion `layoutId="categoryUnderline"`.
- **Mobile / High Contrast (Variant B)**: Filled dark pill chip (`bg-neutral-900 text-white rounded-full px-4 py-2`), providing high touch target contrast and unambiguous active state.

---

## 4. Technical Tradeoff Matrix

| Metric | Variant A (Inline Expansion) | Variant B (Overlay Dialog) | Variant C (Segment Popovers) |
| :--- | :--- | :--- | :--- |
| **Airbnb Authenticity** | **Highest (10/10)** | Medium (7/10) | Low-Medium (6/10) |
| **Cumulative Layout Shift (CLS)** | Needs absolute wrapper ($0.00$) | **Zero ($0.00$)** | **Zero ($0.00$)** |
| **Mobile Ergononics ($<768\text{px}$)** | Poor (clips small screens) | **Superior (10/10)** | Fair (6/10) |
| **Framer Motion Complexity** | High (`layout`, springs) | Low (dialog entry/exit) | Very Low (popover transitions) |
| **Keyboard & A11y Trapping** | Custom ESC & click-outside | **Radix Dialog Headless** | Radix Popover Headless |
| **Screen Real Estate Efficiency** | High at rest ($80\text{px}$) | Very High ($64\text{px}$) | Medium ($100\text{px}$) |

---

## 5. Architectural Recommendation & Decision

### Responsive Hybrid Architecture

The production implementation in `apps/web` will adopt a **responsive hybrid pattern**:

1. **Desktop Viewports ($\ge 768\text{px}$)**:
   - Implement **Variant A** (Canonical Inline Header Expansion).
   - Use Framer Motion layout transitions for the morphing search pill.
   - Mount search popovers with Radix UI headless positioning (`@floating-ui/react` or Radix `Popover.Content`).
   - Underline active category indicator with `layoutId="categoryUnderline"`.
2. **Mobile & Tablet Viewports ($< 768\text{px}$)**:
   - Implement **Variant B** (Radix `Dialog` Modal Flow).
   - Compact full-width pill triggers full-screen step-by-step accordion sheet.
   - Prevents virtual keyboard occlusion and small-screen horizontal clipping.
3. **Shared State Store**:
   - Centralize search state (`destination`, `checkIn`, `checkOut`, `guests`, `category`) in URL search params (e.g., `?category=beachfront&destination=Japan&checkIn=2026-11-12...`) synchronized via a custom hook `useSearchFilters()` so both desktop and mobile variants share identical reactivity without redundant state logic.
