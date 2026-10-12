# Prototype Airbnb Category Bar and Floating Search Bar Navigation Header

Type: prototype
Status: resolved
Assignee: omp
Blocked by: 01

## Question

How should the signature Airbnb navigation header—featuring the responsive search pill ("Anywhere · Any week · Add guests") that expands into the full multi-field modal, and the horizontal scrollable category pill slider with circular navigation buttons—be structured and styled in Next.js with Framer Motion and Radix UI?

## Answer

Resolved by UI prototype on branch `prototype/04-airbnb-category-and-search-header` (commits `aa7161a`, `bdb6ebd`).
Full interactive prototype: `prototype/index.html` (runnable via `bun run prototype` or direct browser open).
Full architectural specification documented in `docs/prototypes/04-airbnb-category-and-search-header.md`.

Key Findings & Architectural Decisions (Human-Validated Winner):
1. **Synthesized Winner (Variant A Expansion + Variant C 3-Segment Stacked Pill)**:
   - **Desktop ($\ge 768\text{px}$)**: Adopted **Variant A** (Inline Header Expansion) combined with the 3-segment stacked search pill from **Variant C**:
     - Segment 1: `WHERE` (uppercase 10px tracking label) over `I'm flexible` (or destination text).
     - Segment 2: `DATES` (uppercase 10px tracking label) over `Nov 14 – Nov 18` (unified date range).
     - Segment 3: `GUESTS` (uppercase 10px tracking label) over `7 guests` (aggregate count).
     - **Active Segment Boundary**: Active/focused segment receives a crisp black enclosed rounded pill border (`border-2 border-black bg-white rounded-full px-6 py-2 shadow-sm`).
     - **Search Orb**: 40px circular Rausch Red button with white magnifying glass icon.
     - **Expansion & Dropdowns**: Clicking any segment reveals Stays / Experiences tabs and opens the corresponding anchored Radix Popover (`WHERE` -> Region grid; `DATES` -> Calendar range picker; `GUESTS` -> Adults/Children/Infants/Pets steppers) with backdrop dimming.
   - **Mobile / Touch ($< 768\text{px}$)**: Adopted **Variant B** (Radix `Dialog` Modal Flow) with a 3-step progressive accordion sheet to avoid mobile viewport overflow and virtual keyboard occlusion.
2. **Category Bar Mechanics**:
   - Horizontal flex container with dynamic left/right chevron buttons conditionally mounted based on `scrollLeft` threshold ($>10\text{px}$) and remaining scroll width.
   - 64px linear gradient edge masks (`gradient-mask-left` and `gradient-mask-right`) eliminating hard clipping on viewport boundaries.
   - Active category indicated via an animated 2px Near Black underline with Framer Motion `layoutId="categoryUnderline"` on desktop, and a high-contrast filled pill chip on mobile.
3. **State Management**:
   - Search filters (`destination`, `checkIn`, `checkOut`, `guests`, `category`) are synchronized to URL search params (`useSearchFilters` hook), ensuring zero desynchronization between desktop and mobile variants and enabling shareable search URLs.
