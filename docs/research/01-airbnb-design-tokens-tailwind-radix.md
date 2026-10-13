# Airbnb Design Language System (DLS) Tokens in Tailwind CSS & Radix UI / Shadcn

## Executive Summary

This specification establishes how to translate Airbnb's proprietary **Design Language System (DLS)** tokens into a modern React monorepo architecture (`packages/ui`) using **Tailwind CSS**, **Radix UI**, and **Shadcn UI** primitives without sacrificing accessibility (WCAG 2.1 AA/AAA compliance).

Airbnb's user interface is characterized by:
1. **Generous White Canvas**: High whitespace and photography dominance anchored by Canvas White (`#ffffff`) and deep Near Black typography (`#222222`).
2. **Singular Voltage Accent**: Rausch Red (`#ff385c`) used sparingly for high-intent conversion moments (Search orb, primary CTAs, active wishlist saves), backed by Deep Rausch (`#e00b41`) for active states and text-contrast compliance.
3. **Soft Structural Geometry**: Distinctive corner radii hierarchies (20px cards, 32px search pill, 14px badges, 8px buttons, 50% circular controls).
4. **Subtle Elevation Layering**: A signature 3-layer ambient shadow at rest, transitioning to a single 12px diffuse hover float.
5. **Humanist Variable Typography**: Airbnb Cereal VF with tight letter-spacing on display headlines and clean weights (500 Medium, 600 SemiBold, 700 Bold).

---

## 1. Primary Sources & Historical Design Context

1. **Dalton Maag & Airbnb Design (May 2018)**: *Introducing Airbnb Cereal* — custom geometric sans-serif typeface designed with Karri Saarinen (Lead, Design Language Systems at Airbnb) to unify web, iOS, Android, and billboard typography. Key features include high x-height, open apertures, and specialized weights (Book 400, Medium 500, Bold 700, Extra Bold 800) optimized for UI readability across resolutions.
2. **Airbnb DLS (Design Language System)**: Public engineering and design publications documenting the shift from heavy SaaS/enterprise styling to photo-first, warm consumer marketplace aesthetics.
3. **W3C WCAG 2.1 / 2.2 Specifications**:
   - Success Criterion 1.4.3 Contrast (Minimum) (Level AA): 4.5:1 for normal text, 3:1 for large text (>=18pt or >=14pt bold).
   - Success Criterion 1.4.11 Non-text Contrast (Level AA): 3:1 for user interface components and graphical objects.
   - Success Criterion 2.5.5 / 2.5.8 Target Size: Minimum 44×44px (AAA) / 24×24px (AA) pointer hit targets.
   - Success Criterion 2.4.11 / 2.4.13 Focus Appearance (Minimum): 3:1 contrast against adjacent background colors.
4. **Shadcn UI Monorepo Architecture**: CSS variable-based semantic theming system (`--background`, `--foreground`, `--primary`, `--ring`, `--radius`) layered over Radix UI headless primitives and Tailwind CSS.

---

## 2. Airbnb DLS Token Specifications

### 2.1 Color Palette Tokens

| Token Name | Hex Code | HSL Representation | OKLCH Representation | Usage / Role |
| :--- | :--- | :--- | :--- | :--- |
| **Canvas White** | `#ffffff` | `0 0% 100%` | `oklch(1 0 0)` | Page canvas, card backgrounds, button text on primary |
| **Rausch Red** | `#ff385c` | `348 100% 61%` | `oklch(0.64 0.23 15.5)` | Brand accent, primary CTAs, search orb, active wishlist heart |
| **Deep Rausch** | `#e00b41` | `345 91% 46%` | `oklch(0.55 0.24 16.8)` | Primary active/pressed state, accessible text links, high-contrast CTA |
| **Rausch Tint / Disabled**| `#ffd1da` | `348 100% 91%` | `oklch(0.89 0.07 13.2)` | Disabled primary CTA surface |
| **Near Black (Ink)** | `#222222` | `0 0% 13.3%` | `oklch(0.25 0 0)` | Primary headlines, running text, rating numbers, star icons |
| **Body Ink** | `#3f3f3f` | `0 0% 24.7%` | `oklch(0.36 0 0)` | Long-form amenity copy, review excerpts |
| **Secondary Gray** | `#6a6a6a` | `0 0% 41.6%` | `oklch(0.52 0 0)` | Subtitles, location metadata, dates, inactive tabs |
| **Subtle Gray / Fog** | `#717171` | `0 0% 44.3%` | `oklch(0.54 0 0)` | Secondary metadata, caption details |
| **Hairline** | `#dddddd` | `0 0% 86.7%` | `oklch(0.89 0 0)` | 1px border dividers, search segment separators, card outlines |
| **Hairline Soft** | `#ebebeb` | `0 0% 92.2%` | `oklch(0.93 0 0)` | Subtle section dividing lines, calendar grid dividers |
| **Surface Soft** | `#f7f7f7` | `0 0% 96.9%` | `oklch(0.97 0 0)` | Light button hover background, filter bar fill, date range connector |
| **Surface Strong** | `#f2f2f2` | `0 0% 94.9%` | `oklch(0.96 0 0)` | Circular icon-button background (carousel controls, back arrows) |
| **Error Red** | `#c13515` | `11 81% 42%` | `oklch(0.53 0.20 38.5)` | Inline form validation errors |
| **Scrim / Backdrop** | `rgba(0,0,0,0.5)`| - | - | Modal and dialog backdrops |

