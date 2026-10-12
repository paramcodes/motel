# Research Airbnb Design System Token Integration with Tailwind and Radix

Type: research
Status: resolved
Blocked by: 

## Question

How should the Airbnb Design Language System tokens (Canvas White `#ffffff`, Rausch Red `#ff385c`, Deep Rausch `#e00b41`, Near Black `#222222`, Secondary Gray `#6a6a6a`, three-layer card shadow `rgba(0,0,0,0.02) 0px 0px 0px 1px, rgba(0,0,0,0.04) 0px 2px 6px, rgba(0,0,0,0.1) 0px 4px 8px`, 20px card radius, circular 50% controls, and Airbnb Cereal VF / rounded sans typography) be structured in `packages/ui` using Tailwind CSS and Radix UI / Shadcn primitives without sacrificing accessibility?

## Answer

Resolved by research subagent on branch `research/01-airbnb-design-tokens-tailwind-radix` (commit `b4d2a02`).
Full specification documented in `docs/research/01-airbnb-design-tokens-tailwind-radix.md`.

Key Findings:
1. Palette tokens: Pure Canvas White `#ffffff`, Rausch Red `#ff385c` (singular voltage accent), Deep Rausch `#e00b41` (accessible text links and active states), Near Black `#222222` (primary typography), and Secondary Gray `#6a6a6a`.
2. Radii tokens: 20px cards (`rounded-[20px]`), 32px search pill (`rounded-[32px]`), 14px badges (`rounded-[14px]`), 8px buttons (`rounded-[8px]`), 50% circular controls (`rounded-full`).
3. Elevation: Three-layer ambient rest shadow (`0 0 0 1px rgba(0,0,0,0.02), 0 2px 6px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.10)`) and single 12px diffuse hover float (`0 0 0 1px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.08)`).
4. Typography: Airbnb Cereal VF with system fallbacks, tight negative letter-spacing on display headings (-0.02em / -0.44px at 22px), and weights restricted to 500 Medium, 600 SemiBold, 700 Bold.
5. Accessibility: WCAG AA contrast compliance maintained using Deep Rausch for text links, high-contrast `ring-neutral-900` focus outlines, and pseudo-element tap-target expansion ensuring minimum 44px pointer hit areas.
