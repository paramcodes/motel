# Prototype Airbnb Category Bar and Floating Search Bar Navigation Header

Type: prototype
Status: resolved
Assignee: omp
Blocked by: 01

## Question

How should the signature Airbnb navigation header—featuring the responsive search pill ("Anywhere · Any week · Add guests") that expands into the full multi-field modal, and the horizontal scrollable category pill slider with circular navigation buttons—be structured and styled in Next.js with Framer Motion and Radix UI?

## Answer

Resolved by UI prototype on branch `prototype/04-airbnb-category-and-search-header` (commit `aa7161a`).
Full interactive prototype: `prototype/index.html` (runnable via `bun run prototype` or direct browser open).
Full architectural specification documented in `docs/prototypes/04-airbnb-category-and-search-header.md`.

Key Findings & Architectural Decisions:
1. **Responsive Hybrid Pattern**:
   - **Desktop ($\ge 768\text{px}$)**: Adopted **Variant A** (Canonical Inline Header Expansion). Sits at rest in an 80px bar with a compact 3-segment pill (`Anywhere` · `Any week` · `Add guests` + 32px Rausch Red orb), expanding to 168px on interaction using Framer Motion spring layout physics (`layout`, `stiffness: 300, damping: 28`) to reveal Stays/Experiences tabs and a 4-segment search container (`Where`, `Check in`, `Check out`, `Who`) with anchored Radix Popovers.
   - **Mobile / Touch ($< 768\text{px}$)**: Adopted **Variant B** (Radix `Dialog` Modal Flow). Avoids desktop header overflow and virtual keyboard occlusion on mobile screens by launching a dedicated modal sheet with a 3-step progressive accordion.
2. **Category Bar Mechanics**:
   - Horizontal flex container with dynamic left/right chevron buttons conditionally mounted based on `scrollLeft` threshold ($>10\text{px}$) and remaining scroll width.
   - 64px linear gradient edge masks (`gradient-mask-left` and `gradient-mask-right`) eliminating hard clipping on viewport boundaries.
   - Active category indicated via an animated 2px Near Black underline with Framer Motion `layoutId="categoryUnderline"` on desktop, and a high-contrast filled pill chip on mobile.
3. **State Management**:
   - Search filters (`destination`, `checkIn`, `checkOut`, `guests`, `category`) are synchronized to URL search params (`useSearchFilters` hook), ensuring zero desynchronization between desktop and mobile variants and enabling shareable search URLs.