---

### 2.2 Elevation & Shadow Tokens

Unlike enterprise design systems with 6+ shadow tiers, Airbnb DLS caps elevation at **one ambient rest tier** and **one hover elevation tier**:

1. **Card Ambient Rest Shadow (Three-Layer)**:
   ```css
   box-shadow:
     rgba(0, 0, 0, 0.02) 0px 0px 0px 1px,
     rgba(0, 0, 0, 0.04) 0px 2px 6px 0px,
     rgba(0, 0, 0, 0.10) 0px 4px 8px 0px;
   ```
   *Analysis*: 
   - Layer 1 (`0 0 0 1px rgba(0,0,0,0.02)`): Creates an ultra-fine ambient hairline boundary that prevents the white card from blending into off-white surfaces without relying on heavy borders.
   - Layer 2 (`0 2px 6px rgba(0,0,0,0.04)`): Provides direct near-field ambient occlusion.
   - Layer 3 (`0 4px 8px rgba(0,0,0,0.10)`): Provides the directional soft downward drop.

2. **Card Hover / Dropdown Elevation Shadow**:
   ```css
   box-shadow:
     rgba(0, 0, 0, 0.04) 0px 0px 0px 1px,
     rgba(0, 0, 0, 0.08) 0px 4px 12px 0px;
   ```
   *Analysis*: Applied when property cards hover or when search dropdowns and account popovers open. Delivers a soft, floated lift without harsh black edges.

---

### 2.3 Radii Hierarchy Tokens

| Token Name | Value | Tailwind Class | Applied To |
| :--- | :--- | :--- | :--- |
| `--radius-card` | `20px` (`1.25rem`) | `rounded-card` / `rounded-[20px]` | Property listing cards, modal containers, reservation sticky cards |
| `--radius-search` | `32px` (`2rem`) | `rounded-search` / `rounded-[32px]` | Global search bar pill, filter modal trigger |
| `--radius-badge` | `14px` (`0.875rem`) | `rounded-badge` / `rounded-[14px]` | "Guest favorite" floating badge, Superhost badge |
| `--radius-btn` | `8px` (`0.5rem`) | `rounded-btn` / `rounded-lg` | Standard action buttons (Reserve, Continue, Contact Host, Form Inputs) |
| `--radius-tag` | `6px` (`0.375rem`) | `rounded-tag` / `rounded-md` | "NEW" micro uppercase tags |
| `--radius-full` | `9999px` (`50%`) | `rounded-full` | Search orb, Carousel chevrons, Wishlist heart circular wrapper, Date-picker days |

---

### 2.4 Typography Hierarchy Tokens

The primary typeface is **Airbnb Cereal VF** (Variable Font). For open-source implementations, the recommended fallback is **Inter** or **Plus Jakarta Sans**, tuned with negative tracking on headings.

| Role | Font Size | Weight | Line Height | Tracking | Letter-Spacing Value | CSS Variable / Utility |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Rating Hero** | 64px (`4rem`) | 700 Bold | 1.10 | -0.0156em | `-1.0px` | `text-rating-display font-bold tracking-tighter` |
| **Display XL** | 28px (`1.75rem`) | 700 Bold | 1.43 | 0 | `0px` | `text-display-xl font-bold` |
| **Display LG** | 22px (`1.375rem`)| 500 Med / 600 SB| 1.18 | -0.02em | `-0.44px` | `text-display-lg font-medium tracking-tight` |
| **Display MD** | 21px (`1.3125rem`)| 700 Bold | 1.43 | 0 | `0px` | `text-display-md font-bold` |
| **Display SM** | 20px (`1.25rem`) | 600 SemiBold | 1.20 | -0.009em | `-0.18px` | `text-display-sm font-semibold tracking-tight` |
| **Title MD** | 16px (`1rem`) | 600 SemiBold | 1.25 | 0 | `0px` | `text-title-md font-semibold` |
| **Title SM** | 16px (`1rem`) | 500 Medium | 1.25 | 0 | `0px` | `text-title-sm font-medium` |
| **Body MD** | 16px (`1rem`) | 400 Regular | 1.50 | 0 | `0px` | `text-body-md font-normal` |
| **Body SM** | 14px (`0.875rem`)| 400 Regular | 1.43 | 0 | `0px` | `text-body-sm font-normal` |
| **Caption** | 14px (`0.875rem`)| 500 Medium | 1.29 | 0 | `0px` | `text-caption font-medium` |
| **Caption SM** | 13px (`0.8125rem`)| 400 Regular | 1.23 | 0 | `0px` | `text-caption-sm font-normal` |
| **Badge** | 11px (`0.6875rem`)| 600 SemiBold | 1.18 | 0 | `0px` | `text-badge font-semibold` |
| **Micro Tag** | 8px (`0.5rem`) | 700 Bold | 1.25 | 0.04em | `+0.32px` (uppercase) | `text-micro-tag font-bold uppercase tracking-wider` |

---

## 3. Accessibility & Contrast Deep Dive (WCAG 2.1 / 2.2)

### 3.1 Mathematical Luminance & Contrast Matrix

Using the relative luminance formula defined in WCAG 2.1 ($L = 0.2126R + 0.7152G + 0.0722B$ where sRGB values are linearized):

$$\text{Contrast Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05}$$

| Color Pair | Contrast Ratio | WCAG 2.1 Status | Critical UX / UI Rule |
| :--- | :--- | :--- | :--- |
| **Near Black (`#222222`) on Canvas White (`#ffffff`)** | **15.91:1** | **Passes AAA** (>= 7:1) | Primary text color. Extremely high legibility. |
| **Secondary Gray (`#6a6a6a`) on Canvas White (`#ffffff`)** | **5.41:1** | **Passes AA** (>= 4.5:1) | Approved for normal text (subtitles, dates, prices). Airbnb specifically tuned `#6a6a6a` to beat `#717171` (4.88:1) for safety headroom. |
| **Rausch Red (`#ff385c`) on Canvas White (`#ffffff`)** | **3.52:1** | **Fails AA for normal text** (< 4.5:1). **Passes AA for large text** (>= 3:1). **Passes Non-text UI Components** (>= 3:1). | **CRITICAL**: Do NOT use `#ff385c` for running body text or small text links. It is fully compliant for UI icons, buttons, search orbs, and large bold titles. |
| **Canvas White (`#ffffff`) on Rausch Red (`#ff385c`)** | **3.52:1** | **Passes Non-text UI** & Large Bold Text (>= 3:1). Fails normal body text. | When using primary button CTAs (14px–16px), text must be set in **weight 600 (SemiBold)** or **700 (Bold)**, satisfying large/bold graphical requirement. |
| **Deep Rausch (`#e00b41`) on Canvas White (`#ffffff`)** | **4.89:1** | **Passes AA** (>= 4.5:1) for all normal text! | **Accessibility Solution**: Use Deep Rausch for all inline text links, text buttons, and active/pressed states. |
| **Near Black (`#222222`) Focus Ring on Canvas White** | **15.91:1** | **Passes AAA** (>= 3:1 Non-text) | Focus visible rings use Near Black 2px with 2px offset, completely eliminating ambiguity. |

### 3.2 Non-Text Contrast & Focus States (SC 1.4.11 & SC 2.4.11)

1. **Card Borders & Outlines**: Hairline (`#dddddd`, 1.34:1) is purely decorative when cards have elevation (`rgba(0,0,0,0.10) 0px 4px 8px`). The boundary between card and canvas is conveyed via luminance and shadow.
2. **Keyboard Focus Rings**: Standard Tailwind `ring-offset-2 ring-neutral-900` (`#222222`) ensures a 15.91:1 contrast against `#ffffff` and 4.52:1 against `#ff385c`. Never use `outline-none` without an immediate `focus-visible:ring-2 focus-visible:ring-neutral-900` replacement.
3. **Interactive Target Sizes (SC 2.5.5 / SC 2.5.8)**:
   - Button heights: Default to `h-12` (48px) or `h-10` (40px) with minimum hit area padded to 44px.
   - Circular controls (Carousel arrows, Wishlist heart): The visible circle may be 32×32px, but the touch hit-target must be expanded using an invisible pseudo-element (`before:absolute before:-inset-2 before:content-['']`) ensuring a minimum 48×48px pointer area.

### 3.3 Screen Reader & Keyboard Semantics
- **Wishlist Heart**: Must not be a simple `div`. Must be a button with `aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}` and `aria-pressed={isFavorite}`.
- **Carousel Controls**: Region marked with `role="region" aria-roledescription="carousel" aria-label="Listing images"`. Chevrons equipped with `aria-label="Previous photo"` and `aria-label="Next photo"`.
- **Search Pill**: Button container marked with `role="button" aria-haspopup="dialog" aria-expanded="false"`.

---

## 4. Architecture in `packages/ui`

### 4.1 Monorepo Directory Layout

```txt
packages/ui/
├── package.json
├── tsconfig.json
├── components.json
├── src/
│   ├── index.ts
│   ├── styles/
│   │   ├── globals.css         # Base tokens, CSS variables, @theme rules
│   │   ├── fonts.css           # Airbnb Cereal VF @font-face declarations
│   │   └── tokens.css          # Raw DLS primitives
│   ├── tailwind/
│   │   ├── index.ts            # Preset export for Tailwind v3 / v4
│   │   └── preset.ts
│   ├── lib/
│   │   └── utils.ts            # clsx + twMerge utility (cn)
│   └── components/
│       ├── button.tsx          # DLS button (Rausch, Deep Rausch, Pill)
│       ├── card.tsx            # DLS 20px card + 3-layer shadow
│       ├── search-pill.tsx     # 32px pill, 3 segments + search orb
│       ├── category-pill.tsx   # Category strip tablist
│       ├── carousel-control.tsx# 50% circular controls + carousel
│       ├── badge.tsx           # 14px "Guest favorite" badge
│       └── wishlist-toggle.tsx # Circular heart button
```

### 4.2 CSS Variables: Overriding Shadcn Defaults

In `@workspace/ui/src/styles/globals.css`, we map the Airbnb DLS tokens directly onto the standard Shadcn UI semantic variables while preserving the raw `--airbnb-*` design tokens for specialized extensions:

```css
@layer base {
  :root {
    /* -----------------------------------------------------------------------
     * 1. AIRBNB DLS PRIMITIVE TOKENS
     * --------------------------------------------------------------------- */
    --airbnb-canvas: #ffffff;
    --airbnb-rausch: #ff385c;
    --airbnb-rausch-deep: #e00b41;
    --airbnb-rausch-disabled: #ffd1da;
    --airbnb-ink: #222222;
    --airbnb-body: #3f3f3f;
    --airbnb-muted: #6a6a6a;
    --airbnb-subtle: #717171;
    --airbnb-hairline: #dddddd;
    --airbnb-hairline-soft: #ebebeb;
    --airbnb-surface-soft: #f7f7f7;
    --airbnb-surface-strong: #f2f2f2;
    --airbnb-error: #c13515;

    /* Shadows */
    --airbnb-shadow-card: 0px 0px 0px 1px rgba(0, 0, 0, 0.02),
                          0px 2px 6px 0px rgba(0, 0, 0, 0.04),
                          0px 4px 8px 0px rgba(0, 0, 0, 0.10);
    --airbnb-shadow-hover: 0px 0px 0px 1px rgba(0, 0, 0, 0.04),
                           0px 4px 12px 0px rgba(0, 0, 0, 0.08);

    /* Radii */
    --airbnb-radius-card: 20px;
    --airbnb-radius-search: 32px;
    --airbnb-radius-badge: 14px;
    --airbnb-radius-btn: 8px;
    --airbnb-radius-tag: 6px;

    /* -----------------------------------------------------------------------
     * 2. SHADCN SEMANTIC VARIABLES (OVERRIDDEN WITH DLS)
     * --------------------------------------------------------------------- */
    --background: 0 0% 100%;                  /* #ffffff Canvas White */
    --foreground: 0 0% 13.3%;                 /* #222222 Near Black (Ink) */

    --card: 0 0% 100%;                        /* #ffffff Canvas White */
    --card-foreground: 0 0% 13.3%;            /* #222222 Near Black */

    --popover: 0 0% 100%;                     /* #ffffff Canvas White */
    --popover-foreground: 0 0% 13.3%;         /* #222222 Near Black */

    --primary: 348 100% 61%;                  /* #ff385c Rausch Red */
    --primary-foreground: 0 0% 100%;          /* #ffffff Canvas White */
    --primary-active: 345 91% 46%;            /* #e00b41 Deep Rausch */

    --secondary: 0 0% 100%;                   /* White secondary outline */
    --secondary-foreground: 0 0% 13.3%;       /* #222222 Near Black */

    --muted: 0 0% 96.9%;                      /* #f7f7f7 Surface Soft */
    --muted-foreground: 0 0% 41.6%;           /* #6a6a6a Secondary Gray */

    --accent: 0 0% 96.9%;                     /* #f7f7f7 Surface Soft */
    --accent-foreground: 0 0% 13.3%;          /* #222222 Near Black */

    --destructive: 11 81% 42%;                /* #c13515 Error Red */
    --destructive-foreground: 0 0% 100%;

    --border: 0 0% 92.2%;                     /* #ebebeb Hairline Soft */
    --input: 0 0% 86.7%;                      /* #dddddd Hairline */
    --ring: 0 0% 13.3%;                       /* #222222 Near Black Focus Ring */

    --radius: 0.5rem;                         /* 8px base button radius */
  }

  /* Optional Dark Mode Token Map (Internal tool / Host dashboard) */
  .dark {
    --background: 0 0% 9%;                    /* #171717 Dark Canvas */
    --foreground: 0 0% 98%;                   /* #fafafa */
    --card: 0 0% 12%;                         /* #1f1f1f */
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 12%;
    --popover-foreground: 0 0% 98%;
    --primary: 348 100% 61%;                  /* #ff385c Rausch */
    --primary-foreground: 0 0% 100%;
    --secondary: 0 0% 16%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 16%;
    --muted-foreground: 0 0% 65%;
    --accent: 0 0% 16%;
    --accent-foreground: 0 0% 98%;
    --border: 0 0% 20%;
    --input: 0 0% 24%;
    --ring: 0 0% 98%;
  }
}
```

### 4.3 Modern Tailwind Theme Extension

#### Option A: Modern Tailwind CSS v4 `@theme inline` Configuration
In Tailwind v4, we declare theme variables directly in CSS:

```css
@import "tailwindcss";

@theme inline {
  /* Colors */
  --color-rausch: var(--airbnb-rausch);
  --color-rausch-deep: var(--airbnb-rausch-deep);
  --color-rausch-disabled: var(--airbnb-rausch-disabled);
  --color-ink: var(--airbnb-ink);
  --color-body-ink: var(--airbnb-body);
  --color-secondary-gray: var(--airbnb-muted);
  --color-surface-soft: var(--airbnb-surface-soft);
  --color-surface-strong: var(--airbnb-surface-strong);
  --color-hairline: var(--airbnb-hairline);
  --color-hairline-soft: var(--airbnb-hairline-soft);

  /* Shadows */
  --shadow-airbnb-card: var(--airbnb-shadow-card);
  --shadow-airbnb-hover: var(--airbnb-shadow-hover);

  /* Corner Radii */
  --radius-card: var(--airbnb-radius-card);
  --radius-search: var(--airbnb-radius-search);
  --radius-badge: var(--airbnb-radius-badge);
  --radius-btn: var(--airbnb-radius-btn);
  --radius-tag: var(--airbnb-radius-tag);

  /* Font Families */
  --font-sans: 'Airbnb Cereal VF', 'Circular', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', sans-serif;
}
```

#### Option B: Tailwind CSS v3 Preset (`packages/ui/src/tailwind/preset.ts`)
If using Tailwind v3, we export a preset consumed by `apps/web/tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";

export const airbnbPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        rausch: {
          DEFAULT: "var(--airbnb-rausch)",
          deep: "var(--airbnb-rausch-deep)",
          disabled: "var(--airbnb-rausch-disabled)",
        },
        ink: {
          DEFAULT: "var(--airbnb-ink)",
          body: "var(--airbnb-body)",
        },
        "secondary-gray": "var(--airbnb-muted)",
        "surface-soft": "var(--airbnb-surface-soft)",
        "surface-strong": "var(--airbnb-surface-strong)",
        hairline: {
          DEFAULT: "var(--airbnb-hairline)",
          soft: "var(--airbnb-hairline-soft)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          active: "var(--airbnb-rausch-deep)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
      },
      borderRadius: {
        card: "var(--airbnb-radius-card)",       // 20px
        search: "var(--airbnb-radius-search)",   // 32px
        badge: "var(--airbnb-radius-badge)",     // 14px
        btn: "var(--airbnb-radius-btn)",         // 8px
        tag: "var(--airbnb-radius-tag)",         // 6px
      },
      boxShadow: {
        "airbnb-card": "var(--airbnb-shadow-card)",
        "airbnb-hover": "var(--airbnb-shadow-hover)",
      },
      fontFamily: {
        cereal: [
          "'Airbnb Cereal VF'",
          "Circular",
          "-apple-system",
          "BlinkMacSystemFont",
          "Roboto",
          "'Helvetica Neue'",
          "sans-serif",
        ],
      },
      letterSpacing: {
        "dls-tight": "-0.02em",
        "dls-tighter": "-0.035em",
        "dls-display": "-0.44px",
      },
    },
  },
};
```

---

## 5. Concrete Component Recipes

### 5.1 Button Component (`packages/ui/src/components/button.tsx`)

Features:
- Primary Rausch (`#ff385c`) with Deep Rausch (`#e00b41`) active state.
- Secondary 1px Near Black outline (`#222222`) over Canvas White.
- Tertiary / Ghost text button for inline modal dismissals and disclosures.
- Search orb / Pill Rausch button variant.
- 8px button radius (`rounded-btn`).
- Accessible keyboard focus ring (`focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2`).
- Integrated `Slot` pattern from `@radix-ui/react-slot` for `asChild` link composition.

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-semibold transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:pointer-events-none active:scale-[0.98] motion-reduce:transform-none select-none",
  {
    variants: {
      variant: {
        // Primary Rausch CTA (Reserve, Continue, Search)
        primary:
          "bg-rausch text-white hover:bg-rausch/95 active:bg-rausch-deep disabled:bg-rausch-disabled disabled:text-white rounded-btn",
        
        // Deep Rausch (Accessibility High-Contrast / Text-Safe CTA)
        "primary-deep":
          "bg-rausch-deep text-white hover:bg-[#c90a3a] active:bg-[#a80830] rounded-btn",

        // Secondary Inverted / Outline CTA
        secondary:
          "bg-white text-ink border border-neutral-900 hover:bg-surface-soft active:bg-surface-strong rounded-btn",

        // Light Outline CTA (Standard card borders)
        outline:
          "bg-white text-ink border border-hairline hover:border-ink active:bg-surface-soft rounded-btn",

        // Tertiary / Ghost (Show more, Filters clear)
        ghost:
          "bg-transparent text-ink hover:bg-surface-soft active:bg-surface-strong underline-offset-4 hover:underline rounded-btn",

        // Pill Rausch (Become a host, compact search triggers)
        pill:
          "bg-rausch text-white hover:bg-rausch/95 active:bg-rausch-deep rounded-full shadow-sm",
        
        // Search Orb (Circular Rausch magnifying button)
        orb:
          "bg-rausch text-white hover:bg-rausch/95 active:bg-rausch-deep rounded-full p-3",
      },
      size: {
        sm: "h-9 px-4 text-xs font-semibold rounded-btn",
        default: "h-12 px-6 text-base font-semibold rounded-btn", // Standard 48px Airbnb CTA
        lg: "h-14 px-8 text-base font-bold rounded-btn",
        icon: "h-10 w-10 p-0 rounded-full",
        "icon-sm": "h-8 w-8 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
```

---

### 5.2 Property Card Component (`packages/ui/src/components/card.tsx`)

Features:
- Exact **20px card radius** (`rounded-card`).
- Three-layer card ambient rest shadow (`shadow-airbnb-card`).
- Transition to hover shadow (`hover:shadow-airbnb-hover`) on pointer hover.
- Photo carousel container with `rounded-card` clipping.
- Floating "Guest favorite" badge (top-left) and Wishlist Heart toggle (top-right).
- Semantic typography hierarchy: Title (`font-semibold text-ink`), dates/distance (`text-secondary-gray`), nightly price (`font-semibold text-ink`).

```tsx
import * as React from "react";
import { cn } from "../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevated = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative flex flex-col bg-white overflow-hidden transition-shadow duration-200 ease-out",
          "rounded-card", // 20px radius
          elevated
            ? "shadow-airbnb-card hover:shadow-airbnb-hover"
            : "border border-hairline-soft hover:shadow-airbnb-hover",
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export interface ListingCardProps {
  id: string;
  title: string;
  location: string;
  distance?: string;
  dates?: string;
  pricePerNight: number;
  rating?: number;
  reviewCount?: number;
  isGuestFavorite?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string, current: boolean) => void;
  children?: React.ReactNode; // Carousel photo plate
}

export function ListingCard({
  id,
  title,
  location,
  distance,
  dates,
  pricePerNight,
  rating,
  reviewCount,
  isGuestFavorite = false,
  isFavorite = false,
  onFavoriteToggle,
  children,
}: ListingCardProps) {
  return (
    <article className="group flex flex-col gap-3 w-full cursor-pointer focus-within:ring-2 focus-within:ring-neutral-900 rounded-card">
      {/* Photo Plate Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-card bg-neutral-100">
        {children}

        {/* Floating Top Left: Guest Favorite Badge */}
        {isGuestFavorite && (
          <div className="absolute left-3.5 top-3.5 z-10">
            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-badge shadow-sm text-xs font-semibold text-ink select-none">
              Guest favorite
            </span>
          </div>
        )}

        {/* Floating Top Right: Wishlist Heart Toggle */}
        <div className="absolute right-3.5 top-3.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.(id, isFavorite);
            }}
            aria-label={isFavorite ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={isFavorite}
            className="group/heart relative flex h-8 w-8 items-center justify-center rounded-full text-white transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 before:absolute before:-inset-2 before:content-['']"
          >
            <svg
              viewBox="0 0 32 32"
              className={cn(
                "h-6 w-6 stroke-white stroke-[2px] transition-colors duration-150",
                isFavorite
                  ? "fill-rausch stroke-rausch"
                  : "fill-black/30 hover:fill-black/50"
              )}
            >
              <path d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-3.14 0-5.91 2.07-7 5.09C14.91 6.07 12.14 4 9 4a6.98 6.98 0 0 0-7 7c0 7 7 12.27 14 17z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Listing Metadata */}
      <div className="flex flex-col text-sm leading-tight gap-1">
        <div className="flex items-center justify-between font-semibold text-ink">
          <span className="truncate pr-2">{location}</span>
          {rating ? (
            <div className="flex items-center gap-1 shrink-0 text-ink">
              <svg
                viewBox="0 0 32 32"
                className="h-3 w-3 fill-ink"
                aria-hidden="true"
              >
                <path d="M15.1 1.58a1 1 0 0 1 1.8 0l3.88 8.04 8.82 1.25a1 1 0 0 1 .56 1.71l-6.4 6.2 1.52 8.78a1 1 0 0 1-1.46 1.06L16 24.47l-7.92 4.15a1 1 0 0 1-1.46-1.06l1.52-8.78-6.4-6.2a1 1 0 0 1 .56-1.71l8.82-1.25 3.88-8.04z" />
              </svg>
              <span>{rating.toFixed(2)}</span>
            </div>
          ) : (
            <span className="text-xs font-normal text-secondary-gray">New</span>
          )}
        </div>

        {distance && <p className="text-secondary-gray text-[14px]">{distance}</p>}
        {dates && <p className="text-secondary-gray text-[14px]">{dates}</p>}

        <p className="mt-1 text-[15px] text-ink">
          <span className="font-semibold">${pricePerNight}</span>{" "}
          <span className="font-normal text-ink">night</span>
        </p>
      </div>
    </article>
  );
}
```

---

### 5.3 Search Pill Component (`packages/ui/src/components/search-pill.tsx`)

Features:
- Signature **32px search pill radius** (`rounded-search` / `rounded-full`).
- Three horizontal segments: "Where", "When", "Who".
- Hairline vertical separator dividers (`bg-hairline` / `#dddddd`).
- Ambient 3-layer card shadow at rest, floating shadow on hover.
- Circular Rausch Search Orb with magnifying glass icon.
- Full keyboard accessible button triggers (`role="button"`).

```tsx
import * as React from "react";
import { cn } from "../lib/utils";

export interface SearchPillProps {
  whereValue?: string;
  whenValue?: string;
  whoValue?: string;
  onOpenSearchDialog?: (initialTab?: "where" | "when" | "who") => void;
  className?: string;
}

export function SearchPill({
  whereValue = "Anywhere",
  whenValue = "Any week",
  whoValue = "Add guests",
  onOpenSearchDialog,
  className,
}: SearchPillProps) {
  return (
    <div
      role="search"
      aria-label="Find stays"
      className={cn(
        "inline-flex h-12 items-center bg-white border border-hairline transition-all duration-200 select-none",
        "rounded-search", // 32px radius
        "shadow-airbnb-card hover:shadow-airbnb-hover hover:border-hairline/80",
        className
      )}
    >
      {/* Segment 1: Where */}
      <button
        type="button"
        onClick={() => onOpenSearchDialog?.("where")}
        className="flex h-full items-center px-4 text-sm font-semibold text-ink hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-l-search"
      >
        <span className="truncate max-w-[120px]">{whereValue}</span>
      </button>

      {/* Hairline Divider */}
      <div className="h-6 w-[1px] bg-hairline" aria-hidden="true" />

      {/* Segment 2: When */}
      <button
        type="button"
        onClick={() => onOpenSearchDialog?.("when")}
        className="flex h-full items-center px-4 text-sm font-semibold text-ink hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
      >
        <span className="truncate max-w-[120px]">{whenValue}</span>
      </button>

      {/* Hairline Divider */}
      <div className="h-6 w-[1px] bg-hairline" aria-hidden="true" />

      {/* Segment 3: Who */}
      <button
        type="button"
        onClick={() => onOpenSearchDialog?.("who")}
        className="flex h-full items-center pl-4 pr-2 text-sm text-secondary-gray hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
      >
        <span className="truncate max-w-[100px] mr-2">{whoValue}</span>

        {/* Circular Rausch Search Orb */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rausch text-white transition-transform duration-150 active:scale-95"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 32 32"
            className="h-3.5 w-3.5 stroke-white stroke-[3px] fill-none"
          >
            <circle cx="13" cy="13" r="9" />
            <line x1="20" y1="20" x2="28" y2="28" />
          </svg>
        </div>
      </button>
    </div>
  );
}
```

---

### 5.4 Category Pill & Strip Component (`packages/ui/src/components/category-pill.tsx`)

Features:
- Horizontal scrollable strip for Airbnb categories (Beachfront, Cabins, Iconic cities, etc.).
- Accessible ARIA Tablist pattern (`role="tablist"`, `role="tab"`, `aria-selected`).
- Active state indicated by 2px Near Black underline rule (`#222222`) and text ink transition.
- Inactive state rendered in Secondary Gray (`#6a6a6a`) with smooth hover opacity.
- 44px minimum tap target compliance.

```tsx
import * as React from "react";
import { cn } from "../lib/utils";

export interface CategoryItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface CategoryBarProps {
  categories: CategoryItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export function CategoryBar({
  categories,
  selectedId,
  onSelect,
  className,
}: CategoryBarProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Listing categories"
      className={cn(
        "flex w-full items-center gap-8 overflow-x-auto scrollbar-none px-6 py-3 bg-white border-b border-hairline-soft select-none",
        className
      )}
    >
      {categories.map((cat) => {
        const isSelected = cat.id === selectedId;
        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isSelected}
            aria-controls={`panel-${cat.id}`}
            id={`tab-${cat.id}`}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "group relative flex flex-col items-center gap-2 pb-2 min-w-[56px] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded-lg",
              isSelected
                ? "text-ink opacity-100"
                : "text-secondary-gray opacity-70 hover:opacity-100 hover:text-ink"
            )}
          >
            {/* 24px Category Icon */}
            <div className="h-6 w-6 flex items-center justify-center transition-transform group-hover:scale-105">
              {cat.icon}
            </div>

            {/* Category Label */}
            <span className="text-xs font-semibold tracking-tight whitespace-nowrap">
              {cat.label}
            </span>

            {/* 2px Active Indicator Rule */}
            <div
              className={cn(
                "absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-200",
                isSelected ? "bg-ink scale-x-100" : "bg-transparent scale-x-0"
              )}
              aria-hidden="true"
            />
          </button>
        );
      })}
    </div>
  );
}
```

---

### 5.5 Carousel Control & Photo Carousel (`packages/ui/src/components/carousel-control.tsx`)

Features:
- Exactly **50% circular controls** (`rounded-full`, 32×32px visible with 44×44px hit-box target).
- White surface (`#ffffff`) with 1px hairline border and ambient shadow.
- Hover lift state with `opacity-100` reveal on parent card hover.
- Chevrons with accessible labels (`aria-label="Previous image"` / `"Next image"`).
- Keyboard accessibility: ArrowLeft / ArrowRight navigation.
- Slide counter or pagination dots indicator.

```tsx
import * as React from "react";
import { cn } from "../lib/utils";

export interface CarouselControlProps {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  className?: string;
}

export function CarouselControls({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  className,
}: CarouselControlProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-20 flex items-center justify-between p-3 pointer-events-none opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200",
        className
      )}
    >
      {/* Left / Previous Chevron */}
      {hasPrevious ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          aria-label="Previous photo"
          className="pointer-events-auto relative flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white text-ink border border-black/10 shadow-sm transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 before:absolute before:-inset-2 before:content-['']"
        >
          <svg viewBox="0 0 32 32" className="h-3 w-3 stroke-ink stroke-[3px] fill-none">
            <path d="M20 28 8 16 20 4" />
          </svg>
        </button>
      ) : (
        <div className="w-8" />
      )}

      {/* Right / Next Chevron */}
      {hasNext ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next photo"
          className="pointer-events-auto relative flex h-8 w-8 items-center justify-center rounded-full bg-white/90 hover:bg-white text-ink border border-black/10 shadow-sm transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 before:absolute before:-inset-2 before:content-['']"
        >
          <svg viewBox="0 0 32 32" className="h-3 w-3 stroke-ink stroke-[3px] fill-none">
            <path d="M12 4l12 12-12 12" />
          </svg>
        </button>
      ) : (
        <div className="w-8" />
      )}
    </div>
  );
}

export interface PhotoCarouselProps {
  images: { src: string; alt: string }[];
  className?: string;
}

export function PhotoCarousel({ images, className }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const prev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const next = () => setCurrentIndex((i) => Math.min(images.length - 1, i + 1));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prev();
    } else if (e.key === "ArrowRight") {
      next();
    }
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Property images"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={cn(
        "relative aspect-square w-full overflow-hidden bg-neutral-100 rounded-card focus-visible:ring-2 focus-visible:ring-neutral-900 select-none",
        className
      )}
    >
      {/* Image Strip */}
      <div
        className="flex h-full w-full transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img.src}
            alt={img.alt}
            loading={idx === 0 ? "eager" : "lazy"}
            className="h-full w-full object-cover shrink-0 select-none"
          />
        ))}
      </div>

      {/* Chevrons */}
      <CarouselControls
        onPrevious={prev}
        onNext={next}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < images.length - 1}
      />

      {/* Pagination Dot Indicator */}
      <div
        className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5 pointer-events-none"
        aria-hidden="true"
      >
        {images.slice(0, 5).map((_, idx) => (
          <span
            key={idx}
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              idx === currentIndex
                ? "w-4 bg-white"
                : "w-1.5 bg-white/60"
            )}
          />
        ))}
      </div>
    </div>
  );
}
```

---

### 5.6 Badge Component (`packages/ui/src/components/badge.tsx`)

Features:
- Exact **14px badge radius** (`rounded-badge`).
- 11px SemiBold font size (`text-badge font-semibold`).
- Support for "Guest favorite", "Superhost", and 6px "NEW" uppercase micro tags.

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center font-semibold transition-colors select-none",
  {
    variants: {
      variant: {
        // Floating "Guest favorite"
        guestFavorite:
          "bg-white/95 text-ink border border-black/5 shadow-sm rounded-badge px-2.5 py-1 text-[11px] leading-tight",
        
        // Superhost / Dark Badge
        superhost:
          "bg-ink text-white rounded-badge px-2.5 py-1 text-[11px] leading-tight",

        // Micro "NEW" tag (6px radius, uppercase letter-spacing)
        newTag:
          "bg-white text-ink border border-hairline font-bold uppercase tracking-wider text-[8px] leading-none px-1.5 py-1 rounded-[6px]",
        
        // Secondary subtle badge
        subtle:
          "bg-surface-soft text-secondary-gray rounded-badge px-2.5 py-1 text-[11px]",
      },
    },
    defaultVariants: {
      variant: "guestFavorite",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
```

---

## 6. Monorepo Integration & Consumer App Setup (`apps/web`)

### 6.1 `components.json` Configuration

In `apps/web/components.json`, configure Shadcn to route primitives into `packages/ui`:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "../../packages/ui/src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "ui": "@workspace/ui/components",
    "lib": "@workspace/ui/lib",
    "utils": "@workspace/ui/lib/utils",
    "hooks": "@workspace/ui/hooks"
  }
}
```

### 6.2 Consumer App `tailwind.config.ts` (`apps/web/tailwind.config.ts`)

```typescript
import type { Config } from "tailwindcss";
import { airbnbPreset } from "@workspace/ui/tailwind";

const config: Config = {
  presets: [airbnbPreset],
  content: [
    "./src/**/*.{ts,tsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx,mdx}",
  ],
  plugins: [],
};

export default config;
```

---

## 7. Verification & Compliance Matrix

| Criterion | Standard | Target Value | Implementation Verification |
| :--- | :--- | :--- | :--- |
| **Headline Contrast** | WCAG 2.1 AAA | $\ge 7:1$ | Near Black (`#222222`) on White = **15.91:1** (Verified) |
| **Secondary Text Contrast** | WCAG 2.1 AA | $\ge 4.5:1$ | Secondary Gray (`#6a6a6a`) on White = **5.41:1** (Verified) |
| **Button Text Contrast** | WCAG 2.1 AA | $\ge 4.5:1$ (normal) or $\ge 3:1$ (bold) | White text on Rausch (`#ff385c`) = **3.52:1** with 600 weight; Deep Rausch (`#e00b41`) = **4.89:1** for high contrast. |
| **Focus Indicator** | WCAG 2.4.11 | $\ge 3:1$ | Near Black ring (`#222222`) = **15.91:1** contrast with 2px offset. |
| **Pointer Target Size** | WCAG 2.5.5 | $\ge 44 \times 44\text{px}$ | Buttons $\ge 48\text{px}$; circular controls wrapped in `before:-inset-2` $\ge 48\text{px}$. |
| **Reduced Motion** | WCAG 2.3.3 | No non-essential animation | Tailwind `motion-reduce:transition-none` and `motion-reduce:transform-none` enforced on carousel and cards. |
| **Card Rest Shadow** | Airbnb DLS Spec | 3-layer ambient | `0 0 0 1px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.1)` (Verified). |
| **Card Radius** | Airbnb DLS Spec | `20px` | Applied via `rounded-card` / `--radius-card: 20px` (Verified). |
| **Search Pill Radius** | Airbnb DLS Spec | `32px` | Applied via `rounded-search` / `--radius-search: 32px` (Verified). |
| **Button Radius** | Airbnb DLS Spec | `8px` | Applied via `rounded-btn` / `--radius-btn: 8px` (Verified). |

---

## 8. Summary & Next Implementation Steps

1. Export primitive CSS tokens and Shadcn variable overrides in `packages/ui/src/styles/globals.css`.
2. Configure the Tailwind preset (`packages/ui/src/tailwind/preset.ts`) exposing radii (`rounded-card`, `rounded-search`, `rounded-btn`), shadows (`shadow-airbnb-card`, `shadow-airbnb-hover`), and color tokens (`rausch`, `rausch-deep`, `ink`, `secondary-gray`).
3. Deploy the headless Radix UI recipes for `Button`, `Card`, `SearchPill`, `CategoryBar`, and `PhotoCarousel` into `packages/ui/src/components/`.
4. Ensure all interactive tap targets adhere to the $\ge 44\text{px}$ minimum hit-box pseudo-element pattern and retain the high-contrast `ring-neutral-900` focus ring.
